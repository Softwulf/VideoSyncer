/*
 * renders html elements
 */
import jquery from 'jquery';

var exports = {
    insertId: 'videosyncer_content_div', // ID of inserted status div
};

exports.init = function(sync, video) {
    exports.sync = sync;
    exports.video = video;
}

// Render the status div 
exports.renderStatusDiv = function() {
    var insertId = exports.insertId;
    if(!exports.sync) {
        console.error('Sync not setup yet');
        return;
    }
    if(!exports.video) {
        console.error('Video interface not setup yet');
        return;
    }
    if (exports.sync.profile) { // if profile exists -> modify status div
        var profile = exports.sync.profile;

        var contentHtml = `
            <p>${profile.name} - ${window.location.host} - ${profile.currentTime} - ${exports.sync.frameId}</p>
        `;
        if (jquery('#' + insertId).length == 0) { // if content div is not inserted, add it now
            jquery('body').prepend('<div id="' + insertId + '"></div>');
        }

        jquery('#' + insertId).html(contentHtml);
    } else { // if it does NOT exist -> remove status div
        jquery('#' + insertId).remove();
    }
}

export default exports;