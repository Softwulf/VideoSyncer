import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './resource-loader'

import { ThemeProvider, ThemeConsumerProps } from 'components/theme-provider';
import { AuthProvider } from 'components/auth-provider';
import { MainLayout } from './browser-action/main-layout';

const MailLayoutWrapper: React.SFC<ThemeConsumerProps> = (props) => (
    <AuthProvider {...props} component={MainLayout} />
)

class BrowserAction extends React.Component<{}, {}> {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <ThemeProvider component={MailLayoutWrapper} />
        )
    }
}

ReactDOM.render(
    <BrowserAction />,
    document.getElementById('root')
)