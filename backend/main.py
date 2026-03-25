import os
import sys
import numpy
import fastapi
from typing import List, Any
import numpy as np
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    import models
    import schemas
    import auth
    import recognition
    import database
    from database import engine, get_db
except ImportError:
    from . import models, schemas, auth, recognition, database
    from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Attendance System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Admin Auth Endpoint
@app.post("/api/auth/login", response_model=schemas.Token)
def login(form_data: schemas.LoginRequest):
    if form_data.username == "admin" and form_data.password == "admin":
        access_token = auth.create_access_token(data={"sub": form_data.username})
        return {"access_token": access_token, "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

# Recognition & Attendance
@app.post("/api/attendance", response_model=schemas.AttendanceResponse)
async def mark_attendance(
    image_base64: str = Form(...),
    liveness_score: str = Form(...),
    db: Session = Depends(get_db)
):
    encoding = recognition.get_face_encoding_from_base64(image_base64)
    if encoding is None:
        raise HTTPException(status_code=400, detail="No face detected in image")

    users = db.query(models.User).all()
    matched_user = None

    for user in users:
        if recognition.compare_faces(user.face_encoding, encoding):
            matched_user = user
            break

    if not matched_user:
        raise HTTPException(status_code=404, detail="User not recognized")

    temp_user = matched_user
    if temp_user is not None:
        matched_id = getattr(temp_user, 'id', None)
        if matched_id is None:
            raise HTTPException(status_code=500, detail="User data inconsistency")
    else:
        raise HTTPException(status_code=404, detail="User not recognized")

    # Check if attendance already marked within the last 1 hour
    one_hour_ago = datetime.utcnow() - timedelta(hours=1)
    recent_attendance = db.query(models.Attendance).filter(
        models.Attendance.user_id == matched_id,
        models.Attendance.timestamp >= one_hour_ago
    ).first()

    if recent_attendance:
        next_allowed = recent_attendance.timestamp + timedelta(hours=1)
        minutes_remaining = int((next_allowed - datetime.utcnow()).total_seconds() / 60)
        raise HTTPException(
            status_code=400,
            detail=f"Attendance already marked. Please try again in {minutes_remaining} minute(s)."
        )

    attendance = models.Attendance(
        user_id=matched_id,
        status="Present",
        liveness_score=liveness_score
    )
    db.add(attendance)
    db.commit()
    db.refresh(attendance)

    attendance.user = matched_user
    return attendance

# User Management
@app.post("/api/users", response_model=schemas.UserResponse)
async def create_user(
    full_name: str = Form(...),
    department: str = Form(...),
    image_base64: str = Form(...),
    db: Session = Depends(get_db)
):
    encoding = recognition.get_face_encoding_from_base64(image_base64)
    if encoding is None:
        raise HTTPException(status_code=400, detail="Could not extract face encoding")

    encoding_str = ",".join(map(str, encoding.tolist()))

    db_user = models.User(
        full_name=full_name,
        department=department,
        face_encoding=encoding_str
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/api/users", response_model=List[schemas.UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@app.delete("/api/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}

@app.get("/api/attendance", response_model=List[schemas.AttendanceResponse])
def get_attendance_logs(db: Session = Depends(get_db)):
    logs = db.query(models.Attendance).all()
    for log in logs:
        user = db.query(models.User).filter(models.User.id == log.user_id).first()
        if user:
            log.user = user
    return logs

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
