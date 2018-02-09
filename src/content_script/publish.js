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
        
            console.debug('Sending message to extension: ', payload);
        
            chrome.runtime.sendMessage(payload);
        } else {
            console.error('Sync/Profile not setup yet');
        }
    }

    publishNewUrl(url) {
        if(url) {
            this.publish(message_protocol.updateProfileURL, {
                url: url,
                startTime: this.sync.profile.startTime
            });
        }
    }

    publishLocalTime(time) {
        if(time) {
            this.publish(message_protocol.updateProfileTime, {
                time: time
            });
        }
    }

    publishVideoQuery(host, query) {
        if(host) {
            this.publish(message_protocol.updateProfileVideoQuery, {
                host: host,
                query: query
            });
        }
    }

    publishNextQuery(host, query) {
        if(host) {
            this.publish(message_protocol.updateProfileNext, {
                host: host,
                query: query
            });
        }
    }

    publishClickCancel(event) {
        if(event) {
            this.publish(message_protocol.cancelClick, {
                event: event
            });
        }
    }
}