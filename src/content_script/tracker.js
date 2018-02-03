import browser from 'webextension-polyfill';
import jquery from 'jquery';
import message_protocol from '../import/message-protocol';

/*
 * Setup for real-time syncing
 */

function generateId() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 15; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
}

var pageURL = null;
var selectVideo = false;

var frameId = generateId();

function disableVideoFinder() {
    selectVideo = false;
    jquery('body').off('click', handleVideoFinder);
}
function enableVideoFinder() {
    selectVideo = true;
    jquery('body').on('click', handleVideoFinder);
    if(window.top == window.self) {
        alert('Click on the video element you want to track');
    }
}

// listen for push updates from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if(message.type == message_protocol.pushProfiles) {
        findMatchingProfile(message.profiles);
    }
    // listen for video selections
    else if(message.type == message_protocol.callVideoSelection) {
        if(profile && profile.key == message.key) {
            enableVideoFinder();
        }
    }
});



// request profiles NOW
chrome.runtime.sendMessage({
    type: message_protocol.fetchProfiles
}, (response) => {
    pageURL = response.url;
    findMatchingProfile(response.profiles);
});

// Publishing functions
function publishNewUrl() {
    if(profile && videoPlayer && pageURL) {
        chrome.runtime.sendMessage({
            type: message_protocol.updateProfileURL,
            key: profile.key,
            frameId: frameId,
            url: pageURL,
            startTime: profile.startTime
        });
    }
}

function publishLocalTime() {
    if(profile && videoPlayer && localTime) {
        chrome.runtime.sendMessage({
            type: message_protocol.updateProfileTime,
            key: profile.key,
            frameId: frameId,
            time: localTime
        });
    }
}

function publishVideoQuery(host, query) {
    chrome.runtime.sendMessage({
        type: message_protocol.updateProfileVideoQuery,
        key: profile.key,
        frameId: frameId,
        host: host,
        query: query
    });
}

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

// Parse firebase profiles and find matching profile
function findMatchingProfile(profiles) {
    disableVideoFinder();
    if(profiles) {
        for (var property in profiles) {
            if (!profiles.hasOwnProperty(property)) continue;
        
            var profileParsed = profiles[property];
            profileParsed.key = property;
            if(pageURL && pageURL.indexOf(profileParsed.urlPattern) !== -1) { // Url Pattern matches

                // A profile matched -> enable videosyncer
                console.log('This site matched with profile: '+profileParsed.name);
                profile = profileParsed;
                handleDataChange();
                return;
            }

            // No profile matched -> disable videosyncer
            profile = null;
            handleDataChange();
        }
    } else {
        // No profiles provided -> disable videosyncer
        console.log('Profiles fully removed (user logout / last profile deleted)');
        profile = null;
        handleDataChange();
    }
}

/* handle fetches and updates */
function handleDataChange() {
    // remove listeners on video element
    if(videoPlayer) {
        jquery(videoPlayer).off('play', handlePlay);
        jquery(videoPlayer).off('pause', handlePause);
        jquery(videoPlayer).off('timeupdate', handleTimeupdate);
        jquery(videoPlayer).off('ended', handleEnded);
    }
    if(profile) {
        // setup videoplayer tracking
        // check if there is a specific host specified
        if(profile.videoHost && profile.videoHost != window.location.host) {
            // this frame does not match the specified host
        } else {
            var query = 'video';
            if(profile.videoQuery) query = profile.videoQuery;
    
            // search video element with provided query
            var videoSelect = jquery(query);
            if(videoSelect.length) {
                // there IS a videoplayer
                videoPlayer = videoSelect.get(0);
                
                if(profile.currentURL != null && pageURL.indexOf(profile.currentURL) !== -1) { // if the page url is the current url -> continue
                    // update local time ONLY if it wasnt this frame updating it
                    var update = true;

                    if(profile.latestFrame) {
                        console.log(latestFrame + ' was set');
                        if(profile.latestFrame == frameId) {
                            console.log('latestframe matched');
                            update = false;
                        }
                    }

                    if(!alreadyInit) {
                        update = true;
                    }

                    if(update) {
                        videoPlayer.currentTime = profile.currentTime;
                    }
                } else { // otherwise this is a new episode
                    if(!alreadyInit) {
                        videoPlayer.currentTime = profile.startTime;
                        publishNewUrl();
                    } else {
                        // TODO ask the user to load new episode
                        alert('New episode has been started by another device');
                    }
                }
    
                // attach event handlers
                jquery(videoPlayer).on('play', handlePlay);
                jquery(videoPlayer).on('pause', handlePause);
                jquery(videoPlayer).on('ended', handleEnded);
                jquery(videoPlayer).on('timeupdate', handleTimeupdate);
    
                console.log('frame "'+ window.location.host + '" has found a player')
            } else {
                console.error('No video player found!');
            }
        }
        alreadyInit = true;
    } else {
        // remove videplayer tracking
        videoPlayer = null;
        localTime = null;
        // enable new profile to be initiated from this page
        alreadyInit = false;
    }

    renderStatusDiv();
}

// Render the status div 
function renderStatusDiv() {
    if (profile && videoPlayer) { // if profile exists -> modify status div
        var contentHtml = `
            <p>${profile.name} - ${window.location.host} - ${profile.currentTime} - ${frameId}</p>
        `;
        if (jquery('#' + insertId).length == 0) { // if content div is not inserted, add it now
            jquery('body').prepend('<div id="' + insertId + '"></div>');
        }

        jquery('#' + insertId).html(contentHtml);
    } else { // if it does NOT exist -> remove status div
        jquery('#' + insertId).remove();
    }
}

// Player tracking functions

function handlePlay(event) {
}

function handlePause(event) {
    publishLocalTime();
}

function handleEnded(event) {
    alert('ENDED_endtime');
}

function handleTimeupdate(event) {
    localTime = Math.floor(event.target.currentTime);

    if(videoPlayer.paused) return;

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
 * VideoSyncer events
 */

function handleVideoFinder(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    var video = jquery(event.target);
    
    if(!video.is('video')) {
        video = video.find('video');
    }
    
    if(video.length > 0 && video.is('video')) {
        var query = video.getPath();
        
        publishVideoQuery(window.location.host, null);
        
        video.blink(5);
    } else {
        alert('The clicked element is no video player');
    }

    disableVideoFinder();
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