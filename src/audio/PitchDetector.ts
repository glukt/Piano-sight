/**
 * PitchDetector.ts
 * Implements Autocorrelation algorithm to detect pitch from audio buffer.
 */

export class PitchDetector {
    private audioContext: AudioContext;
    private analyser: AnalyserNode;
    private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
    private buffer: Float32Array;

    constructor(audioContext: AudioContext) {
        this.audioContext = audioContext;
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048; // Balance between latency and precision
        this.buffer = new Float32Array(this.analyser.fftSize);
    }

    async init() {
        if (this.mediaStreamSource) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
            this.mediaStreamSource.connect(this.analyser);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            throw err;
        }
    }

    public lastVolume: number = 0;

    public getPitch(): number | null {
        this.analyser.getFloatTimeDomainData(this.buffer);
        // Cast buffer to avoid "ArrayBufferLike" mismatch in strict environments
        const autoCorrelateValue = this.autoCorrelate(this.buffer as any, this.audioContext.sampleRate);

        if (autoCorrelateValue === -1) {
            return null;
        }

        return autoCorrelateValue;
    }

    // Standard Auto-correlation algorithm
    private autoCorrelate(buf: Float32Array, sampleRate: number): number {
        const SIZE = buf.length;
        let rms = 0;

        for (let i = 0; i < SIZE; i++) {
            const val = buf[i];
            rms += val * val;
        }
        rms = Math.sqrt(rms / SIZE);
        this.lastVolume = rms; // Store volume

        // Noise gate
        if (rms < 0.01) return -1;

        let r1 = 0, r2 = SIZE - 1;
        const thres = 0.2;

        // Find range to correlate
        for (let i = 0; i < SIZE / 2; i++) {
            if (Math.abs(buf[i]) < thres) { r1 = i; break; }
        }
        for (let i = 1; i < SIZE / 2; i++) {
            if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }
        }

        const buf2 = buf.slice(r1, r2);
        const c = new Array(buf2.length).fill(0);

        for (let i = 0; i < buf2.length; i++) {
            for (let j = 0; j < buf2.length - i; j++) {
                c[i] = c[i] + buf2[j] * buf2[j + i];
            }
        }

        let d = 0;
        // Find first peak
        while (c[d] > c[d + 1]) d++;

        let maxval = -1, maxpos = -1;

        for (let i = d; i < buf2.length; i++) {
            if (c[i] > maxval) {
                maxval = c[i];
                maxpos = i;
            }
        }

        let T0 = maxpos;

        // Parabolic Signal Interpolation for higher precision
        const x1 = c[T0 - 1];
        const x2 = c[T0];
        const x3 = c[T0 + 1];
        const a = (x1 + x3 - 2 * x2) / 2;
        const b = (x3 - x1) / 2;
        if (a) T0 = T0 - b / (2 * a);

        return sampleRate / T0;
    }

    public noteFromPitch(frequency: number): number {
        const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
        return Math.round(noteNum) + 69;
    }

    public stop() {
        if (this.mediaStreamSource) {
            this.mediaStreamSource.disconnect();
            this.mediaStreamSource.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStreamSource = null;
        }
    }
}
