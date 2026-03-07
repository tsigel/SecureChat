import { appD } from '@/model/app';

const STORAGE_KEY = 'securechat_settings';

interface Settings {
    soundEnabled: boolean;
}

function loadSettings(): Settings {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            return JSON.parse(raw);
        }
    } catch {
        // ignore
    }
    return { soundEnabled: true };
}

function saveSettings(settings: Settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

const saved = loadSettings();

export const toggleSound = appD.createEvent();

export const $soundEnabled = appD
    .createStore(saved.soundEnabled)
    .on(toggleSound, (state) => !state);

$soundEnabled.watch((enabled) => {
    saveSettings({ soundEnabled: enabled });
});
