import * as Tone from 'tone';

class AudioEngine {
    private synth: Tone.PolySynth | null = null;
    private isInitialized = false;

    constructor() {
        // Singleton pattern or simple instance
    }

    async init() {
        if (this.isInitialized) return;

        await Tone.start();

        // Create a polyphonic synth
        // Using a simple set of oscillators for now.
        // In future, we can load samples via Tone.Sampler
        this.synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: {
                type: 'triangle',
            },
            envelope: {
                attack: 0.005,
                decay: 0.1,
                sustain: 0.3,
                release: 1,
            },
        }).toDestination();

        // Volume adjustment
        this.synth.volume.value = -10;

        this.isInitialized = true;
        console.log("Audio Engine Initialized");
    }

    playNote(midiNote: number, velocity: number = 0.7) {
        if (!this.synth || !this.isInitialized) return;

        const freq = Tone.Frequency(midiNote, "midi").toNote();
        // Tone.js uses 0-1 for velocity
        // MIDI uses 0-127. Normalize.
        const vel = Math.min(Math.max(velocity / 127, 0), 1);

        this.synth.triggerAttack(freq, Tone.now(), vel);
    }

    releaseNote(midiNote: number) {
        if (!this.synth || !this.isInitialized) return;

        const freq = Tone.Frequency(midiNote, "midi").toNote();
        this.synth.triggerRelease(freq);
    }

    releaseAll() {
        if (!this.synth) return;
        this.synth.releaseAll();
    }
}

export const audio = new AudioEngine();
