/*
 * Syncs content script with db via background script
 */
import message_protocol from '../import/message-protocol';
import Observable from './observable';
import autobind from 'auto-bind';

/* Events:
 * - click
 * - change_removed
 * - change_full
 * - change_currenturl
 * - change_query
 * - change_timechange
 * - change_minor
 */

export default class Sync extends Observable {
    constructor(observing) {
        super('sync', observing);
        const self = this;

        this.frameId = this.generateId();
        this.pageUrl = null;
        this.previousProfile = null;
        this.profile = null;

        autobind(this);

        // listen for push updates from background
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if(message.type == message_protocol.pushProfiles) {
                self.handleIncomingData(message.profiles);
            }
            // listen for video selections
            else if(message.type == message_protocol.callVideoSelection) {
                if(self.profile && self.profile.key == message.key) {
                    self.call('click', {event: message.event, value: message.value})
                }
            }
        });
    }

    fetch() {
        var self = this;
        chrome.runtime.sendMessage({
            type: message_protocol.fetchProfiles
        }, (response) => {
            self.pageUrl = response.url;
            self.handleIncomingData(response.profiles);
        });
    }

    handleIncomingData(profiles) {
        var self = this;

        var previousProfile = self.previousProfile;
        var matchedProfile = null;

        if(profiles) {
            for (var property in profiles) {
                if (!profiles.hasOwnProperty(property)) continue;
            
                var profileParsed = profiles[property];

                profileParsed.key = property;
                if(self.pageUrl && self.pageUrl.indexOf(profileParsed.urlPattern) !== -1) { // Url Pattern matches
                    // A profile matched -> enable videosyncer
                    if(!self.previousProfile && window.top == window.self) {
                        console.log('This site matched with profile: '+profileParsed.name);
                    }
                    matchedProfile = profileParsed;
                    break;
                }
            }
        }
    
        this.findDifferences(previousProfile, matchedProfile);
    }
    
    findDifferences(previousProfile, matchedProfile) {
        this.profile = matchedProfile;
        
        // if no profile was set before and now is, full change
        if(previousProfile == null && matchedProfile != null) {
            this.call('change_full');
        }
        // if latest profile existed but no longer
        else if(previousProfile != null && matchedProfile == null) {
            this.call('change_removed');
        }
        // if both exist
        else if(previousProfile != null && matchedProfile != null) {
            // if completely new profile
            if(previousProfile.key != matchedProfile.key) {
                this.call('change_full');
            }
            // if url changed and this is not the latest frame
            else if(previousProfile.currentURL != matchedProfile.currentURL && matchedProfile.latestFrame != this.frameId) {
                this.call('change_currenturl');
            }
            // if query changed
            else if(previousProfile.videoQuery != matchedProfile.videoQuery || previousProfile.videoHost != matchedProfile.videoHost) {
                this.call('change_query');
            }
            // if currentTime changed and this is not the latest frame
            else if(previousProfile.currentTime != matchedProfile.currentTime && matchedProfile.latestFrame != this.frameId) {
                this.call('change_timechange');
            }
            // every other change
            else {
                this.call('change_minor');
            }
        }
    
        this.previousProfile = matchedProfile;
    }

    // generate frame ID
    generateId() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 15; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}