import browser from 'webextension-polyfill';
import jquery from 'jquery';
import message_protocol from '../import/message-protocol';

var pageURL = null;

// listen for push updates from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if(message.type == message_protocol.pushProfiles) {
        handleProfileListChange(message.profiles);
    }
});

// request profiles NOW
chrome.runtime.sendMessage({
    type: message_protocol.fetchProfiles
}, (response) => {
    pageURL = response.url;
    console.log('This frame ('+window.location.href+') has pageURL ('+pageURL+')');
    handleProfileListChange(response.profiles);
});

/*
 * Begin actual Code
 */

 // Variables
const insertId = 'videosyncer_content_div'; // ID of inserted status div
const syncDelay = 1; // delay between syncs (in seconds)
 

var alreadyInit = false // whether this frame has already been initiated or not
var profile = null; // profile object of current project
var videoPlayer = null; // tracked video player
var localTime = null; // local time of video

var lastSync = new Date();

function handleProfileListChange(profiles) {
    if(profiles) {
        for (var property in profiles) {
            if (!profiles.hasOwnProperty(property)) continue;
        
            var profileParsed = profiles[property];
            profileParsed.key = property;
            if(pageURL && pageURL.indexOf(profileParsed.urlPattern) !== -1) { // Url Pattern matches
                console.log('This site matched with profile: '+profileParsed.name);
                profile = profileParsed;
                handleSingleProfileChange();
                return;
            }
            profile = null;
            handleSingleProfileChange();
        }
    } else {
        console.log('Profiles fully removed (user logout / last profile deleted)');
        profile = null;
        handleSingleProfileChange();
    }
}

/* handle fetches and updates */
function handleSingleProfileChange() {
    if(videoPlayer) {
        jquery(videoPlayer).off('play', handlePlay);
        jquery(videoPlayer).off('pause', handlePause);
        jquery(videoPlayer).off('timeupdate', handleTimeupdate);
        jquery(videoPlayer).off('ended', handleEnded);
    }
    if(profile) {
        var videoSelect = jquery('video');
        if(videoSelect.length) {
            videoPlayer = videoSelect.get(0);
            
            if(profile.currentURL != null && pageURL.indexOf(profile.currentURL) !== -1) { // if the page url is the current url -> continue
                videoPlayer.currentTime = profile.currentTime;
            } else { // otherwise this is a new episode
                if(!alreadyInit) {
                    videoPlayer.currentTime = profile.startTime;
                    publishNewUrl();
                } else {
                    // TODO ask the user to load new episode
                    alert('New episode has been started by another device');
                }
            }

            jquery(videoPlayer).on('play', handlePlay);
            jquery(videoPlayer).on('pause', handlePause);
            jquery(videoPlayer).on('ended', handleEnded);
            jquery(videoPlayer).on('timeupdate', handleTimeupdate);

            console.log('frame "'+ window.location.host + '" has found a player')
        } else {
            console.error('No video player found!');
        }
        alreadyInit = true;
    } else {
        videoPlayer = null;
        alreadyInit = false;
    }

    renderStatusDiv();
}

// Render the status div 
function renderStatusDiv() {
    if (profile) { // if profile exists -> modify status div
        var contentHtml = `
            <p>${profile.name} - ${window.location.host} - ${profile.currentTime} - ${localTime} - Player found '${videoPlayer != null}'</p>
        `;
        if (jquery('#' + insertId).length == 0) { // if content div is not inserted, add it now
            jquery('body').prepend('<div id="' + insertId + '"></div>');
        }

        jquery('#' + insertId).html(contentHtml);
    } else { // if it does NOT exist -> remove status div
        jquery('#' + insertId).remove();
    }
}

// Publishing functions
function publishNewUrl() {
    if(profile && videoPlayer && pageURL) {
        chrome.runtime.sendMessage({
            type: message_protocol.updateProfileURL,
            key: profile.key,
            url: pageURL,
            startTime: profile.startTime
        });
    }
}

function publishLocalTime() {
    if(profile && videoPlayer && localTime) {
        chrome.runtime.sendMessage({
            type: message_protocol.updateProfileTime,
            time: localTime,
            key: profile.key
        });
    }
}

// Player tracking functions

function handlePlay(event) {
    console.log('PLAY', event);
}

function handlePause(event) {
    console.log('PAUSE', event);
    publishLocalTime();
}

function handleEnded(event) {
    console.log('ENDED', event);
    alert('ENDED_endtime');
}

function handleTimeupdate(event) {
    console.log('TIME_UPDATE', event);
    localTime = Math.floor(event.target.currentTime);

    if((new Date() - lastSync) >= syncDelay * 1000) { // if enough time has passed sync the profile
        publishLocalTime();
        lastSync = new Date();
    }

    if(profile.endTime > 0 && localTime >= profile.endTime) {
        videoPlayer.pause();
        alert('ENDED_endtime');
    }

    renderStatusDiv();
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