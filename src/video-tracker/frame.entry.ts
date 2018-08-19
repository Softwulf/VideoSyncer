import { debug } from 'vlogger';

debug('Frame Tracker injected into ', window.location.host);

window.addEventListener('message', event => {
    if(event.data.type && event.data.type === 'test') {
        const frames = window.self.frames;

        debug('Message received ['+ window.location.host+window.location.pathname +']: ', event.data);

        for(let i; i < frames.length; i++) {
            // debug(`Frame ${window.location.host}/${window.location.pathname} has frame: `);
        }
    }
})