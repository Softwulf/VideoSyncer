import { debug } from 'vlogger';

debug('Frame Tracker injected into ', window.location.host);

const frames = document.getElementsByTagName('iframe');

debug('Frame amount: ', frames.length);

for(let i; i < frames.length; i++) {
    const frame = frames[i];
    debug(`Frame ${window.location.host}/${window.location.pathname} has frame: `);
}