import browser from 'webextension-polyfill';
import jquery from 'jquery';

import message_protocol from '../import/message-protocol';

var pageURL = null;

// listen for push updates from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if(message.type == message_protocol.pushProfiles) {
        handleProfileListChange(message.profiles);
    }
});

// request profiles NOW
chrome.runtime.sendMessage({
    type: message_protocol.fetchProfiles
}, (response) => {
    pageURL = response.url;
    console.log('This frame ('+window.location.href+') has pageURL ('+pageURL+')');
    handleProfileListChange(response.profiles);
});

/*
 * Begin actual Code
 */

function handleProfileListChange(profiles) {
    if(profiles) {
        for (var property in profiles) {
            if (!profiles.hasOwnProperty(property)) continue;
        
            var profileParsed = profiles[property];
            profileParsed.key = property;
            if(pageURL && pageURL.indexOf(profileParsed.urlPattern) !== -1) { // Url Pattern matches
                console.log('This site matched with profile: '+profileParsed.name);
                profile = profileParsed;
                handleSingleProfileChange();
                return;
            }
            profile = null;
            handleSingleProfileChange();
        }
    } else {
        console.log('Profiles fully removed (user logout / last profile deleted)');
        profile = null;
        handleSingleProfileChange();
    }
}

var insertId = 'videosyncer_content_div';

var profile = null; // profile object of current project

/* render new profile status page */
function handleSingleProfileChange() {
    if (profile) { // if profile exists -> modify status div
        var contentHtml = `
            <p>${profile.name} - ${window.location.host}</p>
        `;
        if (jquery('#' + insertId).length == 0) { // if content div is not inserted, add it now
            jquery('body').prepend('<div id="' + insertId + '"></div>');
        }

        jquery('#' + insertId).html(contentHtml);
    } else { // if it does NOT exist -> remove status div
        jquery('#' + insertId).remove();
    }
}