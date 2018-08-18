import { browser } from "webextension-polyfill-ts";
import { RequestActions } from "./requests";

export class MessageListener {
    constructor() {
        browser.runtime.onMessage.addListener(async (message: RequestActions, sender) => {
            if(message.type) {
                switch(message.type) {
                    case '@@request/CLOSE_TAB':
                        return browser.tabs.remove(sender.tab.id);
                }
            }
        });
    }
}