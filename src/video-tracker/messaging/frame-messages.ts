import { browser } from 'webextension-polyfill-ts';
import { ElementSelection } from './selection';

// Format for sending messages to the top frame
export interface BottomUpMessage {
    type: '@@topmessage'
    frameId: string
}

export interface VideoFoundMessage extends BottomUpMessage {
    subtype: '@@top/VIDEO_FOUND'
}

export interface VideoEndedMessage extends BottomUpMessage {
    subtype: '@@top/VIDEO_ENDED'
}

export interface SelectionDoneMessage extends BottomUpMessage {
    subtype: '@@top/SELECTION_CONFIRMED'
    selection: ElementSelection
    query: string
    host: string
}


export type BottomUpMessageUnion =    VideoFoundMessage
                                    | VideoEndedMessage
                                    | SelectionDoneMessage

export class BottomUpMessenger {
    frameId: string
    constructor(frameId) {
        this.frameId = frameId;
    }

    topWindow(): Window {
        function recursiveWindow(w: Window) {
            if(w.top === w.self) return w;
            return recursiveWindow(w.top); 
        }
    
        return recursiveWindow(window.top);
    }

    videoFound() {
        const msg: VideoFoundMessage = {
            type: '@@topmessage',
            subtype: '@@top/VIDEO_FOUND',
            frameId: this.frameId
        }
        this.topWindow().postMessage(msg, '*');
    }

    videoEnded() {
        const msg: VideoEndedMessage = {
            type: '@@topmessage',
            subtype: '@@top/VIDEO_ENDED',
            frameId: this.frameId
        }
        this.topWindow().postMessage(msg, '*');
    }

    selectionDone(selection: ElementSelection, query: string, host: string) {
        const msg: SelectionDoneMessage = {
            type: '@@topmessage',
            subtype: '@@top/SELECTION_CONFIRMED',
            selection,
            query,
            host,
            frameId: this.frameId
        }
        this.topWindow().postMessage(msg, '*');
    }
}