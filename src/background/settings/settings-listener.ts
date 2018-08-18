import { firebase } from '../../firebase';
import { browser } from 'webextension-polyfill-ts';
import { VSyncStorage } from '../storage';

const SUPPORTED_LOCALES = ['en', 'de'];

export class SettingsListener {
    vStorage = new VSyncStorage();
    dbRef?: firebase.database.Reference

    constructor() {
        this.vStorage.subscribe<'user'>('user', changes => {
            const user = changes.newValue;
            if(user) {
                this.subscribeToSettings(user);
            } else {
                this.clean();
            }
        });
    }

    async getDefaultSettings(): Promise<VSync.Settings> {
        const locales = await browser.i18n.getAcceptLanguages();
        const locale = filterLocales(locales);

        const localSettings = await this.vStorage.get<'settings'>('settings');

        if(localSettings) {
            return localSettings;
        } else {
            const defaultSettings: VSync.Settings = {
                locale,
                theme: 'dark'
            }

            return defaultSettings;
        }
    }

    subscribeToSettings(user: VSync.User) {
        this.dbRef = firebase.database().ref(`settings/${user.uid}`);
        this.dbRef.on('value', async snap => {
            const defaultSettings = await this.getDefaultSettings();

            if(snap && snap.exists()) {
                const settingsData = snap.val();

                if(settingsData.locale) {
                    // Locales not supported
                    defaultSettings.locale = settingsData.locale;
                }
                if(settingsData.theme) {
                    defaultSettings.theme = settingsData.theme;
                }
            }

            this.vStorage.set({
                settings: defaultSettings
            });
            if(this.dbRef) this.dbRef.update(defaultSettings);

            console.debug('FETCHED Settings: ', defaultSettings);
        });
    }

    async clean() {
        if(this.dbRef) this.dbRef.off();

        const defaultSettings = await this.getDefaultSettings();
        this.vStorage.set({
            settings: defaultSettings
        });

        console.debug('CLEANED Settings: ', defaultSettings);
    }
}

function filterLocales(locales: string[]): string {
    for(const entry of locales) {
        if(SUPPORTED_LOCALES.indexOf(entry) !== -1) {
            return entry;
            
            // If locale has _ (eg. en_GB), only check for the first part
        } else if(entry.indexOf('_') !== -1 && SUPPORTED_LOCALES.indexOf(entry.split('_')[0]) !== -1) {
            return entry.split('_')[0];
        }
    }

    return 'en';
}