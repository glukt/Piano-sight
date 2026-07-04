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
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: false
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
        let pitch = this.autoCorrelateMPM(this.buffer as any, this.audioContext.sampleRate);

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

    // McLeod Pitch Method (MPM) with 4x decimation
    private autoCorrelateMPM(buf: Float32Array, sampleRate: number): number {
        const factor = 4;
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

        // Calculate Normalized Square Difference Function (NSDF)
        const nsdf = new Float32Array(n / 2);
        for (let tau = 0; tau < n / 2; tau++) {
            let acf = 0;
            let sq1 = 0;
            let sq2 = 0;
            for (let t = 0; t < n / 2; t++) {
                acf += dsBuf[t] * dsBuf[t + tau];
                sq1 += dsBuf[t] * dsBuf[t];
                sq2 += dsBuf[t + tau] * dsBuf[t + tau];
            }
            const denom = sq1 + sq2;
            nsdf[tau] = denom > 0.0001 ? (2 * acf) / denom : 0;
        }

        // Peak picking: find local maxima of NSDF above threshold
        const peaks: { pos: number; val: number }[] = [];
        for (let i = 1; i < nsdf.length - 1; i++) {
            if (nsdf[i] > nsdf[i - 1] && nsdf[i] > nsdf[i + 1]) {
                if (nsdf[i] > 0.45) {
                    peaks.push({ pos: i, val: nsdf[i] });
                }
            }
        }

        if (peaks.length === 0) return -1;

        // Find the absolute highest peak value
        let highestPeakVal = 0;
        for (const p of peaks) {
            if (p.val > highestPeakVal) highestPeakVal = p.val;
        }

        // Choose the first peak within 90% of the highest peak to avoid octave-halving
        const peakThreshold = highestPeakVal * 0.9;
        let chosenPeriod = -1;
        for (const p of peaks) {
            if (p.val >= peakThreshold) {
                chosenPeriod = p.pos;
                break;
            }
        }

        if (chosenPeriod === -1) return -1;

        // Parabolic interpolation for sub-sample accuracy
        let T0 = chosenPeriod;
        if (T0 > 0 && T0 < nsdf.length - 1) {
            const x1 = nsdf[T0 - 1];
            const x2 = nsdf[T0];
            const x3 = nsdf[T0 + 1];
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
