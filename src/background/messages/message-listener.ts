import { RequestActions } from './requests';
import { WulfAuth } from 'auth/wulf-auth';
import { vyrebase } from 'vyrebase';
import { VSyncStorage } from '../storage';
import { browser } from 'webextension-polyfill-ts';
import { getDefaultSettings } from '../settings/settings-listener';
import { debug } from 'vlogger';

export class MessageListener {
    vStorage = new VSyncStorage()
    user: VSync.User | false

    constructor() {
        this.vStorage.subscribe<'user'>('user', changes => {
            this.user = changes.newValue;
        });

        browser.runtime.onMessage.addListener(async (message: RequestActions, sender) => {
            const user = this.user;

            if(message.type) {
                switch(message.type) {
                    case '@@request/INJECT_SCRIPT':
                        debug(`Injecting script [${message.payload.script}]`)
                        if(message.payload.script === 'INJECTORS') {
                            return browser.tabs.executeScript(sender.tab.id,
                                {
                                    file: 'video-tracker/injector/injector.js',
                                    allFrames: true,
                                    matchAboutBlank: true
                                });
                        } else if(message.payload.script === 'FRAME') {
                            return browser.tabs.executeScript(sender.tab.id,
                                {
                                    file: 'video-tracker/frame/frame.js',
                                    matchAboutBlank: true,
                                    frameId: sender.frameId
                                });
                        } else {
                            throw {
                                error: 'Invalid script type '+message.payload.script
                            }
                        }
                    case '@@request/CLOSE_TAB':
                        return browser.tabs.remove(sender.tab.id);
                    case '@@request/SIGN_IN':
                        return WulfAuth.login();
                    case '@@request/SIGN_OUT':
                        return WulfAuth.logout();
                    case '@@request/SERIES_CREATE':
                        if(user) {
                            return vyrebase.database().ref(`vsync/series/${user.uid}`).push(message.payload.series);
                        } else {
                            throw {
                                error: 'Not signed in'
                            }
                        }
                    case '@@request/SERIES_EDIT':
                        if(user) {
                            return vyrebase.database().ref(`vsync/series/${user.uid}/${message.payload.key}`).update(message.payload.series);
                        } else {
                            throw {
                                error: 'Not signed in'
                            }
                        }
                    case '@@request/SERIES_DELETE':
                        if(user) {
                            return vyrebase.database().ref(`vsync/series/${user.uid}/${message.payload.seriesId}`).remove();
                        } else {
                            throw {
                                error: 'Not signed in'
                            }
                        }
                    case '@@request/SETTINGS_UPDATE':
                        if(user) {
                            return vyrebase.database().ref(`settings/${user.uid}`).update(message.payload.settings)
                        } else {
                            const defaultSettings = await getDefaultSettings(this.vStorage);
                            return this.vStorage.set({
                                settings: {
                                    ...defaultSettings,
                                    ...message.payload.settings
                                }
                            })
                        }
                    default:
                        return;
                }
            }
        });
    }
}