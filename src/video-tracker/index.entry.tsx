import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './tracker.less';

import { ThemeProvider } from 'components/theme-provider';
import { ReduxProvider } from 'pages/_redux/redux-provider';
import { ContentScriptRootView } from './views/main-view';
import { AuthProvider } from 'components/auth-provider';
import { VSyncStorage } from 'background/storage';
import { browser } from 'webextension-polyfill-ts';
import { debug } from 'vlogger';
import { initSentry } from 'vutil';
import { SentryProvider } from 'components/sentry-provider';
import * as Sentry from '@sentry/browser';

const rootId = 'vsync-content-react-root';

let reactElement: React.Component

let matchingSeries: VSync.Series | undefined
let disconnected: boolean = false

initSentry('content-script', {
    beforeSend: (event, hint) => {
        if(!matchingSeries) return null; // Don't send the event if this isn't a tracked site
        return event;
    }
})

Sentry.configureScope(scope => {
    scope.setTag('entrypoint', 'content-script');
});

const setup = () => {
    try {
        debug('Setting VSync up');
        // Only insert div if it is not already loaded ( SPA's )
        if(!document.getElementById(rootId)) {
            const react_root = document.createElement('div');
            react_root.setAttribute('id', rootId);
            document.body.insertBefore(react_root, document.body.firstChild);

            ReactDOM.render(
                <SentryProvider>
                    <ReduxProvider>
                        <ThemeProvider>
                            <AuthProvider>
                                <ContentScriptRootView ref={ref => reactElement = ref} />
                            </AuthProvider>
                        </ThemeProvider>
                    </ReduxProvider>
                </SentryProvider>,
                react_root
            )
        }
    } catch(err) {
        console.error('Failed setting up vsync', err);
        Sentry.captureException(err);
    }
}

const remove = () => {
    try {
        debug('Removing VSync');
        const react_root = document.getElementById(rootId);
        if(react_root) {
            ReactDOM.unmountComponentAtNode(react_root);
            react_root.remove();
        }
    } catch(err) {
        console.log('Failed to remove vsync', err);
        Sentry.captureException(err);
    }
}

browser.runtime.connect().onDisconnect.addListener(p => {
    try {
        debug('Video Syncer Disconnected!');
        disconnected = true;

        // only alert if the tab was tracking a video
        if(reactElement) {
            (reactElement as any).getWrappedInstance().setDisconnected(disconnected);
            window.alert('We lost connection to the VideoSyncer extension. Please refresh the page.');
        }
    } catch(err) {
        console.error('Failed handling disconnect', err);
        Sentry.captureException(err);
    }
})

// locally store the series list
let seriesList = [];

// check if the current url matches a series and if yes update the react component
function checkMatch() {
    try {
        matchingSeries = seriesList.find(series => {
            return window.location.host === series.host && window.location.pathname.startsWith('/'+series.pathbase);
        });
    
        if(matchingSeries) {
            setup();
            if(reactElement) {
                (reactElement as any).getWrappedInstance().setMatchingSeries(matchingSeries);
            }
            debug('Detected Series: ', matchingSeries.name);
            Sentry.configureScope(scope => {
                scope.setTag('series', matchingSeries.key);
            });
        } else {
            remove();
            Sentry.configureScope(scope => {
                scope.setTag('series', undefined);
            });
        }
    } catch(err) {
        console.error('Failed checking for a series match', err);
        Sentry.captureException(err);
    }
}

// subscribe to series list changes
const VStorage = new VSyncStorage();

VStorage.subscribe<'series_list'>('series_list', changes => {
    seriesList = changes.newValue;
    debug('New Series received: ', seriesList);

    checkMatch();
    throw new Error('Testing error, WOW');
});