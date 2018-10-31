import { RequestScriptInjection } from 'background/messages/requests';
import { browser } from 'webextension-polyfill-ts';
import { debug } from 'vlogger';

if(!document.body.getAttribute('vsynced')) {
    debug(`Injection script loaded into [${window.location.host}/${window.location.pathname}]`)
    const injectionRequest: RequestScriptInjection = {
        type: '@@request/INJECT_SCRIPT',
        payload: {
            script: 'FRAME'
        }
    }
    browser.runtime.sendMessage(injectionRequest);

    document.body.setAttribute('vsynced', 'affirmative');
}