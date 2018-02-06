/*
 * interfaces with the video element
 */
import jquery from 'jquery';

var exports = {
    videoPlayer: null
}

exports.init = function(sync, video) {
    exports.sync = sync;
    sync.on('change_full', exports.findVideo);
    sync.on('change_query', exports.findVideo);
    sync.on('change_removed', exports.removeVideo);
    sync.on('change_timechange', exports.updateTime);
}

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

exports.findVideo = (queryInput) => {
    if(this.videoPlayer) return; // Player already found
    var query = 'video';
    if(queryInput) query = queryInput;
    var videoSelect = jquery(query);
    if(videoSelect.length) {
        // there IS a videoplayer
        exports.videoPlayer = videoSelect.get(0);
        call('found', {player: exports.videoPlayer});
        console.log('FOUND');
    } else {
        call('remove');
    }
}

exports.removeVideo = () => {
    call('remove');
    this.videoPlayer = null
}

exports.updateTime = () => {
    if(this.videoPlayer) {
        this.videoPlayer.currentTime = this.sync.profile.currentTime;
    }
}

export default exports;