import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './tracker.less';

import { ThemeProvider } from 'components/theme-provider';
import { ReduxProvider } from 'pages/_redux/redux-provider';
import { ContentScriptRootView } from './views/main-view';
import { AuthProvider } from 'components/auth-provider';
import { VSyncStorage } from 'background/storage';

const rootId = 'vsync-content-react-root';

const setup = () => {
    // Only insert div if it is not already loaded ( SPA's )
    if(!document.getElementById(rootId)) {
        const react_root = document.createElement('div');
        react_root.setAttribute('id', rootId);
        document.body.insertBefore(react_root, document.body.firstChild);

        ReactDOM.render(
            <ReduxProvider>
                <ThemeProvider>
                    <AuthProvider>
                        <ContentScriptRootView />
                    </AuthProvider>
                </ThemeProvider>
            </ReduxProvider>,
            react_root
        )
    }
}

const remove = () => {
    const react_root = document.getElementById(rootId);
    if(react_root) {
        ReactDOM.unmountComponentAtNode(react_root);
        react_root.remove();
    }
}


remove(); // remove the current react element, if this is a re-inject

// Save current date so if refresh occurs we can react accordingly
const injectDate = new Date();
let currentDate = injectDate;

// Check if the url matches

let seriesList = [];

function checkMatch() {
    console.debug('checking match');

    const matchingSeries = seriesList.find(series => {
        return window.location.host === series.host && window.location.pathname.startsWith('/'+series.pathbase);
    });

    if(matchingSeries) {
        setup();
    } else {
        remove();
    }
}

const VStorage = new VSyncStorage();

VStorage.subscribe<'series_list'>('series_list', changes => {
    seriesList = changes.newValue;

    checkMatch();
});

interface DeactivateMessage {
    type: '@@vsync/DEACTIVATE_SCRIPT'
    date: string
}

// Remove History listener when new script is injected
window.addEventListener('message', (event) => {
    const msg: DeactivateMessage = event.data;
    if(msg.type === '@@vsync/DEACTIVATE_SCRIPT') {
        const receivedOn = new Date(parseInt(msg.date));
        if(receivedOn > injectDate) {
            currentDate = receivedOn;
            console.debug('Deactivating vsync from', injectDate.toLocaleString())
        }
    }
})

// Send the deactivation message for the old script
const deactivateMsg: DeactivateMessage = {
    type: '@@vsync/DEACTIVATE_SCRIPT',
    date: injectDate.getTime().toString()
}
window.self.postMessage(deactivateMsg, '*');