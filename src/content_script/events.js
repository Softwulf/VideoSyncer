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

        this.setupNow = false;
        this.nextNow = false;

        // constants
        this.selectHover = 'videosyncer_hover';

        autobind(this);

        this.video.on('remove', this.removeVideoHandlers);
        this.video.on('found', this.attachVideoHandlers);

        this.sync.on('click', this.handleClickInvocation);
        this.sync.on('change_currenturl', this.handleUrlChange);

        jquery('body').children().mouseover((e) => {
            jquery('.'+this.selectHover).removeClass(this.selectHover);
            if(this.setupNow || this.nextNow) {
                jquery(e.target).addClass(this.selectHover);
                return false;
            }
        }).mouseout((e) => {
            jquery(this).removeClass(this.selectHover);
        });
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

    handleUrlChange() {
        if(this.sync.newEpisode()) {
            if(window.top == window.self) {
                window.location.href = this.sync.profile.currentURL;
            }
            this.video.videoPlayer.pause();
        }
    }

    gotoNext() {
        if(this.sync.profile && this.sync.profile.nextHost) {
            if(window.location.host == this.sync.profile.nextHost) {
                var nextButton = jquery(this.sync.profile.nextQuery);
                console.log(nextButton);
                if(nextButton.length > 0) {
                    nextButton.click();
                }
            }
        } else {
            console.error('No next setup yet');
        }
    }

    handlePlay(event) {
        var newEpisode = this.sync.newEpisode();
        if(newEpisode) {
            this.video.videoPlayer.currentTime = this.sync.profile.startTime;
            this.publish.publishNewUrl(this.sync.pageUrl);
        }
    }

    handlePause(event) {
        this.publish.publishLocalTime(Math.floor(this.video.videoPlayer.currentTime));
    }

    handleEnded(event) {
        this.gotoNext();
    }

    handleTimeupdate(event) {
        var localTime = Math.floor(event.target.currentTime);
    
        if(event.target.paused) return;
        
        if((new Date() - this.lastSync) >= this.syncDelay * 1000) { // if enough time has passed sync the profile
            this.publish.publishLocalTime(localTime);
            this.lastSync = new Date();
        }
    
        if(this.sync.profile && this.sync.profile.endTime > 0 && localTime >= this.sync.profile.endTime) {
            this.video.videoPlayer.pause();
            this.gotoNext();
        }
    
    }

    // Click events
    handleClickInvocation(data) {
        var value = data.value;
        var event = data.event;
        if(event == 'setup') this.setup(value);
        if(event == 'next') this.next(value);
    }

    next(value) {
        this.nextNow = value;
        jquery('.'+this.selectHover).removeClass(this.selectHover);
        if(value) {
            jquery('body').on('click', this.handleNextFinder);
            if(window.top == window.self) {
                alert('Click on the next button');
            }
        } else {
            jquery('body').off('click', this.handleNextFinder);
        }
    }

    handleNextFinder(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
    
        var next = jquery(event.target);
        
        if(next.length > 0) {
            var query = next.getPath();

            this.publish.publishNextQuery(window.location.host, query);
            
            next.blink(5);
        } else {
            alert('There was no element being clicked');
        }
    
        this.publish.publishClickCancel('next');
    }

    setup(value) {
        this.setupNow = value;
        jquery('.'+this.selectHover).removeClass(this.selectHover);
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

            this.publish.publishVideoQuery(window.location.host, query);
            
            video.blink(5);
        } else {
            alert('The clicked element is no video player');
        }
    
        this.publish.publishClickCancel('setup');
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