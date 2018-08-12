import { browser } from 'webextension-polyfill-ts';

const MESSAGE_TYPES = {
    TOP_FRAME: 'TOP_FRAME',
    ALL_FRAMES: 'ALL_FRAMES'
}

const TYPE_FIELD = '_type';
const EVENT_FIELD = '_event';

function createListener(event, listener) {
    return {
        event: event,
        callback: listener
    }
}

class BackgroundGateway {
    constructor() {
        browser.runtime.onMessage.addListener((message, sender) => {
            
            if (sender.tab && sender.tab.id) {
                return new Promise((resolve, reject) => {
                    browser.tabs.sendMessage(
                        sender.tab.id,
                        message
                    ).then(resolve).catch(reject);
                });
            } else {
                console.error('No tab was specified');
            }
        });
    }
}

class Frame {
    constructor() {
        this.allFrameListeners = [];
        this.topFrameListeners = [];

        browser.runtime.onMessage.addListener((message, sender) => {
            var finalResponse = null;
            function callListeners(listeners) {
                for(let i = 0; i < listeners.length; i++) {
                    var listener = listeners[i];
                    var event = listener.event;
                    var callback = listener.callback;
                    // call callback if listener subscribed to that event OR listener didnt specify an event
                    if(event == null || message[EVENT_FIELD] == event) {
                        var listenerResponse = callback(message);
                        if(listenerResponse != null) finalResponse = listenerResponse;
                    }
                }
            }
            if(message[TYPE_FIELD] == MESSAGE_TYPES.ALL_FRAMES) {
                callListeners(this.allFrameListeners);
            } else if(message[TYPE_FIELD] == MESSAGE_TYPES.TOP_FRAME) {
                callListeners(this.topFrameListeners);
            }
            
            if(finalResponse != null) {
                return new Promise((resolve, reject) => {
                    resolve(finalResponse);
                });
            }
        })
    }

    // Sends a message with specified type to the background gateway
    gateway(event, message, type) {
        message[TYPE_FIELD] = type;
        message[EVENT_FIELD] = event;
        return browser.runtime.sendMessage(message);
    }

    // Calls top frame of tab and gets ONE response
    callTopFrame(event, message) {
        return this.gateway(event, message, MESSAGE_TYPES.TOP_FRAME);
    }

    // calls all frames and gets THE FIRST response
    callAllFrames(event, message) {
        return this.gateway(event, message, MESSAGE_TYPES.ALL_FRAMES);
    }

    addTopFrameListener(event, listener) {
        if(window.top == window.self) {
            this.topFrameListeners.push(createListener(event, listener));
        }
    }

    addAllFrameListener(event, listener) {
        this.allFrameListeners.push(createListener(event, listener));
    }
}

export {
    BackgroundGateway,
    Frame as FrameCom
}