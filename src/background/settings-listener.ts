import { firebase } from '../firebase';
import { browser } from 'webextension-polyfill-ts';

const SUPPORTED_LOCALES = ['en', 'de'];

export class SettingsListener {
    dbRef?: firebase.database.Reference

    constructor() {
        firebase.auth().onAuthStateChanged(user => {
            if(user) {
                console.log('User is signed in: ', user.displayName);
                this.setupUser(user);
            } else {
                console.log('User is signed out');
                this.clean();
            }
        });
    }

    filterLocales(locales: string[]): string {
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

    
    async findTheme(): Promise<string> {
        const result = await browser.storage.local.get({theme: 'dark'});
        return result.theme;
    }

    setupUser(user: firebase.User) {
        this.dbRef = firebase.database().ref(`settings/${user.uid}`);
        this.dbRef.on('value', async snap => {
            const locales = await browser.i18n.getAcceptLanguages();

            const locale = this.filterLocales(locales);
            const theme = await this.findTheme();

            const defaultSettings: Partial<vsync.Settings> = {
                locale,
                theme
            }
            if(snap && snap.exists()) {
                const settingsData = snap.val();

                if(settingsData.locale) {
                    // Locales not supported
                    delete defaultSettings.locale;
                }
                if(settingsData.theme) {
                    browser.storage.local.set({theme: settingsData.theme});
                    delete defaultSettings.theme;
                }
            }
            if(this.dbRef) this.dbRef.update(defaultSettings);
        });
    }

    clean() {
        if(this.dbRef) this.dbRef.off();
    }
}