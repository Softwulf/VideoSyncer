/*
 * Publishes data to the db via the background page
 */
import message_protocol from '../import/message-protocol';

var exports = {
};

exports.init = function(sync, video) {
    exports.sync = sync;
    exports.video = video;
}

function publish(type, data) {
    if(exports.sync && exports.sync.profile) {
        var payload = {
            type: type,
            key: exports.sync.profile.key,
            frameId: exports.sync.frameId
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

/*
 * Publishing functions
 */
exports.publishNewUrl = function(url, currentTime) {
    if(url && profileKey) {
        publish({
            type: message_protocol.updateProfileURL,
            url: url,
            currentTime: currentTime
        });
    }
}

exports.publishLocalTime = function(frameId, profileKey, time) {
    if(time && profileKey) {
        publish({
            type: message_protocol.updateProfileTime,
            time: time
        });
    }
}

exports.publishVideoQuery = function(frameId, profileKey, host, query) {
    if(host) {
        publish({
            type: message_protocol.updateProfileVideoQuery,
            host: host,
            query: query
        });
    }
}

export default exports;