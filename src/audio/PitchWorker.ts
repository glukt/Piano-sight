// src/audio/PitchWorker.ts

interface YINMessageData {
    buffer: Float32Array;
    sampleRate: number;
    noiseGateThreshold: number;
    expectedMidiNotes?: number[];
}

// Map MIDI note to frequency
const midiToFreq = (midi: number): number => {
    return 440 * Math.pow(2, (midi - 69) / 12);
};

// Map frequency to MIDI note
const noteFromPitch = (frequency: number): number => {
    const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
    return Math.round(noteNum) + 69;
};

// YIN Pitch Detection Algorithm
const runYIN = (buf: Float32Array, sampleRate: number, noiseGateThreshold: number, expectedMidiNotes?: number[]): { pitch: number | null; rms: number } => {
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

    // Noise gate
    if (rms < noiseGateThreshold) {
        return { pitch: null, rms };
    }

    const dsSampleRate = sampleRate / factor;
    const W = 512; // Integration window size
    const minTau = 5; // ~4410Hz

    // Dynamic search range based on expected notes for performance boost
    let maxTau = Math.min(820, Math.floor(n / 2));
    if (expectedMidiNotes && expectedMidiNotes.length > 0) {
        const lowestMidi = Math.min(...expectedMidiNotes);
        const safetyMidi = Math.max(21, lowestMidi - 5); // 5 semitones buffer below lowest note
        const freq = midiToFreq(safetyMidi);
        const computedTau = Math.ceil(dsSampleRate / freq);
        maxTau = Math.min(820, Math.max(minTau + 20, computedTau));
    }

    // 1. Difference function
    const d = new Float32Array(maxTau);
    for (let tau = 0; tau < maxTau; tau++) {
        let sum = 0;
        for (let t = 0; t < W; t++) {
            const diff = dsBuf[t] - dsBuf[t + tau];
            sum += diff * diff;
        }
        d[tau] = sum;
    }

    // 2. Cumulative Mean Normalized Difference
    const dPrime = new Float32Array(maxTau);
    dPrime[0] = 1;
    let runningSum = 0;
    for (let tau = 1; tau < maxTau; tau++) {
        runningSum += d[tau];
        dPrime[tau] = runningSum > 0.0001 ? d[tau] / (runningSum / tau) : 1;
    }

    // 3. Absolute thresholding
    const threshold = 0.15;
    let tauIndex = -1;
    for (let t = minTau; t < maxTau; t++) {
        if (dPrime[t] < threshold) {
            while (t + 1 < maxTau && dPrime[t + 1] < dPrime[t]) {
                t++;
            }
            tauIndex = t;
            break;
        }
    }

    // Fallback to global minimum
    if (tauIndex === -1) {
        let minVal = 1;
        for (let t = minTau; t < maxTau; t++) {
            if (dPrime[t] < minVal) {
                minVal = dPrime[t];
                tauIndex = t;
            }
        }
    }

    if (tauIndex === -1 || tauIndex === 0) {
        return { pitch: null, rms };
    }

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

    const pitch = dsSampleRate / T0;

    // Apply score-informed corrections
    if (expectedMidiNotes && expectedMidiNotes.length > 0) {
        const estimatedMidi = noteFromPitch(pitch);
        for (const expMidi of expectedMidiNotes) {
            // Direct match (within 1 semitone)
            if (Math.abs(estimatedMidi - expMidi) <= 1) {
                return { pitch: midiToFreq(expMidi), rms };
            }
            // Harmonic offsets: octave, fifths
            const octaveOffsets = [-24, -12, 12, 19, 24];
            for (const offset of octaveOffsets) {
                if (Math.abs((estimatedMidi - offset) - expMidi) <= 1) {
                    return { pitch: midiToFreq(expMidi), rms };
                }
            }
        }
    }

    return { pitch, rms };
};

self.onmessage = (e: MessageEvent<YINMessageData>) => {
    const { buffer, sampleRate, noiseGateThreshold, expectedMidiNotes } = e.data;
    if (!buffer || buffer.length === 0) return;

    const result = runYIN(buffer, sampleRate, noiseGateThreshold, expectedMidiNotes);

    // Send result and transfer buffer back to main thread
    (self as any).postMessage({
        pitch: result.pitch,
        rms: result.rms,
        buffer
    }, [buffer.buffer]);
};
