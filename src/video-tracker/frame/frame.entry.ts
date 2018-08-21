import { debug } from 'vlogger';
import { browser } from 'webextension-polyfill-ts';
import { TopDownMessageUnion } from '../messaging/top-messages';
import { BottomUpMessenger } from '../messaging/frame-messages';
import { v4 as uuid } from 'uuid'
import { MessageSender } from 'background/messages/message-sender';
import { bind } from 'bind-decorator';
import { FrameSelector } from './selector';

class VSyncFrame {
    disconnected: boolean = false
    activeSeries: VSync.Series | undefined
    name = `${window.location.host}${window.location.pathname}`
    messenger: BottomUpMessenger
    id: string

    video: HTMLVideoElement | undefined
    lastUpdate = new Date().getTime()
    updateInterval = 1000

    constructor() {
        this.id = uuid();
        this.messenger = new BottomUpMessenger(this.id);

        this.listenForMessages();
        this.handleDisconnects();
    }


    @bind
    setupVideo() {
        if(this.video) {
            this.video.addEventListener('timeupdate', this.handleTimeupdate);
            this.video.addEventListener('pause', this.handlePause);
            this.video.addEventListener('play', this.handlePlay);
            this.video.addEventListener('ended', this.handleEnded);
        }
    }

    @bind
    removeVideo() {
        if(this.video) {
            this.video.removeEventListener('timeupdate', this.handleTimeupdate);
            this.video.removeEventListener('pause', this.handlePause);
            this.video.removeEventListener('play', this.handlePlay);
            this.video.removeEventListener('ended', this.handleEnded);
            this.video = undefined;
        }
    }

    @bind
    handleTimeupdate(event: Event) {
        if(this.activeSeries.latestFrame !== this.id) return;

        const target: HTMLVideoElement = event.target as any;
        const videoTime = Math.floor(target.currentTime);
        const maxTime = Math.floor(target.duration);

        if(target.paused) return;

        const now = new Date().getTime();
        if((now - this.lastUpdate) >= this.updateInterval) { // if enough time has passed sync the profile

            if(this.activeSeries.endTime && videoTime >= this.activeSeries.endTime) {
                // Video ended
                this.handleEnded();
            }

            debug('Updating...');
            MessageSender.requestSeriesEdit(this.activeSeries.key, {
                currentTime: videoTime,
                currentMaxTime: maxTime,
                latestFrame: this.id
            })

            this.lastUpdate = now;
        }
    }

    @bind
    handlePause(event: Event) {
        if(this.activeSeries.latestFrame !== this.id) return;

        const target: HTMLVideoElement = event.target as any;
        const videoTime = Math.floor(target.currentTime);
        const maxTime = Math.floor(target.duration);

        const now = new Date().getTime()

        debug('Video was paused, saving');
        MessageSender.requestSeriesEdit(this.activeSeries.key, {
            currentTime: videoTime,
            currentMaxTime: maxTime,
            latestFrame: this.id
        })

        this.lastUpdate = now;
    }

    @bind
    handlePlay(event: Event) {
        debug('Video was played, activating');
        MessageSender.requestSeriesEdit(this.activeSeries.key, {
            latestFrame: this.id
        })
    }

    @bind
    handleEnded() {
        debug('Video ended');
        this.exitFullscreen();
        this.messenger.videoEnded();
    }

    listenForMessages() {
        browser.runtime.onMessage.addListener((message: TopDownMessageUnion, sender) => {
            if(message.type && message.type === '@@gateway') {
                if(message.subtype) {
                    switch(message.subtype) {
                        case '@@frame/SET_SERIES':
                            this.activeSeries = message.payload.series;
                            debug(`Series updated [${this.name}]`, this.activeSeries.name);
                            break;
                        case '@@frame/REQUEST_VIDEO':
                            // only if no player was specified or the host matches
                            if(!this.activeSeries.videoPlayer || this.activeSeries.videoPlayer.host === window.location.host) {
                                const query = this.activeSeries.videoPlayer ? this.activeSeries.videoPlayer.query : 'video'
                                debug('Used Query: ', query);
                                const queried = document.querySelector(query);
                                if(queried) {
                                    if(queried.nodeName === 'VIDEO') {
                                        this.video = queried as HTMLVideoElement;
                                        debug(`Video Found [${this.name}]`, this.video);
                                        this.messenger.videoFound();
                                    }
                                }
                            }
                            break;
                        case '@@frame/CONFIRM_VIDEO':
                            if(message.frameId === this.id) {
                                debug(this.video);
                                this.setupVideo();
                            }
                            break;
                        case '@@frame/REMOVE_VIDEO':
                            if(message.frameId === this.id) {
                                this.removeVideo();
                            }
                            break;
                        case '@@frame/SET_PAUSE':
                            if(message.frameId === this.id) {
                                debug('Video paused: ', message.paused);
                                if(this.video) {
                                    if(message.paused) {
                                        this.video.pause();
                                    } else {
                                        this.video.play();
                                    }
                                }
                            }
                            break;
                        case '@@frame/SET_TIME':
                            if(message.frameId === this.id) {
                                if(this.video) {
                                    debug('Setting Tiiime: ', message.time);
                                    this.video.currentTime = message.time;
                                }
                            }
                            break;
                        case '@@frame/SET_FULLSCREEN':
                            if(message.frameId === this.id) {
                                if(message.fullscreen) {
                                    this.enterFullscreen();
                                } else {
                                    this.exitFullscreen();
                                }
                            }
                            break;
                    }
                }
            }
        });
    }

    handleDisconnects() {
        // Handle disconnect
        browser.runtime.connect().onDisconnect.addListener(p => {
            debug(`Video Syncer frame ${this.name} Disconnected!`);
            this.disconnected = true;
            this.activeSeries = undefined;

            if(this.video) {
                this.video.pause();
            }

            this.removeVideo();
        })
    }

    enterFullscreen() {
        if(!this.video) return;
        if(this.video.webkitEnterFullScreen) this.video.webkitEnterFullScreen();
        else if (this.video.requestFullscreen) this.video.requestFullscreen();
        else if (this.video.webkitRequestFullscreen) this.video.webkitRequestFullscreen();
        else if ((this.video as any).mozRequestFullScreen) (this.video as any).mozRequestFullScreen();
        else if ((this.video as any).msRequestFullscreen) (document as any).msRequestFullscreen();
    }

    exitFullscreen() {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if ((document as any).mozCancelFullScreen) (document as any).mozCancelFullScreen();
        else if ((document as any).msExitFullscreen) (document as any).msExitFullscreen();
    }

}

const vsyncFrame = new VSyncFrame();
const frameSelector = new FrameSelector(vsyncFrame.id);