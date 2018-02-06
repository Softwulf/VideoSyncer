/*
 * Handles content script events
 */
import jquery from 'jquery';
import Observable from './observable';
import autobind from 'auto-bind';

export default class VideoInterface extends Observable {
    constructor(observing) {
        super('events', observing);

        this.syncDelay = 1; // delay between syncs (in seconds)
        this.lastSync = new Date();

        autobind(this);

        this.video.on('remove', this.removeVideoHandlers);
        this.video.on('found', this.attachVideoHandlers);
    }

    removeVideoHandlers() {
        jquery(this.video.videoPlayer).off('play', this.handlePlay);
        jquery(this.video.videoPlayer).off('pause', this.handlePause);
        jquery(this.video.videoPlayer).off('timeupdate', this.handleTimeupdate);
        jquery(this.video.videoPlayer).off('ended', this.handleEnded);
    }

    attachVideoHandlers(data) {
        var videoPlayer = data.player;
        jquery(videoPlayer).on('play', this.handlePlay);
        jquery(videoPlayer).on('pause', this.handlePause);
        jquery(videoPlayer).on('ended', this.handleEnded);
        jquery(videoPlayer).on('timeupdate', this.handleTimeupdate);
    }

    handlePlay(event) {
        console.log('PLAY')
    }

    handlePause(event) {
        console.log('PAUSE');
    }

    handleEnded(event) {
        alert('ENDED_endtime');
    }

    handleTimeupdate(event) {
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

    // Click events
    setup(value) {
        if(value) {
            jquery('body').on('click', this.handleVideoFinder);
            if(window.top == window.self) {
                alert('Click on the video element you want to track');
            }
        } else {
            jquery('body').off('click', this.handleVideoFinder);
        }
    }

    handleVideoFinder(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
    
        var video = jquery(event.target);
        
        if(!video.is('video')) {
            video = video.find('video');
        }
        
        if(video.length > 0 && video.is('video')) {
            var query = video.getPath();
            
            this.publish.publishVideoQuery(window.location.host, null);
            
            video.blink(5);
        } else {
            alert('The clicked element is no video player');
        }
    
        this.disableVideoFinder();
    }
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