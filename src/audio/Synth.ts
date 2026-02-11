import * as Tone from 'tone';

class AudioEngine {
    private sampler: Tone.Sampler | null = null;
    public isInitialized = false;

    constructor() {
        // Singleton pattern or simple instance
    }

    private polySynth: Tone.PolySynth | null = null;

    async init() {
        if (this.isInitialized) return;

        await Tone.start();

        this.polySynth = new Tone.PolySynth().toDestination();
        this.polySynth.volume.value = -10;

        return new Promise<void>((resolve, _reject) => {
            const timeout = setTimeout(() => {
                console.warn("Sampler timed out, falling back to Synth");
                this.isInitialized = true; // Allow playing with fallback
                resolve();
            }, 5000); // reduced timeout

            this.sampler = new Tone.Sampler({
                urls: {
                    "A0": "A0.mp3",
                    "C1": "C1.mp3",
                    "D#1": "Ds1.mp3",
                    "F#1": "Fs1.mp3",
                    "A1": "A1.mp3",
                    "C2": "C2.mp3",
                    "D#2": "Ds2.mp3",
                    "F#2": "Fs2.mp3",
                    "A2": "A2.mp3",
                    "C3": "C3.mp3",
                    "D#3": "Ds3.mp3",
                    "F#3": "Fs3.mp3",
                    "A3": "A3.mp3",
                    "C4": "C4.mp3",
                    "D#4": "Ds4.mp3",
                    "F#4": "Fs4.mp3",
                    "A4": "A4.mp3",
                    "C5": "C5.mp3",
                    "D#5": "Ds5.mp3",
                    "F#5": "Fs5.mp3",
                    "A5": "A5.mp3",
                    "C6": "C6.mp3",
                    "D#6": "Ds6.mp3",
                    "F#6": "Fs6.mp3",
                    "A6": "A6.mp3",
                    "C7": "C7.mp3",
                    "D#7": "Ds7.mp3",
                    "F#7": "Fs7.mp3",
                    "A7": "A7.mp3",
                    "C8": "C8.mp3"
                },
                baseUrl: "https://tonejs.github.io/audio/salamander/",
                onload: () => {
                    clearTimeout(timeout);
                    this.isInitialized = true;
                    console.log("Piano Samples Loaded");
                    resolve();
                }
            }).toDestination();

            // Volume adjustment
            this.sampler.volume.value = -5;
        });
    }

    playNote(midiNote: number, velocity: number = 0.7) {
        if (!this.isInitialized) {
            console.warn("Audio not initialized yet");
            return;
        }

        const freq = Tone.Frequency(midiNote, "midi").toNote();
        const vel = Math.min(Math.max(velocity / 127, 0), 1);

        // Try Sampler, fallback to PolySynth
        if (this.sampler && this.sampler.loaded) {
            this.sampler.triggerAttack(freq, Tone.now(), vel);
        } else if (this.polySynth) {
            this.polySynth.triggerAttack(freq, Tone.now(), vel);
        }
    }

    releaseNote(midiNote: number) {
        if (!this.isInitialized) return;

        const freq = Tone.Frequency(midiNote, "midi").toNote();

        if (this.sampler && this.sampler.loaded) {
            this.sampler.triggerRelease(freq);
        } else if (this.polySynth) {
            this.polySynth.triggerRelease(freq);
        }
    }

    releaseAll() {
        if (this.sampler && this.sampler.loaded) this.sampler.releaseAll();
        if (this.polySynth) this.polySynth.releaseAll();
    }
}

export const audio = new AudioEngine();
