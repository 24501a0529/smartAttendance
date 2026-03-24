import { useRef, useEffect, useCallback, useState } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import * as cam from '@mediapipe/camera_utils';

export const useFaceMesh = (videoRef) => {
    const [isLivenessValid, setIsLivenessValid] = useState(false);
    const [livenessStatus, setLivenessStatus] = useState('Detecting face...');
    const [blinkCount, setBlinkCount] = useState(0);
    const faceMeshRef = useRef(null);

    // Liveness detection state
    const lastEyeStatus = useRef({ left: true, right: true }); // true = open
    const headPos = useRef({ x: 0, y: 0 });

    const onResults = useCallback((results) => {
        if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
            setLivenessStatus('No face detected');
            setIsLivenessValid(false);
            return;
        }

        const landmarks = results.multiFaceLandmarks[0];

        // Blink detection (simplified EAR-like logic)
        // Left eye: 159 (top), 145 (bottom)
        // Right eye: 386 (top), 374 (bottom)
        const leftEyeDistance = Math.abs(landmarks[159].y - landmarks[145].y);
        const rightEyeDistance = Math.abs(landmarks[386].y - landmarks[374].y);

        const isLeftClosed = leftEyeDistance < 0.015;
        const isRightClosed = rightEyeDistance < 0.015;

        if ((isLeftClosed || isRightClosed) && lastEyeStatus.current.left && lastEyeStatus.current.right) {
            setBlinkCount(prev => prev + 1);
            setLivenessStatus('Blink detected!');
        }

        lastEyeStatus.current = { left: !isLeftClosed, right: !isRightClosed };

        // Head turn detection
        // Nose tip: 1, Left edge: 234, Right edge: 454
        const noseX = landmarks[1].x;
        const faceLeft = landmarks[234].x;
        const faceRight = landmarks[454].x;
        const faceWidth = faceRight - faceLeft;
        const relativeNosePos = (noseX - faceLeft) / faceWidth;

        if (relativeNosePos < 0.35) {
            setLivenessStatus('Look left...');
        } else if (relativeNosePos > 0.65) {
            setLivenessStatus('Look right...');
        } else if (blinkCount >= 1) {
            setIsLivenessValid(true);
            setLivenessStatus('Liveness verified');
        } else {
            setLivenessStatus('Blink to verify');
        }

    }, [blinkCount]);

    useEffect(() => {
        const faceMesh = new FaceMesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            }
        });

        faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        faceMesh.onResults(onResults);
        faceMeshRef.current = faceMesh;

        let camera = null;
        if (videoRef.current) {
            camera = new cam.Camera(videoRef.current, {
                onFrame: async () => {
                    await faceMesh.send({ image: videoRef.current });
                },
                width: 1280,
                height: 720
            });
            camera.start();
        }

        return () => {
            if (camera) camera.stop();
            faceMesh.close();
        };
    }, [videoRef, onResults]);

    const resetLiveness = useCallback(() => {
        setBlinkCount(0);
        setIsLivenessValid(false);
        setLivenessStatus('Restarting detection...');
    }, []);

    return { isLivenessValid, livenessStatus, resetLiveness };
};
