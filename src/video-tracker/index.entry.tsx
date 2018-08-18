import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { ThemeProvider } from 'components/theme-provider';
import { ReduxProvider } from 'pages/_redux/redux-provider';
import { ContentScriptRootView } from './views/main-view';
import { AuthProvider } from 'components/auth-provider';

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

setup();

const remove = () => {
    const react_root = document.getElementById(rootId);
    if(react_root) {
        ReactDOM.unmountComponentAtNode(react_root);
        react_root.remove();
    }
}