import React, { useState } from 'react';

type Tab = 'scales' | 'chords' | 'reading';

export const ReferencePanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('scales');

    return (
        <div className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden min-h-[600px] flex flex-col">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                {(['scales', 'chords', 'reading'] as Tab[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-4 text-center font-bold uppercase text-sm tracking-wider transition-colors ${activeTab === tab
                            ? 'bg-white dark:bg-gray-800 text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="p-6 flex-1 overflow-auto">
                {activeTab === 'scales' && (
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Major Scales</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <ScaleCard note="C" sharps={0} flats={0} notes={["C", "D", "E", "F", "G", "A", "B"]} />
                                <ScaleCard note="G" sharps={1} flats={0} notes={["G", "A", "B", "C", "D", "E", "F#"]} />
                                <ScaleCard note="D" sharps={2} flats={0} notes={["D", "E", "F#", "G", "A", "B", "C#"]} />
                                <ScaleCard note="F" sharps={0} flats={1} notes={["F", "G", "A", "Bb", "C", "D", "E"]} />
                                <ScaleCard note="A" sharps={3} flats={0} notes={["A", "B", "C#", "D", "E", "F#", "G#"]} />
                                <ScaleCard note="E" sharps={4} flats={0} notes={["E", "F#", "G#", "A", "B", "C#", "D#"]} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'chords' && (
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Common Triads</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <ChordCard name="C Major" notes={["C", "E", "G"]} type="Major" />
                                <ChordCard name="A Minor" notes={["A", "C", "E"]} type="Minor" />
                                <ChordCard name="G Major" notes={["G", "B", "D"]} type="Major" />
                                <ChordCard name="E Minor" notes={["E", "G", "B"]} type="Minor" />
                                <ChordCard name="F Major" notes={["F", "A", "C"]} type="Major" />
                                <ChordCard name="D Minor" notes={["D", "F", "A"]} type="Minor" />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'reading' && (
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Note Reading Mnemonics</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                                    <h4 className="text-xl font-bold mb-2 text-blue-900 dark:text-blue-300">Treble Clef (Lines)</h4>
                                    <p className="text-lg mb-4 font-semibold text-gray-800 dark:text-gray-100">E - G - B - D - F</p>
                                    <p className="italic text-gray-700 dark:text-gray-300">"Every Good Boy Does Fine"</p>
                                </div>
                                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                                    <h4 className="text-xl font-bold mb-2 text-blue-900 dark:text-blue-300">Treble Clef (Spaces)</h4>
                                    <p className="text-lg mb-4 font-semibold text-gray-800 dark:text-gray-100">F - A - C - E</p>
                                    <p className="italic text-gray-700 dark:text-gray-300">"FACE"</p>
                                </div>
                                <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                                    <h4 className="text-xl font-bold mb-2 text-purple-900 dark:text-purple-300">Bass Clef (Lines)</h4>
                                    <p className="text-lg mb-4 font-semibold text-gray-800 dark:text-gray-100">G - B - D - F - A</p>
                                    <p className="italic text-gray-700 dark:text-gray-300">"Good Boys Do Fine Always"</p>
                                </div>
                                <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                                    <h4 className="text-xl font-bold mb-2 text-purple-900 dark:text-purple-300">Bass Clef (Spaces)</h4>
                                    <p className="text-lg mb-4 font-semibold text-gray-800 dark:text-gray-100">A - C - E - G</p>
                                    <p className="italic text-gray-700 dark:text-gray-300">"All Cows Eat Grass"</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ScaleCard: React.FC<{ note: string, sharps: number, flats: number, notes: string[] }> = ({ note, sharps, flats, notes }) => (
    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center hover:shadow-md transition">
        <div className="text-3xl font-extrabold mb-1 text-gray-800 dark:text-white">{note} <span className="text-sm font-normal text-gray-500">Major</span></div>
        <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            {sharps > 0 ? `${sharps} Sharps` : flats > 0 ? `${flats} Flats` : 'Natural'}
        </div>
        <div className="flex justify-center gap-1">
            {notes.map((n, i) => (
                <div key={i} className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${i === 0 ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 shadow-sm'}`}>
                    {n}
                </div>
            ))}
        </div>
    </div>
);

const ChordCard: React.FC<{ name: string, notes: string[], type: 'Major' | 'Minor' }> = ({ name, notes, type }) => (
    <div className={`p-4 rounded-lg text-center hover:shadow-md transition ${type === 'Major' ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800' : 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800'}`}>
        <div className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">{name}</div>
        <div className="flex justify-center gap-2 mb-2">
            {notes.map((n, i) => (
                <div key={i} className="w-10 h-14 bg-white dark:bg-gray-200 border-b-4 border-gray-300 rounded-b-md shadow-sm flex items-end justify-center pb-1 text-gray-800 font-bold">
                    {n}
                </div>
            ))}
        </div>
        <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
            {type} Triad
        </div>
    </div>
);
