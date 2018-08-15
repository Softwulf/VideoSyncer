import * as React from 'react';
import * as ReactDOM from 'react-dom';

import '../resource-loader'
import './browser-action.less';

import { ThemeProvider } from 'components/theme-provider';
import { AuthProvider } from 'components/auth-provider';
import { MainLayout } from './main-layout';
import { ReduxProvider } from '../_redux/redux-provider';
import { browser } from 'webextension-polyfill-ts';
import { Switch, Route } from 'react-router';
import { Link } from 'react-router-dom';



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

        // add additional borders on the sides on chrome because chrome has tiny hardcoded borders around the popup by default
        if(navigator.vendor.toLowerCase().indexOf('google') !== -1) {
            window.document.getElementById('root').style.borderLeft = '2px solid #FFF';
            window.document.getElementById('root').style.borderRight = '2px solid #FFF';
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