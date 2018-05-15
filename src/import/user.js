import oauthConfig from './config/oauth-config';
import { firebase } from './config/firebase-config';
import { Protocol } from './sync';

import browser from 'webextension-polyfill';

var user = {};

user.firebaseLogin = function(token) {
    var credential = firebase.auth.GoogleAuthProvider.credential(null, token);
    return firebase.auth().signInWithCredential(credential);
}

user.login = function(interactive) {
    return new Promise((resolve, reject) => {
        function legacyLogin() {
            browser.runtime.sendMessage({
                type: Protocol.BACKGROUND_LOGIN
            }).then((response) => {
                resolve(response);
            }).catch((error) => {
                console.error('ERROR in legacy login', error);
                reject(error);
            });
        }
        if (chrome.identity && chrome.identity.getAuthToken) { // Running on chrome with integrated OAuth2
            chrome.identity.getAuthToken({
                'interactive': interactive
            }, function(token) {
                if (chrome.runtime.lastError) {
                    console.error('Error: ', chrome.runtime.lastError);
                    if(chrome.runtime.lastError.message == 'Function unsupported.') { // OPERA only: run legacy login
                        legacyLogin();
                    } else {
                        reject(chrome.runtime.lastError);
                    }
                } else {
                    user.firebaseLogin(token).then(resolve).catch(reject);
                }
            });
        } else /*if (browser.identity && browser.identity.launchWebAuthFlow)*/ { // Not running on Chrome, using launchWebAuthFlow
            legacyLogin();
        } /*else { // No OAuth APIs -> no login
            reject({
                message: 'OAuth2 not supported, consider updating your browser'
            });
        }*/
    });
}

user.logout = function() {
    return new Promise((resolve, reject) => {
        firebase.auth().signOut().then(function() {
            if (chrome.identity && chrome.identity.getAuthToken) { // Running on chrome with integrated OAuth2
                chrome.identity.getAuthToken({
                    'interactive': false
                }, function(token) {
                    chrome.identity.removeCachedAuthToken({token: token}); // remove token in cache
                    oauthConfig.google.revokeToken(token).then(() => { // revoke token in google
                        resolve();
                    }).catch((err) => {
                        resolve();
                    });
                });
            } else { // Not running on Chrome, implementing OAuth myself
                oauthConfig.google.revokeAndRemoveLocalToken().then(() => {
                    resolve();
                }).catch((err) => { // if no token was found no need to remove it
                    reject(err);
                });
            }
        }).catch(function(error) {
            reject(error);
        });
    });
}

export default user;