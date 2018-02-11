import browser from 'webextension-polyfill';
import oauthConfig from '../import/config/oauth-config';
import { firebase, db } from '../import/config/firebase-config';
import weh from 'weh-background';

import { SyncServer, Protocol } from '../import/sync';

const Server = new SyncServer(true);
var profilesRef = null;

/*
 * Profile Sync with content scripts
 */


// Handle client profile fetch
Server.on(Protocol.CLIENT_FETCH_PROFILES, (message) => {
    if(profilesRef) {
        profilesRef.once('value', (profiles) => { // fetch profiles and respond
            message.sendResponse({
                profiles: profiles.val(),
                url: message.sender.tab.url
            });
        }); 
    } else {
        message.sendResponse({ // if not logged in respond with NULL
            profiles: null,
            url: message.sender.tab.url
        });
    }
});

// Update profile in DB
Server.on(Protocol.CLIENT_UPDATE_PROFILE, (message) => {
    var key = message.key;
    var profile = message.profile;
    if(profilesRef) {
        var updateObject = {};

        // only update the given fields
        for (var property in profile) {
            if (!profile.hasOwnProperty(property)) continue;
        
            var value = profile[property];

            updateObject[key+'/'+property] = value;
        }
        profilesRef.update(updateObject)
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
            Server.pushProfiles(profiles.val());
        }, function(error) {
            console.error('Failed to read profiles: ', err);
        });
    } else { // user is now logged out
        console.log('User is now logged out, notifying all watch pages');

        profilesRef = null;
        // remove profiles from all content scripts
        Server.pushProfiles(null);
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