import { browser, Storage } from 'webextension-polyfill-ts';
import { debug } from 'vlogger';

export interface VSyncStorageDefinition {
    auth0_nonce?: string
    auth0_state?: string
    user: VSync.User | false
    series_list: VSync.Series[]
    series_loading: boolean
    settings: VSync.Settings
}

export interface VSyncStorageChange<T extends keyof VSyncStorageDefinition> {
    oldValue?: VSyncStorageDefinition[T]
    newValue: VSyncStorageDefinition[T]
}

export class VSyncStorage {
    private listeners: {
        [key: string]: Array<(changes) => any>
    } = {}
    private shouldDebug = false;

    constructor(shouldDebug?: boolean) {
        if(shouldDebug) this.shouldDebug = true;

        browser.storage.onChanged.addListener((changes, area) => {
            if(shouldDebug) debug(`Storage changes in [${area}]: `, changes)
            if(area === 'local') {
                for(const prop in changes) {
                    this.callSubscribers(prop as any, changes[prop]);
                }
            }
        });
    }

    private callSubscribers(key: keyof VSyncStorageDefinition, changes: any) {
        if(this.listeners[key]) {
            this.listeners[key].forEach(listener => {
                listener(changes);
            })
        }
    }

    set(updateObject: Partial<VSyncStorageDefinition>) {
        return browser.storage.local.set(updateObject);
    }

    remove(key: keyof VSyncStorageDefinition) {
        return browser.storage.local.remove(key);
    }

    async get<T extends keyof VSyncStorageDefinition>(key: T) {
        const result = await browser.storage.local.get(key);
        return result[key] as VSyncStorageDefinition[T]
    }

    subscribe<T extends keyof VSyncStorageDefinition>(key: T, cb: (changes: VSyncStorageChange<T>) => any) {
        if(!this.listeners[key]) this.listeners[key] = [];
        this.listeners[key].push(cb);

        this.get<T>(key).then(val => {
            const firstChanges: VSyncStorageChange<T> = {
                newValue: val
            }

            cb(firstChanges);
        });
    }
}