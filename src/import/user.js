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
        if (chrome.identity.getAuthToken) { // Running on chrome with integrated OAuth2
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

            oauth().then((token) => {
                firebaseLogin(token, resolve, reject);
            }).catch((err) => {
                reject({
                    message: 'Failed to authenticate with google: '+err.message
                });
            });
        } else { // No OAuth APIs, doing it myself
            reject({
                message: 'OAuth2 not supported, consider updating your browser'
            });
        }
    });
}

user.logout = function() {
    return new Promise((resolve, reject) => {
        firebase.auth().signOut()
            .then(function() {
                if (chrome.identity.getAuthToken) { // Running on chrome with integrated OAuth2
                    chrome.identity.getAuthToken({
                        'interactive': false
                    }, function(token) {
                        chrome.identity.removeCachedAuthToken({
                            token: token
                        }, function() {
                            resolve();
                        });
                    });
                } else { // Not running on Chrome, implementing OAuth myself
                    /*const revokeRequest = new Request(oauthConfig.chrome.revokeURL + '?token='+, {
                        method: "GET"
                    });
                    oauthConfig*/
                }
            })
            .catch(function(error) {
                reject(error);
            });
    });
}

const REDIRECT_URL = "https://crosssitefeeding.ch/vsync";
const CLIENT_ID = "879765482619-vhj2vq252njdsjci6co3qheave27qmp6.apps.googleusercontent.com";
const SCOPES = browser.runtime.getManifest().oauth2.scopes;
const AUTH_URL = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URL)}&scope=${encodeURIComponent(SCOPES.join(' '))}`;
const VALIDATION_BASE_URL="https://www.googleapis.com/oauth2/v3/tokeninfo";

function extractAccessToken(redirectUri) {
    let m = redirectUri.match(/[#?](.*)/);
    if (!m || m.length < 1)
        return null;
    let params = new URLSearchParams(m[1].split("#")[0]);
    return params.get("access_token");
}

function validate(redirectURL) {
    const accessToken = extractAccessToken(redirectURL);
    if (!accessToken) {
        throw "Authorization failure";
    }
    const validationURL = `${VALIDATION_BASE_URL}?access_token=${accessToken}`;
    const validationRequest = new Request(validationURL, {
        method: "GET"
    });

    function checkResponse(response) {
        return new Promise((resolve, reject) => {
            if (response.status != 200) {
                reject("Token validation error");
            }
            response.json().then((json) => {
                if (json.aud && (json.aud === CLIENT_ID)) {
                    resolve(accessToken);
                } else {
                    reject("Token validation error");
                }
            });
        });
    }

    return fetch(validationRequest).then(checkResponse);
}

function authorize() {
    return browser.identity.launchWebAuthFlow({
        interactive: true,
        url: AUTH_URL
    });
}

function getAccessToken() {
    return authorize().then(validate);
}

function oauth() {
    return new Promise((resolve, reject) => {
        console.log('Doing oAUTH');

        getAccessToken().then((value) => {
            console.log('VALUE ', value);
            resolve(value);
        }).catch((err) => {
            console.error('ERROR: ', err);
            reject(err);
        });
        //var redirectURL = chrome.identity.getRedirectURL();

        /*var redirectURL = "https://crosssitefeeding.ch/vsync";

        var authURL = oauthConfig.browser.authURL;
        var clientID = oauthConfig.browser.client_id;
        var scopes = oauthConfig.browser.scopes;
        authURL += `?client_id=${clientID}`;
        authURL += `&response_type=token`;
        authURL += `&redirect_uri=${encodeURIComponent(redirectURL)}`;
        authURL += `&scope=${encodeURIComponent(scopes.join(' '))}`;

        browser.identity.launchWebAuthFlow(
            {
                url: authURL,
                interactive: true
            }
        ).then((value) => {
            console.log(value);
            resolve(value);
        }).catch((err) => {
            console.error(err);
            reject(err);
        });*/
    });
}

export default user;