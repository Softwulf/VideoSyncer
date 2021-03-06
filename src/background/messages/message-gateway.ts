import { browser } from 'webextension-polyfill-ts';
import { TopDownMessageUnion } from 'video-tracker/messaging/top-messages';
import { debug } from 'vlogger';

export class MessageGateway {
    constructor() {
        browser.runtime.onMessage.addListener((msg: TopDownMessageUnion, sender) => {
            if(msg.type && msg.type === '@@gateway') {
                const tabId = sender.tab.id;
                debug('Gateway', msg);
                return browser.tabs.sendMessage(tabId, msg)
            }

            return null;
        })
    }
}