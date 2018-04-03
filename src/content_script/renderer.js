/*
 * renders html elements
 */
import jquery from 'jquery';
import Observable from '../import/observable';
import autobind from 'auto-bind';

export default class Renderer extends Observable {
    constructor(observing) {
        super('renderer', observing);

        this.insertId = 'videosyncer_content_div'; // ID of inserted status div
        this.playerClass = 'videosyncer_player';

        autobind(this);

        this.video.on('found', this.markVideo);
        this.video.on('remove', this.unmarkVideo);
    }

    markVideo(data) {
        var player = data.player;
        player.classList.add(this.playerClass);
    }

    unmarkVideo() {
        var player = this.video.videoPlayer;
        if(player) {
            player.classList.remove(this.playerClass);
        }
    }

    renderStatusDiv() {
        if(!this.client) {
            console.error('Sync not setup yet');
            return;
        }
        if(!this.video) {
            console.error('Video interface not setup yet');
            return;
        }
        if (this.client.profile) { // if profile exists -> modify status div
            var profile = this.client.profile;
    
            var contentHtml = `
                <p>${profile.name} - ${window.location.host} - ${profile.currentTime} - ${this.client.frameId}</p>
            `;
            if (jquery('#' + this.insertId).length == 0) { // if content div is not inserted, add it now
                jquery('body').prepend('<div id="' + this.insertId + '"></div>');
            }
    
            jquery('#' + this.insertId).html(contentHtml);
        } else { // if it does NOT exist -> remove status div
            jquery('#' + this.insertId).remove();
        }
    }
}