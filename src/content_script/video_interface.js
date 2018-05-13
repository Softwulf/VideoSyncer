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

        autobind(this);

        this.client.on('change_full', this.findVideo);
        this.client.on('change_full', this.updateTime);

        this.client.on('change_query', this.findVideo);
        this.client.on('change_removed', this.removeVideo);
        this.client.on('change_timechange', this.updateTime);
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
                this.frameCom.callTopFrame('VIDEO_FOUND', {});
            } else {
                this.call('remove');
                this.frameCom.callTopFrame('VIDEO_GONE', {});
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