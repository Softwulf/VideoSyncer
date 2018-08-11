import Observable from './observable';
import autobind from 'auto-bind';
import browser from 'webextension-polyfill';

const PROTOCOL = {
    BROADCAST: 'BROADCAST',
    BROADCAST_SPREAD: 'BROADCAST_SPREAD',
    CLIENT_FETCH_PROFILES: 'PROFILES_FETCH',
    CLIENT_UPDATE_PROFILE: 'PROFILE_UPDATE',
    SERVER_CHANGED_PROFILES: 'PROFILES_CHANGED',
    CLICK_INIT: 'CLICK_INIT',
    CLICK_CANCEL: 'CLICK_CANCEL',
    CLIENT_CLICK_CANCEL: 'CLIENT_CLICK_CANCEL',
    BACKGROUND_LOGIN: 'BACKGROUND_LOGIN',
    AUTH0_LOGIN: 'AUTH0_LOGIN',
    AUTH0_LOGOUT: 'AUTH0_LOGOUT',
    AUTH0_VALIDATE: 'AUTH0_VALIDATE'
}

class Server extends Observable {
    constructor(runningInBackground) {
        super('server', null);
        autobind(this);

        if(runningInBackground) {
            this.runningInBackground = runningInBackground;
        }

        browser.runtime.onMessage.addListener(this.handleMessage);
    }

    handleMessage(message, sender) {
        console.debug('Message received ['+message.type+']', message);

        // only handle these events when running in background
        if(this.runningInBackground) {
            // handle broadcast
            if(message.type == PROTOCOL.BROADCAST) {
                var spreadDto = {
                    type: PROTOCOL.BROADCAST_SPREAD,
                    subType: message.subType,
                    key: message.key,
                    data: null
                }

                if(message.data) spreadDto.data = message.data;
                
                console.debug('Spreading broadcast to clients');
                this.notifyAllTabs(spreadDto);
            } else if(message.type == PROTOCOL.CLIENT_CLICK_CANCEL) {
                this.clickCancel({key: message.key}, message.event);
            }
        }

        message.sender = sender;
        return this.call(message.type, message);
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
        browser.tabs.query({}).then(function(tabs){
            for(let i = 0; i < tabs.length;i++) {
                browser.tabs.sendMessage(tabs[i].id, message).then(callback).catch((error) => {
                    //console.error('Error notying tab ', tabs[i].url);
                });
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

        browser.runtime.onMessage.addListener(this.handleMessage);
    }

    fetchProfile() {
        browser.runtime.sendMessage({
            type: PROTOCOL.CLIENT_FETCH_PROFILES
        }).then((response) => {
            this.tabUrl = response.url;
            this.handleIncomingProfiles(response.profiles);
        });
    }

    handleMessage(message, sender) {
        console.debug('incoming runtime message:', message);
        // handle broadcast
        if(message.type == PROTOCOL.BROADCAST_SPREAD) {
            console.debug('Received incoming broadcast', message);
            if(this.profile && message.key == this.profile.key)  {
                return this.call(message.subType, message);
            }
        }
        // handle new profile data
        else if(message.type == PROTOCOL.SERVER_CHANGED_PROFILES) {
            this.handleIncomingProfiles(message.profiles);
        }
        // handle click init
        else if(message.type == PROTOCOL.CLICK_INIT) {
            if(this.profile && message.key == this.profile.key) {
                this.clicks[message.event] = true;
                return this.call('CLICK_INIT_'+message.event);
            }
        }
        // handle click cancel
        else if(message.type == PROTOCOL.CLICK_CANCEL) {
            if(this.profile && message.key == this.profile.key) {
                this.clicks[message.event] = false;
                return this.call('CLICK_CANCEL_'+message.event);
            }
        }
    }

    updateProfile(changes) {
        browser.runtime.sendMessage({
            type: PROTOCOL.CLIENT_UPDATE_PROFILE,
            key: this.profile.key,
            profile: changes,
        });
    }

    broadcastToClients(type, message) {
        console.debug(`Broadcasting message [${type}]`);
        var payload = message;
        payload.type = PROTOCOL.BROADCAST;
        payload.subType = type;
        payload.key = this.profile.key;
        browser.runtime.sendMessage(payload);
    }

    cancelClick(event) {
        browser.runtime.sendMessage({
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