/*global chrome*/
import { firebase } from './firebase-config';

var user = {};

user.login = function (interactive) {
    return new Promise((resolve, reject) => {
        if (chrome.identity.getAuthToken) {
            chrome.identity.getAuthToken({
                'interactive': interactive
            }, function (token) {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                    return;
                }

                var credential = firebase.auth.GoogleAuthProvider.credential(null, token);
                firebase.auth().signInWithCredential(credential).then((user) => {
                    resolve(user);
                }).catch((error) => {
                    reject(error);
                });

            });
        } else {
            reject({ message: 'No getAuthToken method found' });
        }
    });
}

user.logout = function () {
    return new Promise((resolve, reject) => {
        firebase.auth().signOut()
            .then(function () {
                if (chrome.identity.getAuthToken) {
                    chrome.identity.getAuthToken({
                        'interactive': false
                    }, function (token) {
                        chrome.identity.removeCachedAuthToken({ token: token }, function () {
                            resolve();
                        });
                    });
                }
            })
            .catch(function (error) {
                reject(error);
            });
    });
}

export default user;