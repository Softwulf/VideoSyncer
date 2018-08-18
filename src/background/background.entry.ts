import { SettingsListener } from './settings/settings-listener';
import { SeriesListener } from './series/series-listener';
import { MessageListener } from './messages/message-listener';
import { AuthListener } from './auth/auth-listener';

import { browser } from 'webextension-polyfill-ts';
import * as UrlParser from 'url-parse';

new AuthListener();

new SeriesListener();
new SettingsListener();

new MessageListener();

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