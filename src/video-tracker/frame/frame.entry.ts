import { debug } from 'vlogger';
import { browser } from 'webextension-polyfill-ts';
import { TopDownMessageUnion } from '../messaging/top-messages';
import { BottomUpMessenger } from '../messaging/frame-messages';
import { v4 as uuid } from 'uuid'
import { MessageSender } from 'background/messages/message-sender';
import { bind } from 'bind-decorator';

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
    handleTimeupdate(event: Event) {
        const target: HTMLVideoElement = event.target as any;
        const videoTime = Math.floor(target.currentTime);

        if(target.paused) return;

        const now = new Date().getTime();
        debug(`${now} - ${this.lastUpdate} = ${now - this.lastUpdate} >= ${this.updateInterval}`);

        if((now - this.lastUpdate) >= this.updateInterval) { // if enough time has passed sync the profile

            MessageSender.requestSeriesEdit(this.activeSeries.key, {
                currentTime: videoTime,
                latestFrame: this.id
            })

            this.lastUpdate = now;
        }
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
                            const videos = document.getElementsByTagName('video');
                            if(videos.length > 0) {
                                this.video = videos[0];
                                debug(`Video Found [${this.name}]`, this.video);
                                this.messenger.videoFound();
                            }
                            break;
                        case '@@frame/CONFIRM_VIDEO':
                            if(message.frameId === this.id) {
                                debug(this.video);
                                if(this.video) {
                                    this.video.addEventListener('timeupdate', this.handleTimeupdate);
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
        })
    }

}

new VSyncFrame();