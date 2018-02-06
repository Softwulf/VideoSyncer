/*
 * Publishes data to the db via the background page
 */
import message_protocol from '../import/message-protocol';
import Observable from './observable';
import autobind from 'auto-bind';

export default class VideoInterface extends Observable {
    constructor(observing) {
        super('publish', observing);

        autobind(this);
    }

    publish(type, data) {
        if(this.sync && this.sync.profile) {
            var payload = {
                type: type,
                key: this.sync.profile.key,
                frameId: this.sync.frameId
            };
        
            for (var property in data) {
                if (!data.hasOwnProperty(property)) continue;
            
                var value = data[property];
                payload[property] = value;
            }
        
            console.debug('Payload: ', payload);
        
            chrome.runtime.sendMessage(payload);
        } else {
            console.error('Sync/Profile not setup yet');
        }
    }

    publishNewUrl(url, currentTime) {
        if(url) {
            this.publish({
                type: message_protocol.updateProfileURL,
                url: url,
                currentTime: currentTime
            });
        }
    }

    publishLocalTime(time) {
        if(time) {
            this.publish({
                type: message_protocol.updateProfileTime,
                time: time
            });
        }
    }

    publishVideoQuery(host, query) {
        if(host) {
            this.publish({
                type: message_protocol.updateProfileVideoQuery,
                host: host,
                query: query
            });
        }
    }
}