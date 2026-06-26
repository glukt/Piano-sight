import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Preferences {
    isDarkMode: boolean;
    showKeyboard: boolean;
    showPianoLabels: boolean;
    showNoteNames: boolean;
    layoutMode: 'standard' | 'scrolling';
    hintDelay: number; // in milliseconds (e.g. 3000, 5000, 10000, 0 for off)
    soundType: 'synth' | 'samples';
}

const DEFAULT_PREFERENCES: Preferences = {
    isDarkMode: false,
    showKeyboard: true,
    showPianoLabels: false,
    showNoteNames: false,
    layoutMode: 'standard',
    hintDelay: 3000,
    soundType: 'synth',
};

interface PreferencesContextType {
    preferences: Preferences;
    updatePreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [preferences, setPreferences] = useState<Preferences>(() => {
        const saved = localStorage.getItem('pianopilot_preferences');
        if (saved) {
            try {
                return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
            } catch (e) {
                console.error("Failed to parse preferences:", e);
            }
        }
        return DEFAULT_PREFERENCES;
    });

    useEffect(() => {
        localStorage.setItem('pianopilot_preferences', JSON.stringify(preferences));
        // Sync theme class with HTML element
        if (preferences.isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [preferences]);

    const updatePreference = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
        setPreferences(prev => ({
            ...prev,
            [key]: value
        }));
    };

    return (
        <PreferencesContext.Provider value={{ preferences, updatePreference }}>
            {children}
        </PreferencesContext.Provider>
    );
};

export const usePreferences = () => {
    const context = useContext(PreferencesContext);
    if (!context) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }
    return context;
};
