/*
 * interfaces with the video element
 */
import jquery from 'jquery';
import Observable from '../import/observable';
import autobind from 'auto-bind';

export default class VideoInterface extends Observable {
    constructor(observing) {
        super('video', observing);

        this.videoPlayer = null;

        autobind(this);

        this.client.on('change_full', this.findVideo);
        this.client.on('change_full', this.updateTime);

        this.client.on('change_query', this.findVideo);
        this.client.on('change_removed', this.removeVideo);
        this.client.on('change_timechange', this.updateTime);
    }

    findVideo() {
        if(this.videoPlayer) return; // Player already found

        var query = 'video';
        if(this.client.profile.videoQuery) {
            query = this.client.profile.videoQuery;
        }

        var videoSelect = jquery(query);

        if(videoSelect.length) {
            // there IS a videoplayer
            this.videoPlayer = videoSelect.get(0);
            this.call('found', {player: this.videoPlayer});
        } else {
            this.call('remove');
        }
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