/*
 * interfaces with the video element
 */
import jquery from 'jquery';
import Observable from './observable';
import autobind from 'auto-bind';

export default class VideoInterface extends Observable {
    constructor(observing) {
        super('video', observing);

        this.videoPlayer = null;

        autobind(this);

        this.sync.on('change_full', this.findVideo);
        this.sync.on('change_query', this.findVideo);
        this.sync.on('change_removed', this.removeVideo);
        this.sync.on('change_timechange', this.updateTime);
    }

    findVideo(queryInput) {
        if(this.videoPlayer) return; // Player already found
        var query = 'video';
        if(queryInput) query = queryInput;
        var videoSelect = jquery(query);
        if(videoSelect.length) {
            // there IS a videoplayer
            console.log('beginning to call', this);
            console.log('call method: ', this.call);
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
            this.videoPlayer.currentTime = this.sync.profile.currentTime;
        }
    }
}