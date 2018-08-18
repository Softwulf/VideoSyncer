import { browser } from 'webextension-polyfill-ts';
import * as UrlParser from 'url-parse';
import { firebase } from '../firebase';
import { SettingsListener } from './settings-listener';

let seriesList: VSync.Series[] = [];
let seriesRef: firebase.database.Reference;

firebase.auth().onAuthStateChanged(user => {
    if(seriesRef) seriesRef.off();
    if(user) {
        seriesRef = firebase.database().ref(`vsync/series/${user.uid}`);
        seriesRef.on('value', snap => {
            seriesList = [];
            if(snap && snap.exists() && snap.hasChildren()) {
                snap.forEach(child => {
                    seriesList.push({
                        key: child.key,
                        ...child.val()
                    });
                });
            }
        })
    } else {
        seriesList = [];
    }
});

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

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if(changeInfo.status === 'complete') {
        const url = tab.url;
        const parsedUrl = new UrlParser(url);
        const series = seriesList.find(series => {
            return      series.host === parsedUrl.host
                    &&  parsedUrl.pathname.startsWith('/'+series.pathbase)
        });
        if(series) {
            console.log(browser.runtime.getURL('video-tracker/index.js'));
            browser.tabs.executeScript(tabId, {
                file: '/video-tracker/index.js'
            })
        }
    }
});