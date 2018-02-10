import Observable from './observable';
import autobind from 'auto-bind';

const PROTOCOL = {
    BROADCAST: 'BROADCAST',
    BROADCAST_SPREAD: 'BROADCAST_SPREAD',
    CLIENT_FETCH_PROFILES: 'PROFILES_FETCH',
    CLIENT_UPDATE_PROFILE: 'PROFILE_UPDATE',
    SERVER_CHANGED_PROFILES: 'PROFILES_CHANGED',
    CLICK_INIT: 'CLICK_INIT',
    CLICK_CANCEL: 'CLICK_CANCEL',
    CLIENT_CLICK_CANCEL: 'CLIENT_CLICK_CANCEL',
}

class Server extends Observable {
    constructor(runningInBackground) {
        super('server', null);
        autobind(this);

        if(runningInBackground) {
            this.runningInBackground = runningInBackground;
        }

        chrome.runtime.onMessage.addListener(this.handleMessage);
    }

    handleMessage(message, sender, sendResponse) {
        console.debug('Message received ['+message.type+']', message);

        // only handle these events when running in background
        if(this.runningInBackground) {
            // handle broadcast
            if(message.type == PROTOCOL.BROADCAST) {
                message.type == PROTOCOL.BROADCAST_SPREAD;
                this.notifyAllTabs(message);
            } else if(message.type == PROTOCOL.CLIENT_CLICK_CANCEL) {
                this.clickCancel({key: message.key}, message.event);
            }
        }

        message.sender = sender;
        message.sendResponse = sendResponse;
        this.call(message.type, message);
    }

    clickInit(profile, event) {
        this.notifyAllTabs({
            type: PROTOCOL.CLICK_INIT,
            key: profile.key,
            event: event
        });
    }

    clickCancel(profile, event) {
        this.notifyAllTabs({
            type: PROTOCOL.CLICK_CANCEL,
            key: profile.key,
            event: event
        });
    }

    pushProfiles(profiles) {
        this.notifyAllTabs({
            type: PROTOCOL.SERVER_CHANGED_PROFILES,
            profiles: profiles
        });
    }

    notifyAllTabs(message, callback) {
        console.debug('Notifying tabs: ', message);
        chrome.tabs.query({}, function(tabs){
            for(let i = 0; i < tabs.length;i++) {
                chrome.tabs.sendMessage(tabs[i].id, message, callback);  
            }
        });
    }
}

//
// CLIENT
//

class Client extends Observable {
    constructor() {
        super('client', null);
        autobind(this);

        this.profile = null;
        this.previousProfile = null;
        this.tabUrl = null;
        this.clicks = {};

        // generate new frameid
        this.frameId = '';
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 15; i++) {
            this.frameId += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        chrome.runtime.onMessage.addListener(this.handleMessage);
    }

    fetchProfile() {
        chrome.runtime.sendMessage({
            type: PROTOCOL.CLIENT_FETCH_PROFILES
        }, (response) => {
            this.tabUrl = response.url;
            this.handleIncomingProfiles(response.profiles);
        });
    }

    handleMessage(message, sender, sendResponse) {
        // handle broadcast
        if(message.type == PROTOCOL.BROADCAST) {
            console.log('broadcast received', message);
            if(message.key == this.profile.key)  {
                this.call(message.subType, message);
            }
        }
        // handle new profile data
        else if(message.type == PROTOCOL.SERVER_CHANGED_PROFILES) {
            this.handleIncomingProfiles(message.profiles);
        }
        // handle click init
        else if(message.type == PROTOCOL.CLICK_INIT) {
            if(message.key == this.profile.key) {
                this.clicks[message.event] = true;
                this.call('CLICK_INIT_'+message.event);
            }
        }
        // handle click cancel
        else if(message.type == PROTOCOL.CLICK_CANCEL) {
            if(message.key == this.profile.key) {
                this.clicks[message.event] = false;
                this.call('CLICK_CANCEL_'+message.event);
            }
        }
    }

    updateProfile(changes) {
        chrome.runtime.sendMessage({
            type: PROTOCOL.CLIENT_UPDATE_PROFILE,
            key: this.profile.key,
            profile: changes,
        });
    }

    broadcastToClients(type, message) {
        var payload = message;
        payload.type = PROTOCOL.BROADCAST;
        payload.subType = type;
        payload.key = this.profile.key;
        chrome.runtime.sendMessage(payload);
    }

    cancelClick(event) {
        chrome.runtime.sendMessage({
            type: PROTOCOL.CLIENT_CLICK_CANCEL,
            key: this.profile.key,
            event: event
        });
    }

    // Parse profiles and find differences
    handleIncomingProfiles(profiles) {
        var previousProfile = this.previousProfile;
        var matchedProfile = null;

        if(profiles) {
            for (var property in profiles) {
                if (!profiles.hasOwnProperty(property)) continue;
            
                var profileParsed = profiles[property];

                profileParsed.key = property;
                if(this.tabUrl && this.tabUrl.indexOf(profileParsed.urlPattern) !== -1) { // Url Pattern matches
                    // A profile matched -> enable videosyncer
                    if(!this.previousProfile && window.top == window.self) {
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
            else if(previousProfile.currentURL != matchedProfile.currentURL) {
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
}

export {
    Server as SyncServer,
    Client as SyncClient,
    PROTOCOL as Protocol
}