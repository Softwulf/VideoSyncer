import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './tracker.less';

import { ThemeProvider } from 'components/theme-provider';
import { ReduxProvider } from 'pages/_redux/redux-provider';
import { ContentScriptRootView } from './views/main-view';
import { AuthProvider } from 'components/auth-provider';
import { VSyncStorage } from 'background/storage';
import { browser } from 'webextension-polyfill-ts';
import { Typography } from '@material-ui/core';
import { debug } from 'vlogger';


import JssProvider from 'react-jss/lib/JssProvider';
import { create } from 'jss';
import { createGenerateClassName, jssPreset } from '@material-ui/core/styles';
import retargetEvents from 'react-shadow-dom-retarget-events';

const rootId = 'vsync-content-react-root';
const shadowHostId = 'vsync-shadow-container';
const styleHolderId = 'vsync-style-holder';

let reactElement: React.Component

let matchingSeries: VSync.Series | undefined
let disconnected: boolean = false

let alreadySetup = false;

const setup = () => {
    debug('Setting VSync up');
    // Only insert div if it is not already loaded ( SPA's )
    if(!alreadySetup) {
        alreadySetup = true;
        const react_root = document.createElement('div');
        react_root.setAttribute('id', rootId);


        // document.body.insertBefore(react_root, document.body.firstChild);

        const shadowHost = document.createElement('div');
        shadowHost.setAttribute('id', shadowHostId);
        const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

        const styleHolder = document.createElement('div');
        styleHolder.setAttribute('id', styleHolderId)

        shadowRoot.appendChild(react_root);
        shadowRoot.appendChild(styleHolder);

        document.body.insertBefore(shadowHost, document.body.firstChild);

        const jss = create({
            ...jssPreset(),
            insertionPoint: styleHolder,
        });
        const generateClassName = createGenerateClassName();

        ReactDOM.render(
            <JssProvider
                jss={jss}
                generateClassName={generateClassName}
                >
                <ReduxProvider>
                    <ThemeProvider containerId={styleHolderId}>
                        <AuthProvider>
                            <ContentScriptRootView ref={ref => reactElement = ref} />
                        </AuthProvider>
                    </ThemeProvider>
                </ReduxProvider>
            </JssProvider>
            ,
            react_root
        )

        retargetEvents(shadowRoot);
    }
}

const remove = () => {
    debug('Removing VSync');
    const react_root = document.getElementById(rootId);
    if(react_root) {
        ReactDOM.unmountComponentAtNode(react_root);
        react_root.remove();
    }

    alreadySetup = false;
}

browser.runtime.connect().onDisconnect.addListener(p => {
    debug('Video Syncer Disconnected!');
    disconnected = true;
    if(reactElement) {
        (reactElement as any).getWrappedInstance().setDisconnected(disconnected);
        window.alert('Video Syncer disconnected, please refresh tab');
    }
})

// locally store the series list
let seriesList = [];

// check if the current url matches a series and if yes update the react component
function checkMatch() {
    matchingSeries = seriesList.find(series => {
        return window.location.host === series.host && window.location.pathname.startsWith('/'+series.pathbase);
    });

    if(matchingSeries) {
        setup();
        if(reactElement) {
            (reactElement as any).getWrappedInstance().setMatchingSeries(matchingSeries);
        }
        debug('Detected Series: ', matchingSeries.name);
    } else {
        remove();
    }
}

// subscribe to series list changes
const VStorage = new VSyncStorage();

VStorage.subscribe<'series_list'>('series_list', changes => {
    seriesList = changes.newValue;
    debug('New Series received: ', seriesList);

    checkMatch();
});