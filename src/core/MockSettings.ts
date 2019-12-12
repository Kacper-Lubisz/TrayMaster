// TODO: Agree on which initial settings we are using (can add more later)
// TODO: Document

let settingsMap: { sampleSetting: string } = {
    sampleSetting: "Custom setting"
};


export class SettingsManager {
    private static settingsLoaded: boolean = false;
    private static settings: Settings;

    public static async loadSettings(): Promise<Settings> {
        this.settingsLoaded = true;
        return this.settings = settingsMap;
    }

    public static saveSettings() {
        if (this.settingsLoaded) {
            // Some clever generics casing can be used here
            settingsMap = this.settings;
        }
    }

    public static getSettings(): Settings {
        return this.settings;
    }
}


export interface Settings {
    sampleSetting: string;
}
