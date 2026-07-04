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

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
function getNoteName(midi: number | null): string {
    if (midi === null) return 'None';
    const noteIndex = midi % 12;
    const octave = Math.floor(midi / 12) - 1;
    return `${NOTE_NAMES[noteIndex]}${octave}`;
}

export function useAudioInput(expectedNotesRef?: React.RefObject<number[]>) {
    const [isListening, setIsListening] = useState(false);
    const [detectedNote, setDetectedNote] = useState<number | null>(null);
    const [volume, setVolume] = useState(0);
    const [sensitivity, setSensitivity] = useState(() => {
        const saved = localStorage.getItem('pianopilot_mic_sensitivity');
        return saved ? Number(saved) : 0.006; // Lower default threshold (0.006) for quieter mics
    });

    const [isCalibrating, setIsCalibrating] = useState(false);
    const [calibrationProgress, setCalibrationProgress] = useState(0);
    const [calibrationStep, setCalibrationStep] = useState<'idle' | 'silence' | 'strike' | 'success' | 'failed'>('idle');
    const [calibrationTargetNote] = useState('C4 (Middle C)');

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
        setCalibrationStep('silence');

        const wasListening = isListening;
        if (!wasListening) {
            await startListening();
        }

        const silenceDuration = 1500; // 1.5 seconds for ambient noise
        const silenceStart = performance.now();
        let maxAmbient = 0.002;

        // Step 1: Measure silence
        await new Promise<void>((resolve) => {
            const checkSilence = () => {
                const elapsed = performance.now() - silenceStart;
                const progress = Math.min(50, Math.round((elapsed / silenceDuration) * 50));
                setCalibrationProgress(progress);

                if (detectorRef.current) {
                    const currentVol = detectorRef.current.lastVolume;
                    if (currentVol > maxAmbient) {
                        maxAmbient = currentVol;
                    }
                }

                if (elapsed < silenceDuration) {
                    requestAnimationFrame(checkSilence);
                } else {
                    resolve();
                }
            };
            requestAnimationFrame(checkSilence);
        });

        // Step 2: Key strike instruction
        setCalibrationStep('strike');
        setCalibrationProgress(50);

        const strikeTimeout = 6000; // Wait up to 6 seconds for strike
        const strikeStart = performance.now();
        const calibrationTargetMidi = 60; // C4 (Middle C)
        let peakStrikeVolume = 0;
        let strikeDetected = false;

        await new Promise<void>((resolve) => {
            const checkStrike = () => {
                const elapsed = performance.now() - strikeStart;
                const progress = 50 + Math.min(50, Math.round((elapsed / strikeTimeout) * 50));
                setCalibrationProgress(progress);

                if (detectorRef.current) {
                    const currentVol = detectorRef.current.lastVolume;
                    const pitch = detectorRef.current.getPitch();
                    if (pitch && pitch > 0) {
                        const note = detectorRef.current.noteFromPitch(pitch);
                        // Check if the played note matches Middle C (60) with a 2-semitone tolerance
                        if (Math.abs(note - calibrationTargetMidi) <= 2 && currentVol > maxAmbient * 1.2) {
                            strikeDetected = true;
                            if (currentVol > peakStrikeVolume) {
                                peakStrikeVolume = currentVol;
                            }
                        }
                    }
                }

                // If strike is detected, wait a brief moment to capture peak, then resolve
                if (strikeDetected && peakStrikeVolume > 0 && (performance.now() - strikeStart > 1000)) {
                    resolve();
                } else if (elapsed < strikeTimeout) {
                    requestAnimationFrame(checkStrike);
                } else {
                    resolve(); // Timeout fallback
                }
            };
            requestAnimationFrame(checkStrike);
        });

        // Step 3: Calculate final threshold
        let finalThreshold = 0.015;
        if (peakStrikeVolume > 0) {
            // Set threshold at 30% of the active strike volume, ensuring it is above ambient noise
            finalThreshold = Math.max(maxAmbient * 1.5, peakStrikeVolume * 0.3);
            setCalibrationStep('success');
        } else {
            // Fallback to ambient noise calibration if no strike was detected
            finalThreshold = Math.max(0.005, maxAmbient + 0.003);
            setCalibrationStep('failed'); // Set step to failed but still compute a fallback sensitivity
        }

        // Clamp threshold to reasonable bounds
        finalThreshold = Math.min(0.04, Math.max(0.002, finalThreshold));
        setSensitivity(Number(finalThreshold.toFixed(4)));
        setIsCalibrating(false);

        // Wait 1.5 seconds to show success/failed state, then reset step to idle
        setTimeout(() => {
            setCalibrationStep('idle');
            if (!wasListening) {
                stopListening();
            }
        }, 1500);
    };

    useEffect(() => {
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const detectedNoteName = getNoteName(detectedNote);

    return {
        isListening,
        detectedNote,
        detectedNoteName,
        volume,
        sensitivity,
        setSensitivity,
        startListening,
        stopListening,
        isCalibrating,
        calibrationProgress,
        calibrateMicrophone,
        calibrationStep,
        calibrationTargetNote,
        availableMics,
        selectedMicId,
        activeMicLabel,
        changeMicrophone
    };
}
