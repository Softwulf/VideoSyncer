/*
 * Syncs content script with db via background script
 */
import message_protocol from '../import/message-protocol';

/* Events:
 * - click
 * - change_removed
 * - change_full
 * - change_currenturl
 * - change_query
 * - change_timechange
 * - change_minor
 */

var exports = {
    previousProfile: null,
    profile: null,
    frameId: generateId(),
    pageUrl: null
};

var listeners = [];

// setup listeners
exports.on = (event, listener) => {
    listeners.push({event: event, listener: listener});
}

function call(event, data) {
    for(let i = 0; i < listeners.length; i++) {
        var obj = listeners[i];
        if(obj.event == event) {
            obj.listener(data);
        }
    }
}

/*
 * Setup for real-time syncing
 */

// listen for push updates from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if(message.type == message_protocol.pushProfiles) {
        handleIncomingData(message.profiles);
    }
    // listen for video selections
    else if(message.type == message_protocol.callVideoSelection) {
        if(profile && profile.key == message.key) {
            call('click', {event: message.event, value: message.value})
        }
    }
});

function handleIncomingData(profiles) {
    var previousProfile = exports.previousProfile;
    var matchedProfile = null;
    if(profiles) {
        for (var property in profiles) {
            if (!profiles.hasOwnProperty(property)) continue;
        
            var profileParsed = profiles[property];
            profileParsed.key = property;
            if(pageURL && pageURL.indexOf(profileParsed.urlPattern) !== -1) { // Url Pattern matches
                // A profile matched -> enable videosyncer
                if(!previousProfile) {
                    console.log('This site matched with profile: '+profileParsed.name);
                }
                matchedProfile = profileParsed;
                break;
            }
        }
    }

    findDifferences(previousProfile, matchedProfile);
}

function findDifferences(previousProfile, matchedProfile) {
    exports.profile = matchedProfile;
    
    // if no profile was set before and now is, full change
    if(previousProfile == null && matchedProfile != null) {
        call('change_full');
    }
    // if latest profile existed but no longer
    else if(previousProfile != null && matchedProfile == null) {
        call('change_removed');
    }
    // if both exist
    else if(previousProfile != null && matchedProfile != null) {
        // if completely new profile
        if(previousProfile.key != matchedProfile.key) {
            call('change_full');
        }
        // if url changed and this is not the latest frame
        else if(previousProfile.currentURL != matchedProfile.currentURL && matchedProfile.latestFrame != frameId) {
            call('change_currenturl');
        }
        // if query changed
        else if(previousProfile.videoQuery != matchedProfile.videoQuery || previousProfile.videoHost != matchedProfile.videoHost) {
            call('change_query');
        }
        // if currentTime changed and this is not the latest frame
        else if(previousProfile.currentTime != matchedProfile.currentTime && matchedProfile.latestFrame != frameId) {
            call('change_timechange');
        }
        // every other change
        else {
            call('change_minor');
        }
    }

    exports.previousProfile = matchedProfile;
}

export default exports;

// util
// generate frame ID
function generateId() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 15; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
}