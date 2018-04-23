/*global browser*/
import oauthConfig from './config/oauth-config';
import { firebase } from './config/firebase-config';

import extension from 'extensionizer';

var user = {};

function firebaseLogin(token, resolve, reject) {
    var credential = firebase.auth.GoogleAuthProvider.credential(null, token);
    return firebase.auth().signInWithCredential(credential);
}

user.login = function(interactive) {
    return new Promise((resolve, reject) => {
        if (chrome.identity && chrome.identity.getAuthToken) { // Running on chrome with integrated OAuth2
            chrome.identity.getAuthToken({
                'interactive': interactive
            }, function(token) {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                    return;
                }
                firebaseLogin(token).then(resolve).catch(reject);
            });
        } else /*if (browser.identity && browser.identity.launchWebAuthFlow)*/ { // Not running on Chrome, using launchWebAuthFlow
            oauthConfig.google.getLocalToken().then((token) => { // get local token
                firebaseLogin(token).then(resolve).catch((err) => { // Login with local token, if this doesnt work get a new token
                    oauthConfig.google.fetchAndStoreToken().then((token) => {
                        firebaseLogin(token).then(resolve).catch((err) => {
                            reject({message: err.message});
                        });
                    }).catch((err) => {
                        reject({message: err.message}); // throw
                    });
                });
            }).catch((err) => {
                oauthConfig.google.fetchAndStoreToken().then((token) => { // if no local token -> fetch new token and persist it
                    firebaseLogin(token).then(resolve).catch((err) => {
                        reject({message: err.message});
                    });
                }).catch((err) => {
                    reject({message: err.message}); // throw
                });
            });
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