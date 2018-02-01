import browser from 'webextension-polyfill';
import oauthConfig from '../import/oauth-config';
import { firebase, db } from '../import/firebase-config';
import weh from 'weh-background';

import message_protocol from '../import/message-protocol';

/*
 * Profile Sync with content scripts
 */

var profilesRef = null;

// respond to fetches from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if(message.type == message_protocol.fetchProfiles) {
        if(profilesRef) {
            profilesRef.once('value', sendResponse); // fetch profiles and respond
        } else {
            sendResponse(null); // if not logged in respond with NULL
        }
    }
});

// push updates to content script
firebase.auth().onAuthStateChanged(handleLoginStateChange); // listen to user logins / logouts LATER
handleLoginStateChange(firebase.auth().currentUser); // init with current login state NOW

function handleLoginStateChange(user) {
    if (profilesRef) profilesRef.off();
    if (user) { // user is now logged in
        console.log('User is now logged in, notifying all watch pages');

        profilesRef = db.ref('profiles/' + user.uid);
    
        profilesRef.on('value', function(profiles) { // push profile update to content scripts
            console.log('Profiles changed, notifying all watch pages', profiles.val());
            chrome.tabs.query({}, function(tabs){
                for(let i = 0; i < tabs.length;i++) {
                    chrome.tabs.sendMessage(tabs[i].id, {
                        type: message_protocol.pushProfiles,
                        profiles: profiles.val()
                    }, function(response) {});  
                }
            });
        }, function(error) {
            console.error('Failed to read profiles: ', err);
        });
    } else { // user is now logged out
        console.log('User is now logged out, notifying all watch pages');

        profilesRef = null;
        // remove profiles from all content scripts
        chrome.runtime.sendMessage({
            type: message_protocol.pushProfiles,
            profiles: null
        });
    }
}

/*
 * Check for oauth2 logins in legacy browsers
 */
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