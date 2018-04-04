/*
 * Handles content script events
 */
import jquery from 'jquery';
import Observable from '../import/observable';
import autobind from 'auto-bind';

export default class Events extends Observable {
    constructor(observing) {
        super('events', observing);

        this.syncDelay = 1; // delay between syncs (in seconds)
        this.lastSync = new Date();

        // constants
        this.selectHover = 'videosyncer_hover';

        autobind(this);

        this.video.on('remove', this.removeVideoHandlers);
        this.video.on('found', this.attachVideoHandlers);

        this.client.on('change_currenturl', this.handleUrlChange);
        this.client.on('gotoNext', this.gotoNext);
        this.client.on('countToNext', this.countToNext);
        this.client.on('cancelAutoplay', this.cancelAutoplay);

        this.client.on('CLICK_INIT_NEXT', this.initNextClick);
        this.client.on('CLICK_CANCEL_NEXT', this.cancelNextClick);
        this.client.on('CLICK_INIT_SETUP', this.initSetupClick);
        this.client.on('CLICK_CANCEL_SETUP', this.cancelSetupClick);

        // mark elements on hover
        jquery('body').children().mouseover((e) => {
            jquery('.'+this.selectHover).removeClass(this.selectHover);
            if(this.client.clicks.NEXT || this.client.clicks.SETUP) {
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
        if(this.client.tabUrl.indexOf(this.client.profile.currentURL) == -1) {
            if(window.top == window.self) {
                window.location.href = this.client.profile.currentURL;
            }
            this.video.videoPlayer.pause();
        }
    }

    cancelAutoplay() {
        if(window.top == window.self) {
            this.autoPlay = null;
        }
    }

    countToNext() {
        console.log(`count to next ${window.top == window.self && this.client.profile && this.client.profile.nextHost} `)
        if(window.top == window.self && this.client.profile && this.client.profile.nextHost) {
            var setupCountdown = (counter) => {
                jquery('body').prepend(`
                <div class="vsync_countdown">
                    <h1>Next in ${counter} seconds</h1>
                    <button id="vsync_nextCancel">Cancel</button>
                </div>`);
                jquery('.vsync_countdown').on('click', '#vsync_nextCancel', () => {
                    console.debug('autoplay cancelled');
                    this.cancelAutoplay();
                    teardownCountdown();
                });
            }

            var updateCountdown = (counter) => {
                jquery('.vsync_countdown').html(`
                <h1>Next in ${counter} seconds</h1>
                <button id="vsync_nextCancel">Cancel</button>`);
            }

            var teardownCountdown = () => {
                jquery('.vsync_countdown').remove();
            }

            console.debug('countToNext');
            this.autoPlay = true;

            var counter = 15; // time until next episode (in seconds)
            setupCountdown(counter);

            // init countdown
            var nextTick = () => {
                if(!this.autoPlay) {
                    return;
                }
                updateCountdown(counter);
                counter--;
                if(counter >= 0 && this.autoPlay) {
                    setTimeout(nextTick, 1000);
                } else {
                    if(this.autoPlay) {
                        this.client.broadcastToClients('gotoNext', {});
                    }
                    teardownCountdown();
                }
            }
            nextTick();
        }
    }

    gotoNext() {
        console.debug('GotoNext');
        if(this.client.profile && this.client.profile.nextHost) {
            console.debug(`next host [${window.location.host} - ${this.client.profile.nextHost}]`);
            if(window.location.host == this.client.profile.nextHost) {
                var nextButton = jquery(this.client.profile.nextQuery);
                console.debug(nextButton);
                if(nextButton.length > 0) {
                    nextButton.get(0).click();
                }
            } else {
                console.debug('this is not ye right frame');
            }
        } else {
            console.error('No next setup yet');
        }
    }

    handlePlay(event) {
        var newEpisode = this.client.tabUrl.indexOf(this.client.profile.currentURL) == -1;
        if(newEpisode) {
            this.video.videoPlayer.currentTime = this.client.profile.startTime;
            this.client.updateProfile({
                currentURL: this.client.tabUrl,
                currentTime: this.client.profile.startTime,
                latestFrame: this.client.frameId
            });
        } else {
            console.debug('not a new episode, checking if there is a need to set current time', !this.video.videoPlayer.vsync_isStarted)
            console.debug('current time: ',this.client.profile.currentTime);
            if(!this.video.videoPlayer.vsync_isStarted) {
                this.video.videoPlayer.currentTime = this.client.profile.currentTime;
                this.video.videoPlayer.vsync_isStarted = true;
            }
        }
    }

    handlePause(event) {
        this.client.updateProfile({
            currentTime: Math.floor(this.video.videoPlayer.currentTime),
            latestFrame: this.client.frameId
        });
    }

    handleEnded(event) {
        this.handleEnded();
    }

    handleTimeupdate(event) {
        var localTime = Math.floor(event.target.currentTime);
    
        if(event.target.paused) return;
        
        if((new Date() - this.lastSync) >= this.syncDelay * 1000) { // if enough time has passed sync the profile
            this.client.updateProfile({
                currentTime: localTime,
                latestFrame: this.client.frameId
            });
            this.lastSync = new Date();
        }
    
        if(this.client.profile && this.client.profile.endTime > 0 && localTime >= this.client.profile.endTime) {
            if(!this.video.videoPlayer.vsync_ended) {
                this.video.videoPlayer.vsync_ended = true;
                this.handleEnded();
            }
        }
    
    }

    handleEnded() {
        this.video.videoPlayer.pause();
        this.exitFullscreen();
        this.client.broadcastToClients('countToNext', {});
    }

    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    // Click events

    // NEXT
    initNextClick() {
        jquery('.'+this.selectHover).removeClass(this.selectHover);
        jquery('body').on('click', this.handleNextFinder);
        if(window.top == window.self) {
            alert('Click on the next button');
        }
    }
    cancelNextClick() {
        jquery('body').off('click', this.handleNextFinder);
    }

    handleNextFinder(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
    
        var next = jquery(event.target);
        
        if(next.length > 0) {
            var query = next.getPath();

            this.client.updateProfile({
                nextHost: window.location.host,
                nextQuery: query,
            });
            
            next.blink(5);
        } else {
            alert('There was no element being clicked');
        }
    
        this.client.cancelClick('NEXT');
    }

    // SETUP
    initSetupClick() {
        jquery('.'+this.selectHover).removeClass(this.selectHover);
        jquery('body').on('click', this.handleVideoFinder);
        if(window.top == window.self) {
            alert('Click on the video element you want to track');
        }
    }
    cancelSetupClick() {
        jquery('body').off('click', this.handleVideoFinder);
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

            this.client.updateProfile({
                videoHost: window.location.host,
                videoQuery: query
            });
            
            video.blink(5);
        } else {
            alert('The clicked element is no video player');
        }
    
        this.client.cancelClick('SETUP');
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