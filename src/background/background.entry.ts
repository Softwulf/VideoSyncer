import { SettingsListener } from './settings/settings-listener';
import { SeriesListener } from './series/series-listener';
import { MessageListener } from './messages/message-listener';
import { AuthListener } from './auth/auth-listener';

import { browser } from 'webextension-polyfill-ts';
import * as UrlParser from 'url-parse';
import { MessageGateway } from './messages/message-gateway';

new AuthListener();

new SeriesListener();
new SettingsListener();

new MessageListener();

new MessageGateway();

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


/*
 * Connect with content scripts to let them know when they're disconnected
 */
browser.runtime.onConnect.addListener(port => {
    console.debug('Content Script connected', port.name);
    port.onDisconnect.addListener(port => {
        console.debug('Content Script disconnected', port.name)
    })
});