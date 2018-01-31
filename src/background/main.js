import browser from 'webextension-polyfill';

import oauthConfig from '../import/oauth-config';

import { firebase } from '../import/firebase-config';

browser.webRequest.onBeforeRequest.addListener((details) => {
    oauthConfig.google.validate(details.url).then((token) => {
        oauthConfig.google.storeLocalToken(token).then(() => {
            var credential = firebase.auth.GoogleAuthProvider.credential(null, token);
            firebase.auth().signInWithCredential(credential).then((user) => {
                console.log('User logged into firebase: ', user);
            }).catch((error) => {
                console.error('Could not login user to firebase: ', error);
            });
        }).catch((err) => {
            console.error('Could not store google token: ', err);
        });
    }).catch((err) => {
        console.error('Could not validate redirect URL: ', err);
    });
}, {
    urls: [oauthConfig.google.redirectURL+'*']
});