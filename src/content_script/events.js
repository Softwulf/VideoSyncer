/*
 * Handles content script events
 */
import jquery from 'jquery';

const syncDelay = 1; // delay between syncs (in seconds)
var lastSync = new Date();

var exports = {
};

exports.init = function(sync, video) {
    exports.sync = sync;
    exports.video = video;
    video.on('remove', removeVideoHandlers);
    video.on('found', attachVideoHandlers);
}

function removeVideoHandlers() {
    jquery(exports.video.videoPlayer).off('play', handlePlay);
    jquery(exports.video.videoPlayer).off('pause', handlePause);
    jquery(exports.video.videoPlayer).off('timeupdate', handleTimeupdate);
    jquery(exports.video.videoPlayer).off('ended', handleEnded);
}

function attachVideoHandlers(data) {
    var videoPlayer = data.player;
    jquery(videoPlayer).on('play', handlePlay);
    jquery(videoPlayer).on('pause', handlePause);
    jquery(videoPlayer).on('ended', handleEnded);
    jquery(videoPlayer).on('timeupdate', handleTimeupdate);
}

// Player tracking functions

function handlePlay(event) {
    console.log('PLAY')
}

function handlePause(event) {
}

function handleEnded(event) {
    alert('ENDED_endtime');
}

function handleTimeupdate(event) {
    localTime = Math.floor(event.target.currentTime);

    if(event.target.paused) return;
    /*
    if((new Date() - lastSync) >= syncDelay * 1000) { // if enough time has passed sync the profile
        publishLocalTime();
        lastSync = new Date();
    }

    if(profile.endTime > 0 && localTime >= profile.endTime) {
        videoPlayer.pause();
        alert('ENDED_endtime');
    }

    renderStatusDiv();
    */
}

/*
 * VideoSyncer events
 */

// Event registers
function disableVideoFinder() {
    selectVideo = false;
    jquery('body').off('click', handleVideoFinder);
}
function enableVideoFinder() {
    selectVideo = true;
    jquery('body').on('click', handleVideoFinder);
    if(window.top == window.self) {
        alert('Click on the video element you want to track');
    }
}

// Event handlers
function handleVideoFinder(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    var video = jquery(event.target);
    
    if(!video.is('video')) {
        video = video.find('video');
    }
    
    if(video.length > 0 && video.is('video')) {
        var query = video.getPath();
        
        publishVideoQuery(window.location.host, null);
        
        video.blink(5);
    } else {
        alert('The clicked element is no video player');
    }

    disableVideoFinder();
}



/*
 * JQuery helper functions
 */
jquery.fn.getPath = function () {
    if (this.length != 1) throw 'Requires one element.';

    var path, node = this;
    while (node.length) {
        var realNode = node[0], name = realNode.localName;
        if (!name) break;
        name = name.toLowerCase();

        var parent = node.parent();

        var siblings = parent.children(name);
        if (siblings.length > 1) { 
            name += ':eq(' + siblings.index(realNode) + ')';
        }

        path = name + (path ? '>' + path : '');
        node = parent;
    }

    return path;
};

jquery.fn.blink = function (count) {
    var $this = jquery(this);

    count = count - 1 || 0;

    $this.animate({opacity: .25}, 100, function () {
        $this.animate({opacity: 1}, 100, function () {
            if (count > 0) {
                $this.blink(count);
            }
        });
    });
};