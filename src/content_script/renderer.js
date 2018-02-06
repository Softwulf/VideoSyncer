/*
 * renders html elements
 */
import jquery from 'jquery';
import Observable from './observable';
import autobind from 'auto-bind';

export default class VideoInterface extends Observable {
    constructor(observing) {
        super('renderer', observing);

        this.insertId = 'videosyncer_content_div'; // ID of inserted status div

        autobind(this);
    }

    renderStatusDiv() {
        if(!this.sync) {
            console.error('Sync not setup yet');
            return;
        }
        if(!this.video) {
            console.error('Video interface not setup yet');
            return;
        }
        if (this.sync.profile) { // if profile exists -> modify status div
            var profile = this.sync.profile;
    
            var contentHtml = `
                <p>${profile.name} - ${window.location.host} - ${profile.currentTime} - ${this.sync.frameId}</p>
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