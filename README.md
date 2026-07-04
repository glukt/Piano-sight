# Piano Sight 🎹

[![Live Demo](https://img.shields.io/badge/Play-Piano%20Sight-blue?style=for-the-badge&logo=github)](https://glukt.github.io/Piano-sight/)

**Live App:** [https://glukt.github.io/Piano-sight/](https://glukt.github.io/Piano-sight/)

Piano Sight is a modern, interactive web application designed to help you practice sight-reading and learn piano. It works directly in your browser and supports both digital pianos (via MIDI) and acoustic pianos (via microphone).

## Features

-   **Dual Input Modes**: Connect a MIDI keyboard or use your device's microphone to play on an acoustic piano.
-   **Real-time Feedback**: Instant visual feedback on note accuracy and timing.
-   **Gamified Learning**: Earn XP, level up, maintain streaks, and complete daily challenges to stay motivated.
-   **Interactive Sheet Music**: Load MusicXML files or practice with procedurally generated levels.
-   **Practice Tools**:
    -   **Wait Mode**: The score waits for you to play the correct note.
    -   **Looping**: Focus on difficult sections by looping specific measures.
    -   **Statistics**: Track your accuracy, perfect hits, and error rates.
.
## Repository Structure

```
├── .github/workflows/   # CI/CD deployment pipelines
├── .agents/             # Persistent agent workspace config
│   └── AGENTS.md        # Session memory, core rules, and architectural guidelines
├── public/              # Static assets, soundfonts, and MusicXML library files
├── scripts/             # Python generators and MIDI-to-XML conversion tools
├── src/
│   ├── audio/           # Pitch detection algorithms & synthesizer engines
│   ├── components/      # UI components (categorized by context)
│   ├── engine/          # Level generation and VexFlow alignment utils
│   ├── hooks/           # useGameLogic, useRhythmEngine, usePracticeMode
│   └── utils/           # Course data, key signatures, and constants
└── package.json         # Build options and package dependencies
```

## Utility Scripts

The `scripts/` folder contains Python tools for importing and generating music content:
- **`convert_midi_to_xml.py`**: Converts standard MIDI files (.mid) into MusicXML files (.mxml) for ingestion into the training library.
- **`generate_capstones.py`**: Batch generates Capstone lesson presets for course checkpoints.
- **`generate_library.py`**: Re-indexes the MusicXML files in the public library and updates configuration files.

To run any script:
```bash
python scripts/filename.py
```

## Getting Started Locally

To run this project on your local machine:

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/glukt/Piano-sight.git
    cd Piano-sight
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the development server**:
    ```bash
    npm run dev
    ```

4.  Open your browser to `http://localhost:5173` (or the port shown in your terminal).

## Technologies Used

-   **Frontend**: React, TypeScript, Vite
-   **Audio**: Web Audio API (Pitch Detection), SoundFont2 (Synthesis)
-   **Rendering**: OpenSheetMusicDisplay (OSMD), VexFlow
-   **Styling**: Tailwind CSS

## License

This project is licensed under the MIT License.
