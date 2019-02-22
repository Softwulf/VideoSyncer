import * as Yup from 'yup';
import * as Sentry from '@sentry/browser';

export const secondsToHms = (seconds: number, includeHours: boolean): string => {
    const d = Number(seconds);

    const h = Math.floor(d / 3600);
    const m = Math.floor(d % 3600 / 60);
    const s = Math.floor(d % 3600 % 60);

    const hourString = h < 10 ? ('0' + h).slice(-2) : h;
    const minuteString = ('0' + m).slice(-2);
    const secondString = ('0' + s).slice(-2); 
    
    let timeString = includeHours ? (h > 0 ? hourString + ':' : '') : '';

    return timeString + minuteString + ':' + secondString;
}

export const shorten = (msg: string, len: number, dir?: 'start' | 'end'): string => {
    if(!dir) dir = 'start';
    if(msg.length <= len) return msg;
    
    if(dir === 'start') {
        const shortened = msg.substring(msg.length-(len-3), msg.length);
        return '...'+shortened
    } else {
        const shortened = msg.substring(0, len-3);
        return shortened+'...'
    }
}

export const SeriesValidationSchema = Yup.object().shape({
    host: Yup.string().ensure().required('You need to set a website').test('is-host', 'This must be a valid website (eg. watch.example.com)', value => {
        const host: string = value;
        const ipRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/
        const domainRegex = /^[a-zA-Z0-9]+([-.][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/
        if(!host.match(ipRegex) && !host.match(domainRegex)) {
            return false;
        }
        return true;
    }),
    pathbase: Yup.string().ensure().required('You need to provide a path'),
    name: Yup.string().ensure().required('You need to provide a name').min(2, 'The name must atleast be 2 characters long').max(20, 'The name must have at most 20 characters'),
    
    startTime: Yup.number().default(0).positive('The video cannot start at a negative time').max(1000000000, 'The startime cannot exceed 1000000000 seconds'),
    endTime: Yup.number().default(0).positive('The video cannot end at a negative time').max(1000000000, 'The end time must not exceed 1000000000 seconds')
})

export const getDefaultSeries = (): VSync.SeriesBase => {
    return {
        name: '',
        host: '',
        pathbase: '',
        protocol: 'https',
        startTime: 0,
        endTime: 0,
        autoplay: true,

        currentTime: 0,
        currentMaxTime: 0,
        currentPath: ''
    }
}

declare const ___SENTRY_RELEASE___: string;

export const initSentry = (entrypoint, additionalOptions?: Partial<Sentry.BrowserOptions>) => {
    if(!additionalOptions) additionalOptions = {};
    Sentry.init({
        dsn: 'https://af02a9bd343246778354cf4ed212fff3@sentry.io/1397392',
        release: ___SENTRY_RELEASE___ === 'dev-local' ? undefined : ___SENTRY_RELEASE___,
        environment: ___SENTRY_RELEASE___ === 'dev_local' ? undefined : 'production',
        ...additionalOptions
    });
    Sentry.configureScope(scope => {
        scope.setTag('entrypoint', entrypoint);
    });
}