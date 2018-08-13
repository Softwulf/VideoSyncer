import * as React from 'react';
import * as ReactDOM from 'react-dom';

import '../resource-loader'
import './browser-action.less';

import { ThemeProvider } from 'components/theme-provider';
import { AuthProvider } from 'components/auth-provider';
import { MainLayout } from './main-layout';
import { ReduxProvider } from '../_redux/redux-provider';
import { browser } from 'webextension-polyfill-ts';



class BrowserAction extends React.Component<{}, {}> {
    constructor(props) {
        super(props);
    }

    async componentDidMount() {
        // change html & body height / width because on android the popup runs in a tab

        let changeBodyDimensions = false;
        if(browser.runtime && browser.runtime.getPlatformInfo) {
            const platformInfo = await browser.runtime.getPlatformInfo();
            if(platformInfo.os === 'android') changeBodyDimensions = true;
        }
        
        if(changeBodyDimensions) {
            window.document.getElementsByTagName('html').item(0).style.width = '100%';
            window.document.getElementsByTagName('html').item(0).style.height = '100%';

            window.document.getElementsByTagName('body').item(0).style.width = '100%';
            window.document.getElementsByTagName('body').item(0).style.height = '100%';
        }
    }

    render() {
        return (
            <ReduxProvider>
                <ThemeProvider>
                    <AuthProvider>
                        <MainLayout />
                    </AuthProvider>
                </ThemeProvider>
            </ReduxProvider>
        )
    }
}

ReactDOM.render(
    <BrowserAction />,
    document.getElementById('root')
)