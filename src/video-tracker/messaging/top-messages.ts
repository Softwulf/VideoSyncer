import { browser } from 'webextension-polyfill-ts';
import { debug } from 'vlogger';

// Format for sending messages to sub-frames
export interface TopDownMessage {
    type: '@@gateway'
}

export interface SetSeriesMessage extends TopDownMessage {
    subtype: '@@frame/SET_SERIES'
    payload: {
        series: VSync.Series | undefined
    }
}

export interface RequestVideoMessage extends TopDownMessage {
    subtype: '@@frame/REQUEST_VIDEO'
}

export interface ConfirmVideoMessage extends TopDownMessage {
    subtype: '@@frame/CONFIRM_VIDEO'
    frameId: string
}

export type TopDownMessageUnion = SetSeriesMessage | RequestVideoMessage | ConfirmVideoMessage;

export class TopDownMessenger {
    private sendMessage(msg: TopDownMessage) {
        debug('[FRAME_MSG]', msg);
        browser.runtime.sendMessage(msg)
    }

    setSeries(series: VSync.Series | undefined) {
        const msg: SetSeriesMessage = {
            type: '@@gateway',
            subtype: '@@frame/SET_SERIES',
            payload: {
                series
            }
        }
        this.sendMessage(msg);
    }

    requestVideo() {
        const msg: RequestVideoMessage = {
            type: '@@gateway',
            subtype: '@@frame/REQUEST_VIDEO'
        }
        this.sendMessage(msg);
    }

    confirmVideo(frameId: string) {
        const msg: ConfirmVideoMessage = {
            type: '@@gateway',
            subtype: '@@frame/CONFIRM_VIDEO',
            frameId
        }
        this.sendMessage(msg);
    }
}