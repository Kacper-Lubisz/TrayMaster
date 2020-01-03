// TODO: Remove this. Temporarily disabled while our functions are not implemented
/* eslint-disable @typescript-eslint/require-await */
// TODO: Agree on which settings to be used

// Offline mock settings
let settingsMap: Settings = {
    sampleSetting: "Custom setting"
};


/**
 * Static class for fetching, managing and updating application settings
 */
export class SettingsManager {
    private static settingsLoaded = false;
    private static settings: Settings;

    /**
     * Load the settings from the database
     * @async
     * @returns A promise that resolves to the settings when ready
     */
    public static async loadSettings(): Promise<Settings> {
        if (this.settingsLoaded) {
            return this.settings;
        }
        this.settingsLoaded = true;
        return this.settings = settingsMap;
    }

    /**
     * Save the settings to the server
     */
    public static saveSettings(): void {
        if (this.settingsLoaded) {
            settingsMap = this.settings;
        }
    }

    /**
     * Fetches the current settings instance
     */
    public static getSettings(): Settings {
        return this.settings;
    }
}


/**
 * Represents the firebase settings map
 */
export interface Settings {
    sampleSetting: string;
}
