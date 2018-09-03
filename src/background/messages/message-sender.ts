import { browser } from 'webextension-polyfill-ts';
import { RequestUserSignOut, RequestUserSignIn, RequestCloseTab, RequestSeriesCreate, RequestSeriesDelete, RequestSeriesEdit, RequestSettingsUpdate } from './requests';
import { debug } from 'vlogger';


export const MessageSender = {

    requestUserSignIn: async () => {
        const userSignInMessage: RequestUserSignIn = {
            type: '@@request/SIGN_IN'
        }
        
        await browser.runtime.sendMessage(userSignInMessage);
    },

    requestUserSignOut: async () => {
        const userSignOutMessage: RequestUserSignOut = {
            type: '@@request/SIGN_OUT'
        }
        
        await browser.runtime.sendMessage(userSignOutMessage);
    },

    requestCloseTab: async () => {
        const closeTabMessage: RequestCloseTab = {
            type: '@@request/CLOSE_TAB'
        }
        
        browser.runtime.sendMessage(closeTabMessage);
    },

    requstSeriesCreate: async (series: VSync.SeriesBase) => {
        const seriesCreateMessage: RequestSeriesCreate = {
            type: '@@request/SERIES_CREATE',
            payload: {
                series
            }
        }
        
        browser.runtime.sendMessage(seriesCreateMessage);
    },

    requestSeriesDelete: async (seriesId: VSync.Series['key']) => {
        const seriesDeleteMessage: RequestSeriesDelete = {
            type: '@@request/SERIES_DELETE',
            payload: {
                seriesId
            }
        }
        
        browser.runtime.sendMessage(seriesDeleteMessage);
    },

    requestSeriesEdit: async (seriesId: VSync.Series['key'], series: Partial<VSync.Series>) => {
        const seriesEditMessage: RequestSeriesEdit = {
            type: '@@request/SERIES_EDIT',
            payload: {
                series,
                key: seriesId
            }
        }
        
        debug('Requesting edit: ', seriesEditMessage);

        browser.runtime.sendMessage(seriesEditMessage);
    },

    requestSettingsUpdate: async (settings: Partial<VSync.Settings>) => {
        const settingsUpdateMessage: RequestSettingsUpdate = {
            type: '@@request/SETTINGS_UPDATE',
            payload: {
                settings
            }
        }
        
        browser.runtime.sendMessage(settingsUpdateMessage);
    }
}