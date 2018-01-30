/*global browser*/
import oauthConfig from './oauth-config';
import { firebase } from './firebase-config';

import extension from 'extensionizer';

import weh from 'weh-content';

var user = {};

function firebaseLogin(token, resolve, reject) {
    var credential = firebase.auth.GoogleAuthProvider.credential(null, token);
    firebase.auth().signInWithCredential(credential).then((user) => {
        resolve(user);
    }).catch((error) => {
        reject(error);
    });
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
                firebaseLogin(token, resolve, reject);
            });
        } else if (browser.identity.launchWebAuthFlow) { // Not running on Chrome, using launchWebAuthFlow
            oauthConfig.google.getLocalToken().then((token) => { // get local token
                firebaseLogin(token, resolve, reject); // login    
            }).catch((err) => {
                oauthConfig.google.fetchAndStoreToken().then((token) => { // if no local token -> fetch new token and persist it
                    firebaseLogin(token, resolve, reject); // login
                }).catch((err) => {
                    reject({message: err.message}); // throw
                });
            });
        } else { // No OAuth APIs -> no login
            reject({
                message: 'OAuth2 not supported, consider updating your browser'
            });
        }
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
                oauthConfig.google.getLocalToken().then((token) => {
                    oauthConfig.google.removeLocalToken().then(() => { // remove local token #doesnt matter if it fails
                        resolve();
                    }).catch((err) => {
                        resolve();
                    });
                    oauthConfig.google.revokeToken(token); // asynchronously revoke token
                }).catch(() => { // if no token was found no need to remove it
                    resolve();
                });
            }
        }).catch(function(error) {
            reject(error);
        });
    });
}

export default user;