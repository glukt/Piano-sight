import { useState, useRef, useEffect, useCallback } from 'react';
import { PitchDetector } from '../audio/PitchDetector';

// Helper function to calculate median of window
function getMedian(values: (number | null)[]): number | null {
    const nonNulls = values.filter((v): v is number => v !== null);
    if (nonNulls.length < Math.ceil(values.length / 2)) {
        return null;
    }
    nonNulls.sort((a, b) => a - b);
    return nonNulls[Math.floor(nonNulls.length / 2)];
}

export function useAudioInput(expectedNotesRef?: React.RefObject<number[]>) {
    const [isListening, setIsListening] = useState(false);
    const [detectedNote, setDetectedNote] = useState<number | null>(null);
    const [volume, setVolume] = useState(0);
    const [sensitivity, setSensitivity] = useState(() => {
        const saved = localStorage.getItem('pianopilot_mic_sensitivity');
        return saved ? Number(saved) : 0.015; // Set a slightly more robust default threshold
    });

    const [isCalibrating, setIsCalibrating] = useState(false);
    const [calibrationProgress, setCalibrationProgress] = useState(0);

    // Microphone device selection states
    const [availableMics, setAvailableMics] = useState<MediaDeviceInfo[]>([]);
    const [selectedMicId, setSelectedMicId] = useState<string>(() => {
        return localStorage.getItem('pianopilot_selected_mic_id') || '';
    });
    const [activeMicLabel, setActiveMicLabel] = useState<string>('Default Microphone');

    const detectorRef = useRef<PitchDetector | null>(null);
    const requestRef = useRef<number>();
    const lastVolumeUpdate = useRef<number>(0);

    // Audio Context reference
    const audioContextRef = useRef<AudioContext | null>(null);

    // sliding window queue for median filtering
    const pitchQueueRef = useRef<(number | null)[]>(new Array(5).fill(null));

    // Enumerate devices on mount to see if permission was already granted
    const updateDeviceList = useCallback(async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const mics = devices.filter(d => d.kind === 'audioinput');
            setAvailableMics(mics);
            // If we have mics and none is selected, default to the first one
            if (mics.length > 0 && !selectedMicId) {
                const defaultMic = mics.find(m => m.deviceId === 'default') || mics[0];
                setSelectedMicId(defaultMic.deviceId);
            }
        } catch (e) {
            console.warn("Failed to enumerate audio devices:", e);
        }
    }, [selectedMicId]);

    useEffect(() => {
        updateDeviceList();
    }, [updateDeviceList]);

    // Sync sensitivity to the pitch detector
    useEffect(() => {
        if (detectorRef.current) {
            detectorRef.current.noiseGateThreshold = sensitivity;
        }
        localStorage.setItem('pianopilot_mic_sensitivity', sensitivity.toString());
    }, [sensitivity]);

    const updatePitch = useCallback(() => {
        if (!detectorRef.current) return;

        const pitch = detectorRef.current.getPitch(expectedNotesRef?.current || undefined);
        let currentNote: number | null = null;
        if (pitch && pitch > 0) {
            const note = detectorRef.current.noteFromPitch(pitch);
            if (note >= 21 && note <= 108) {
                currentNote = note;
            }
        }

        // Shift queue and push new sample
        pitchQueueRef.current.shift();
        pitchQueueRef.current.push(currentNote);

        // Apply median filter
        const smoothedNote = getMedian(pitchQueueRef.current);
        setDetectedNote(smoothedNote);

        // Get volume from detector for UI feedback
        const now = performance.now();
        if (now - lastVolumeUpdate.current > 50) { // 20Hz update for volume meter
            const vol = detectorRef.current.lastVolume;
            setVolume(vol);
            lastVolumeUpdate.current = now;
        }

        requestRef.current = requestAnimationFrame(updatePitch);
    }, [expectedNotesRef]);

    const startListening = async (deviceId?: string) => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }

            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            if (!detectorRef.current) {
                detectorRef.current = new PitchDetector(audioContextRef.current);
            }
            detectorRef.current.noiseGateThreshold = sensitivity;

            const activeId = deviceId || selectedMicId || undefined;
            await detectorRef.current.init(activeId);
            setActiveMicLabel(detectorRef.current.activeMicLabel);
            
            setIsListening(true);
            requestRef.current = requestAnimationFrame(updatePitch);

            // Re-enumerate devices since permission is now guaranteed
            await updateDeviceList();
        } catch (err) {
            console.error("Failed to start audio input", err);
            setIsListening(false);
        }
    };

    const stopListening = () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        setIsListening(false);
        setDetectedNote(null);
        pitchQueueRef.current.fill(null);
        if (detectorRef.current) {
            detectorRef.current.stop();
            detectorRef.current = null;
        }
    };

    const changeMicrophone = async (deviceId: string) => {
        setSelectedMicId(deviceId);
        localStorage.setItem('pianopilot_selected_mic_id', deviceId);
        
        // Find label
        const match = availableMics.find(d => d.deviceId === deviceId);
        if (match) {
            setActiveMicLabel(match.label);
        }

        if (isListening) {
            await startListening(deviceId);
        }
    };

    // Automated microphone calibration routine
    const calibrateMicrophone = async () => {
        if (isCalibrating) return;
        setIsCalibrating(true);
        setCalibrationProgress(0);

        const wasListening = isListening;
        if (!wasListening) {
            await startListening();
        }

        const duration = 2000; // Calibrate over 2 seconds
        const start = performance.now();
        let maxVolume = 0;

        return new Promise<void>((resolve) => {
            const check = () => {
                const elapsed = performance.now() - start;
                const progress = Math.min(100, Math.round((elapsed / duration) * 100));
                setCalibrationProgress(progress);

                if (detectorRef.current) {
                    const currentVol = detectorRef.current.lastVolume;
                    if (currentVol > maxVolume) {
                        maxVolume = currentVol;
                    }
                }

                if (elapsed < duration) {
                    requestAnimationFrame(check);
                } else {
                    // Calibration finished. Set threshold above max observed ambient noise
                    const finalThreshold = Math.max(0.005, maxVolume + 0.003);
                    setSensitivity(Number(finalThreshold.toFixed(4)));
                    setIsCalibrating(false);
                    
                    if (!wasListening) {
                        stopListening();
                    }
                    resolve();
                }
            };
            requestAnimationFrame(check);
        });
    };

    useEffect(() => {
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return {
        isListening,
        detectedNote,
        volume,
        sensitivity,
        setSensitivity,
        startListening,
        stopListening,
        isCalibrating,
        calibrationProgress,
        calibrateMicrophone,
        availableMics,
        selectedMicId,
        activeMicLabel,
        changeMicrophone
    };
}
