import React from 'react';

export interface TrainerNoteData {
    key: string; // e.g. "c/4", "f#/4"
    clef: 'treble' | 'bass';
    status?: 'pending' | 'correct' | 'incorrect';
}

interface TrainerStaffProps {
    notes: TrainerNoteData[];
    clef: 'treble' | 'bass' | 'both';
    activeIndex?: number; // active index in melodic mode
    isDarkMode?: boolean;
    showNoteNames?: boolean;
    className?: string;
}

const letterToDiatonicOffset: Record<string, number> = {
    c: 0,
    d: 1,
    e: 2,
    f: 3,
    g: 4,
    a: 5,
    b: 6,
};

const getDiatonicIndex = (letter: string, octave: number) => {
    return octave * 7 + (letterToDiatonicOffset[letter] ?? 0);
};

export const TrainerStaff: React.FC<TrainerStaffProps> = ({
    notes,
    clef,
    activeIndex = 0,
    isDarkMode = false,
    showNoteNames = false,
    className = '',
}) => {
    const lineSpacing = 12;
    const isBoth = clef === 'both';
    const width = 300;
    const height = isBoth ? 220 : 120;

    const trebleCenterY = isBoth ? 60 : 60;
    const bassCenterY = isBoth ? 160 : 60;

    const strokeColor = isDarkMode ? '#e2e8f0' : '#1e293b';
    const notePendingColor = isDarkMode ? '#cbd5e1' : '#475569';
    const noteCorrectColor = '#22c55e'; // Green
    const noteIncorrectColor = '#ef4444'; // Red
    const highlightColor = '#3b82f6'; // Blue for active cursor

    const parseNoteKey = (noteKey: string) => {
        const [notePart, octavePart] = noteKey.split('/');
        const letter = notePart.charAt(0).toLowerCase();
        const accidental = notePart.slice(1);
        const octave = parseInt(octavePart, 10);
        return { letter, accidental, octave };
    };

    const getNoteY = (note: TrainerNoteData) => {
        const { letter, octave } = parseNoteKey(note.key);
        const diatonic = getDiatonicIndex(letter, octave);

        if (isBoth) {
            if (note.clef === 'treble') {
                return trebleCenterY - (diatonic - 34) * (lineSpacing / 2);
            } else {
                return bassCenterY - (diatonic - 22) * (lineSpacing / 2);
            }
        } else {
            const centerY = clef === 'treble' ? trebleCenterY : bassCenterY;
            const centerDiatonic = clef === 'treble' ? 34 : 22; // B4 or D3
            return centerY - (diatonic - centerDiatonic) * (lineSpacing / 2);
        }
    };

    const renderLedgerLines = (note: TrainerNoteData, x: number) => {
        const { letter, octave } = parseNoteKey(note.key);
        const diatonic = getDiatonicIndex(letter, octave);
        const lines: React.ReactNode[] = [];

        const isTreble = isBoth ? note.clef === 'treble' : clef === 'treble';
        const centerY = isBoth
            ? (note.clef === 'treble' ? trebleCenterY : bassCenterY)
            : (clef === 'treble' ? trebleCenterY : bassCenterY);

        const minStaff = isTreble ? 30 : 18; // E4 or G2
        const maxStaff = isTreble ? 38 : 26; // F5 or A3

        const getY = (d: number) => {
            const centerDiatonic = isTreble ? 34 : 22;
            return centerY - (d - centerDiatonic) * (lineSpacing / 2);
        };

        if (diatonic < minStaff) {
            const start = minStaff - 2;
            const end = diatonic % 2 === 0 ? diatonic : diatonic + 1;
            for (let d = start; d >= end; d -= 2) {
                const y = getY(d);
                lines.push(
                    <line
                        key={`ledger-down-${d}-${x}`}
                        x1={x - 14}
                        y1={y}
                        x2={x + 14}
                        y2={y}
                        stroke={strokeColor}
                        strokeWidth="1.5"
                    />
                );
            }
        } else if (diatonic > maxStaff) {
            const start = maxStaff + 2;
            const end = diatonic % 2 === 0 ? diatonic : diatonic - 1;
            for (let d = start; d <= end; d += 2) {
                const y = getY(d);
                lines.push(
                    <line
                        key={`ledger-up-${d}-${x}`}
                        x1={x - 14}
                        y1={y}
                        x2={x + 14}
                        y2={y}
                        stroke={strokeColor}
                        strokeWidth="1.5"
                    />
                );
            }
        }
        return lines;
    };

    // Helper for rendering 5 staff lines
    const renderStaffLines = (centerY: number) => {
        const lines: React.ReactNode[] = [];
        for (let i = -2; i <= 2; i++) {
            const y = centerY + i * lineSpacing;
            lines.push(
                <line
                    key={`staff-line-${centerY}-${i}`}
                    x1="10"
                    y1={y}
                    x2={width - 10}
                    y2={y}
                    stroke={strokeColor}
                    strokeWidth="1"
                    opacity={isDarkMode ? '0.4' : '0.25'}
                />
            );
        }
        return lines;
    };

    const TrebleClef = () => (
        <g transform={`translate(15, ${trebleCenterY - 38}) scale(0.55)`} fill={strokeColor} opacity="0.8">
            <path d="M32.108,45.02C31.428,42.709,30.78,40.425,30.195,38.209C34.229,34.433,37.429,29.413,37.5,21.283C37.536,17.06,37.032,12.006,33.025,6.535C31.843,4.922,29.604,4.519,27.934,5.621C23.985,8.227,20,14.457,20,22.5C20,26.253,20.699,30.663,21.782,35.411C20.949,36.021,20.077,36.63,19.177,37.259C12.86,41.667,5,47.153,5,60C5,74.084,16.44,82.5,27.5,82.5C29.658,82.5,31.729,82.271,33.677,81.841C33.684,82.066,33.688,82.285,33.688,82.5C33.688,85.257,31.445,87.5,28.688,87.5C27.352,87.5,26.096,86.98,25.153,86.036L19.848,91.339C22.209,93.7,25.348,95,28.688,95C35.581,95,41.188,89.393,41.188,82.5C41.188,81.387,41.118,80.206,40.986,78.964C46.528,75.615,50,70.154,50,63.75C50,53.699,42.05,45.47,32.108,45.02ZM29.244,15.311C29.86,17.224,30.017,19.139,30,21.218C29.973,24.421,29.287,26.889,28.125,28.943C27.729,26.582,27.5,24.41,27.5,22.5C27.5,19.607,28.264,17.158,29.244,15.311ZM27.5,75C20.229,75,12.5,69.743,12.5,60C12.5,51.065,17.341,47.686,23.469,43.409C23.573,43.337,23.677,43.264,23.781,43.192C24.103,44.346,24.438,45.509,24.78,46.677C19.873,49.271,16.188,54.53,16.188,60C16.188,63.338,17.488,66.477,19.848,68.838L25.153,63.535C24.209,62.59,23.688,61.335,23.688,59.999C23.688,57.909,25.121,55.645,27.027,54.157C27.096,54.384,27.166,54.611,27.234,54.838C29.303,61.627,31.419,68.566,32.64,74.372C31.05,74.78,29.322,75,27.5,75ZM39.503,70.664C38.239,65.243,36.406,59.209,34.508,52.981C39.128,54.381,42.5,58.679,42.5,63.75C42.5,66.69,41.517,69.176,39.503,70.664Z" />
        </g>
    );

    const BassClef = ({ centerY }: { centerY: number }) => {
        const fLineY = centerY - 12;
        return (
            <g stroke={strokeColor} fill="none" opacity="0.8">
                <circle cx="20" cy={fLineY} r="3" fill={strokeColor} stroke="none" />
                <path
                    d={`M 20 ${fLineY} C 20 ${fLineY - 14}, 34 ${fLineY - 14}, 34 ${fLineY} C 34 ${fLineY + 12}, 27 ${fLineY + 22}, 18 ${fLineY + 26}`}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
                <circle cx="38" cy={fLineY - 6} r="1.8" fill={strokeColor} stroke="none" />
                <circle cx="38" cy={fLineY + 6} r="1.8" fill={strokeColor} stroke="none" />
            </g>
        );
    };

    // Calculate x coordinates for each note
    const startX = 85;
    const availableWidth = width - startX - 25;
    const getNoteX = (index: number) => {
        if (notes.length <= 1) return startX + availableWidth / 2;
        const spacing = availableWidth / (notes.length - 1);
        return startX + index * spacing;
    };

    return (
        <div className={`relative flex items-center justify-center p-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 ${className}`}>
            <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="xMidYMid meet"
                className="select-none overflow-visible"
            >
                {/* 1. Draw Clef Staves */}
                {clef === 'treble' && renderStaffLines(trebleCenterY)}
                {clef === 'bass' && renderStaffLines(bassCenterY)}
                {isBoth && (
                    <>
                        {renderStaffLines(trebleCenterY)}
                        {renderStaffLines(bassCenterY)}
                        {/* Brackets / Brace for grand staff */}
                        <line x1="10" y1={trebleCenterY - 24} x2="10" y2={bassCenterY + 24} stroke={strokeColor} strokeWidth="2.5" />
                        <path
                            d={`M 10 ${trebleCenterY - 24} C 5 ${trebleCenterY - 24}, -2 ${trebleCenterY - 12}, -2 ${trebleCenterY + 50} C -2 ${trebleCenterY + 100}, 8 ${trebleCenterY + 45}, 4 ${trebleCenterY + 50} C 0 ${trebleCenterY + 55}, -2 ${trebleCenterY + 60}, -2 ${bassCenterY - 50} C -2 ${bassCenterY + 12}, 5 ${bassCenterY + 24}, 10 ${bassCenterY + 24} C 8 ${bassCenterY + 24}, 3 ${bassCenterY + 12}, 3 ${bassCenterY - 50} C 3 ${bassCenterY - 100}, -7 ${bassCenterY - 45}, -3 ${bassCenterY - 50} C 1 ${bassCenterY - 55}, 3 ${bassCenterY - 60}, 3 ${trebleCenterY + 50} C 3 ${trebleCenterY - 12}, 8 ${trebleCenterY - 24}, 10 ${trebleCenterY - 24} Z`}
                            fill={strokeColor}
                            opacity="0.9"
                            transform="translate(11, 0) scale(0.65)"
                        />
                    </>
                )}

                {/* 2. Draw Clef Symbols */}
                {clef === 'treble' && <TrebleClef />}
                {clef === 'bass' && <BassClef centerY={bassCenterY} />}
                {isBoth && (
                    <>
                        <TrebleClef />
                        <BassClef centerY={bassCenterY} />
                    </>
                )}

                {/* 3. Draw Notes */}
                {notes.map((note, index) => {
                    const x = getNoteX(index);
                    const y = getNoteY(note);
                    const isActive = index === activeIndex;

                    // Parse accidental
                    const { accidental, letter, octave } = parseNoteKey(note.key);
                    const diatonic = getDiatonicIndex(letter, octave);
                    const isTreble = isBoth ? note.clef === 'treble' : clef === 'treble';

                    // Color based on status
                    let color = notePendingColor;
                    if (note.status === 'correct') color = noteCorrectColor;
                    else if (note.status === 'incorrect') color = noteIncorrectColor;
                    else if (isActive) color = highlightColor;

                    // Stem direction
                    // If note is on/above center line of its clef, stem goes down.
                    const clefCenterDiatonic = isTreble ? 34 : 22; // B4 or D3
                    const stemDown = diatonic >= clefCenterDiatonic;

                    return (
                        <g key={`trainer-note-${index}-${note.key}`} className="transition-colors duration-250">
                            {/* Cursor box highlight for active note */}
                            {isActive && (
                                <rect
                                    x={x - 16}
                                    y={y - 30}
                                    width="32"
                                    height="60"
                                    fill="rgba(59, 130, 246, 0.08)"
                                    stroke="rgba(59, 130, 246, 0.3)"
                                    strokeWidth="1.5"
                                    strokeDasharray="3,2"
                                    rx="4"
                                />
                            )}

                            {/* Ledger Lines */}
                            {renderLedgerLines(note, x)}

                            {/* Accidental */}
                            {accidental && (
                                <text
                                    x={x - 11}
                                    y={y + 5}
                                    fontSize="18"
                                    fontWeight="semibold"
                                    fill={color}
                                    textAnchor="end"
                                    className="font-serif select-none"
                                >
                                    {accidental === '#' && '♯'}
                                    {accidental === 'b' && '♭'}
                                    {accidental === '##' && '𝄪'}
                                    {accidental === 'bb' && '𝄫'}
                                </text>
                            )}

                            {/* Note Head (Rotated Ellipse) */}
                            <ellipse
                                cx={x}
                                cy={y}
                                rx="6.5"
                                ry="4.5"
                                transform={`rotate(-20 ${x} ${y})`}
                                fill={color}
                            />

                            {/* Note Stem */}
                            {stemDown ? (
                                <line
                                    x1={x - 6.2}
                                    y1={y}
                                    x2={x - 6.2}
                                    y2={y + 28}
                                    stroke={color}
                                    strokeWidth="1.5"
                                />
                            ) : (
                                <line
                                    x1={x + 6.2}
                                    y1={y}
                                    x2={x + 6.2}
                                    y2={y - 28}
                                    stroke={color}
                                    strokeWidth="1.5"
                                />
                            )}

                            {/* Note Name Label (Hint) */}
                            {showNoteNames && (
                                <text
                                    x={x}
                                    y={isBoth ? (note.clef === 'treble' ? 115 : 215) : 115}
                                    fontSize="10"
                                    fontWeight="bold"
                                    fill={isActive ? highlightColor : strokeColor}
                                    opacity={isActive ? '1' : '0.6'}
                                    textAnchor="middle"
                                >
                                    {letter.toUpperCase()}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};
