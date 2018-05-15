/*
 * interfaces with the video element
 */
import jquery from 'jquery';
import Observable from '../import/observable';
import autobind from 'auto-bind';
import { FrameCom } from '../import/communication';

const $ = jquery;

export default class VideoInterface extends Observable {
    constructor(observing) {
        super('video', observing);

        this.videoPlayer = null;

        this.frameCom = new FrameCom();

        this.interval = null;

        autobind(this);

        this.client.on('change_full', this.setupInterval);
        this.client.on('change_full', this.updateTime);

        this.client.on('change_query', this.setupInterval);
        this.client.on('change_removed', () => {
            this.stopInterval();
            this.removeVideo();
        });
        this.client.on('change_timechange', this.updateTime);

        this.frameCom.addAllFrameListener('VIDEO_FOUND', this.stopInterval);
        this.frameCom.addAllFrameListener('VIDEO_GONE', this.setupInterval);

    }

    stopInterval() {
        if(this.interval != null) {
            clearInterval(this.interval);
        }
    }

    setupInterval() {
        if(this.interval == null) {
            this.interval = setInterval(this.findVideo, 1000);
        }
    }

    findVideo() {
        console.debug('findVideo');
        $(() => {
            var query = 'video';
            if(this.client.profile.videoQuery) {
                query = this.client.profile.videoQuery;
            }

            var videoSelect = $(query);

            if(videoSelect.length) {
                // there IS a videoplayer
                this.videoPlayer = videoSelect.get(0);
                this.videoPlayer.vsync_isStarted = false;
                this.videoPlayer.vsync_ended = false;
                this.call('found', {player: this.videoPlayer});
                this.frameCom.callAllFrames('VIDEO_FOUND', {});
            } else {
                if(this.videoPlayer) {
                    this.call('remove');
                    this.frameCom.callAllFrames('VIDEO_GONE', {});
                }
            }
        });
    }

    removeVideo() {
        this.call('remove');
        this.videoPlayer = null;
    }

    updateTime() {
        if(this.videoPlayer) {
            this.videoPlayer.currentTime = this.client.profile.currentTime;
            this.videoPlayer.pause();
        }
    }
}