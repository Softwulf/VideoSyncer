import browser from 'webextension-polyfill';
import oauthConfig from '../import/oauth-config';
import { firebase, db } from '../import/firebase-config';
import weh from 'weh-background';

import message_protocol from '../import/message-protocol';

/*
 * Profile Sync with content scripts
 */

function notifyAllTabs(message, callback) {
    chrome.tabs.query({}, function(tabs){
        for(let i = 0; i < tabs.length;i++) {
            chrome.tabs.sendMessage(tabs[i].id, message, callback);  
        }
    });
}

var profilesRef = null;

// respond to fetches and updates from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.debug('Message received ['+message.type+']', message);

    // FETCH
    if(message.type == message_protocol.fetchProfiles) {
        if(profilesRef) {
            profilesRef.once('value', (profiles) => { // fetch profiles and respond
                sendResponse({
                    profiles: profiles,
                    url: sender.tab.url
                });
            }); 
        } else {
            sendResponse({ // if not logged in respond with NULL
                profiles: null,
                url: sender.tab.url
            });
        }
    // UPDATE TIME
    } else if(message.type == message_protocol.updateProfileTime) {
        var time = message.time;
        var key = message.key;
        var frameId = message.frameId;

        if(profilesRef) {
            var updateObject = {};
            updateObject[key+'/currentTime'] = time;
            updateObject[key+'/latestFrame'] = frameId;
            profilesRef.update(updateObject)
        }
    // UPDATE URL
    } else if(message.type == message_protocol.updateProfileURL) {
        var url = message.url;
        var key = message.key;

        if(profilesRef) {
            profilesRef.child(key).once('value', (profile) => { // fetch profiles and respond
                var startTime = profile.startTime;
                var updateObject = {};
                updateObject[key+'/currentURL'] = url;
                updateObject[key+'/currentTime'] = startTime;
                profilesRef.update(updateObject)
            });
        }
    // UPDATE VIDEO QUERY
    } else if(message.type == message_protocol.updateProfileVideoQuery) {
        var key = message.key;
        var host = message.host;
        var query = message.query;

        if(profilesRef) {
            var updateObject = {};
            updateObject[key+'/videoHost'] = host;
            updateObject[key+'/videoQuery'] = query;
            profilesRef.update(updateObject);
            // tell tabs to cancel selection
            notifyAllTabs({
                type: message_protocol.callVideoSelection,
                key: key,
                value: false
            });
        }
    }
    // cancel a click event
    else if(message.type == message_protocol.cancelClick) {
        var key = message.key;
        var event = message.event;
        notifyAllTabs({
            type: message_protocol.initClick,
            key: key,
            event: event,
            value: false
        });
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
            notifyAllTabs({
                type: message_protocol.pushProfiles,
                profiles: profiles.val()
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