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

export interface RemoveVideoMessage extends TopDownMessage {
    subtype: '@@frame/REMOVE_VIDEO',
    frameId: string
}

export interface SetPausedMessage extends TopDownMessage {
    subtype: '@@frame/SET_PAUSE'
    frameId: string
    paused: boolean
}

export interface SetTimeMessage extends TopDownMessage {
    subtype: '@@frame/SET_TIME'
    frameId: string
    time: number
}

export interface SetFullscreenMessage extends TopDownMessage {
    subtype: '@@frame/SET_FULLSCREEN'
    frameId: string
    fullscreen: boolean
}

export type TopDownMessageUnion = SetSeriesMessage | RequestVideoMessage | ConfirmVideoMessage | RemoveVideoMessage | SetPausedMessage | SetTimeMessage | SetFullscreenMessage

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

    removeVideo(frameId: string) {
        const msg: RemoveVideoMessage = {
            type: '@@gateway',
            subtype: '@@frame/REMOVE_VIDEO',
            frameId
        }
        this.sendMessage(msg);
    }

    setPaused(frameId: string, paused: boolean) {
        const msg: SetPausedMessage = {
            type: '@@gateway',
            subtype: '@@frame/SET_PAUSE',
            frameId,
            paused
        }
        this.sendMessage(msg);
    }

    setTime(frameId: string, time: number) {
        const msg: SetTimeMessage = {
            type: '@@gateway',
            subtype: '@@frame/SET_TIME',
            frameId,
            time
        }
        this.sendMessage(msg);
    }

    setFullscreen(frameId: string, fullscreen: boolean) {
        const msg: SetFullscreenMessage = {
            type: '@@gateway',
            subtype: '@@frame/SET_FULLSCREEN',
            frameId,
            fullscreen
        }
        this.sendMessage(msg);
    }
}