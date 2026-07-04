/**
 * PitchDetector.ts
 * Implements Autocorrelation algorithm to detect pitch from audio buffer.
 */

export class PitchDetector {
    private audioContext: AudioContext;
    private analyser: AnalyserNode;
    private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
    private buffer: Float32Array;

    // Pre-filtering nodes
    private lowpassFilter: BiquadFilterNode | null = null;
    private highpassFilter: BiquadFilterNode | null = null;

    public activeMicLabel: string = '';

    constructor(audioContext: AudioContext) {
        this.audioContext = audioContext;
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 4096; // 4096 size is required for low-frequency precision (A0 = 27.5Hz)
        this.buffer = new Float32Array(this.analyser.fftSize);
    }

    async init(deviceId?: string) {
        if (this.mediaStreamSource) {
            this.stop();
        }

        try {
            const constraints: MediaStreamConstraints = {
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: true
                }
            };
            if (deviceId) {
                (constraints.audio as any).deviceId = { exact: deviceId };
            }

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.activeMicLabel = stream.getAudioTracks()[0]?.label || 'Default Microphone';
            this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);

            // Create low-pass filter (cutoff 3000Hz to remove high noise but keep piano notes)
            this.lowpassFilter = this.audioContext.createBiquadFilter();
            this.lowpassFilter.type = 'lowpass';
            this.lowpassFilter.frequency.value = 3000;

            // Create high-pass filter (cutoff 50Hz to remove sub-bass room rumble/hum)
            this.highpassFilter = this.audioContext.createBiquadFilter();
            this.highpassFilter.type = 'highpass';
            this.highpassFilter.frequency.value = 50;

            // Connect: Stream -> Highpass -> Lowpass -> Analyser
            this.mediaStreamSource.connect(this.highpassFilter);
            this.highpassFilter.connect(this.lowpassFilter);
            this.lowpassFilter.connect(this.analyser);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            throw err;
        }
    }

    public lastVolume: number = 0;
    public noiseGateThreshold: number = 0.01;

    public getPitch(expectedMidiNotes?: number[]): number | null {
        this.analyser.getFloatTimeDomainData(this.buffer as any);
        let pitch = this.autoCorrelateYIN(this.buffer as any, this.audioContext.sampleRate);

        if (pitch === -1) {
            return null;
        }

        // Apply score-informed heuristics if expected MIDI notes are active
        if (expectedMidiNotes && expectedMidiNotes.length > 0) {
            const estimatedMidi = this.noteFromPitch(pitch);

            for (const expMidi of expectedMidiNotes) {
                // 1. Direct match (or within 1 semitone tolerance)
                if (Math.abs(estimatedMidi - expMidi) <= 1) {
                    // Lock to expected frequency for stability
                    return 440 * Math.pow(2, (expMidi - 69) / 12);
                }

                // 2. Harmonic/Octave match (check 1 octave below, 1 octave above, 2 octaves above, 12th/octave-fifth)
                const octaveOffsets = [-24, -12, 12, 19, 24];
                for (const offset of octaveOffsets) {
                    if (Math.abs((estimatedMidi - offset) - expMidi) <= 1) {
                        // Octave/Harmonic error detected! Correct it to the expected note's pitch
                        return 440 * Math.pow(2, (expMidi - 69) / 12);
                    }
                }
            }
        }

        return pitch;
    }

    // YIN Fundamental Frequency Estimator with 2x decimation
    private autoCorrelateYIN(buf: Float32Array, sampleRate: number): number {
        const factor = 2;
        const n = Math.floor(buf.length / factor);
        const dsBuf = new Float32Array(n);
        let rms = 0;

        // Downsample & calculate RMS
        for (let i = 0; i < n; i++) {
            const val = buf[i * factor];
            dsBuf[i] = val;
            rms += val * val;
        }
        rms = Math.sqrt(rms / n);
        this.lastVolume = rms;

        // Noise gate
        if (rms < this.noiseGateThreshold) return -1;

        const dsSampleRate = sampleRate / factor;
        
        // Define YIN parameters
        const W = 512; // Integration window size
        const minTau = 5; // Corresponding to ~4410Hz (C8 is 4186Hz)
        const maxTau = Math.min(820, Math.floor(n / 2)); // Capped at A0 (27.5Hz is ~802 samples)

        // 1. Difference function d(tau)
        const d = new Float32Array(maxTau);
        for (let tau = 0; tau < maxTau; tau++) {
            let sum = 0;
            for (let t = 0; t < W; t++) {
                const diff = dsBuf[t] - dsBuf[t + tau];
                sum += diff * diff;
            }
            d[tau] = sum;
        }

        // 2. Cumulative Mean Normalized Difference Function
        const dPrime = new Float32Array(maxTau);
        dPrime[0] = 1;
        let runningSum = 0;
        for (let tau = 1; tau < maxTau; tau++) {
            runningSum += d[tau];
            dPrime[tau] = runningSum > 0.0001 ? d[tau] / (runningSum / tau) : 1;
        }

        // 3. Absolute thresholding (YIN threshold is typically 0.10 to 0.15)
        const threshold = 0.15;
        let tauIndex = -1;
        for (let t = minTau; t < maxTau; t++) {
            if (dPrime[t] < threshold) {
                // Find local minimum
                while (t + 1 < maxTau && dPrime[t + 1] < dPrime[t]) {
                    t++;
                }
                tauIndex = t;
                break;
            }
        }

        // Fallback to global minimum if nothing falls below threshold
        if (tauIndex === -1) {
            let minVal = 1;
            for (let t = minTau; t < maxTau; t++) {
                if (dPrime[t] < minVal) {
                    minVal = dPrime[t];
                    tauIndex = t;
                }
            }
        }

        if (tauIndex === -1 || tauIndex === 0) return -1;

        // 4. Parabolic interpolation
        let T0 = tauIndex;
        if (T0 > 0 && T0 < maxTau - 1) {
            const x1 = dPrime[T0 - 1];
            const x2 = dPrime[T0];
            const x3 = dPrime[T0 + 1];
            const a = (x1 + x3 - 2 * x2) / 2;
            const b = (x3 - x1) / 2;
            if (Math.abs(a) > 0.00001) {
                T0 = T0 - b / (2 * a);
            }
        }

        return dsSampleRate / T0;
    }

    public noteFromPitch(frequency: number): number {
        const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
        return Math.round(noteNum) + 69;
    }

    public stop() {
        if (this.mediaStreamSource) {
            this.mediaStreamSource.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStreamSource.disconnect();
            this.mediaStreamSource = null;
        }
        if (this.lowpassFilter) {
            this.lowpassFilter.disconnect();
            this.lowpassFilter = null;
        }
        if (this.highpassFilter) {
            this.highpassFilter.disconnect();
            this.highpassFilter = null;
        }
    }
}
