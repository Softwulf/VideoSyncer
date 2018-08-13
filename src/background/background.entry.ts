import { browser } from 'webextension-polyfill-ts';
import * as UrlParser from 'url-parse';
import { firebase } from '../firebase';
import { SettingsListener } from './settings-listener';

/*
 * Redirect requests to the videosyncer oauth redirect url to internal extension pages
 */
browser.webRequest.onBeforeRequest.addListener((details) => {
    const requestUrl = new UrlParser(details.url);
    if(requestUrl.pathname.endsWith('/login')) {
        return {
            redirectUrl: browser.runtime.getURL('pages/oauth/login.html')+requestUrl.hash
        }
    } else if(requestUrl.pathname.endsWith('/logout')) {
        browser.tabs.remove(details.tabId);
        return {
            cancel: true
        }
    }
    return {
        cancel: false
    };
}, {
    urls: ['https://vsync.ch/_oauth*'],
}, [
    'blocking'
]);

new SettingsListener();

browser.runtime.onMessage.addListener(async (message, sender) => {
    if(message.type === 'CLOSE_TAB') {
        return browser.tabs.remove(sender.tab.id);
    }
});