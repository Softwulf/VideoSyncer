import * as React from 'react';
import * as ReactDOM from 'react-dom';

import '../resource-loader'
import './browser-action.less';

import { ThemeProvider } from 'components/theme-provider';
import { AuthProvider } from 'components/auth-provider';
import { MainLayout } from './main-layout';
import { ReduxProvider } from '../_redux/redux-provider';



class BrowserAction extends React.Component<{}, {}> {
    constructor(props) {
        super(props);
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