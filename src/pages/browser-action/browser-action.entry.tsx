import * as React from 'react';
import * as ReactDOM from 'react-dom';

import '../resource-loader'
import './browser-action.less';

import { ThemeProvider, ThemeConsumerProps } from 'components/theme-provider';
import { AuthProvider } from 'components/auth-provider';
import { MainLayout } from './main-layout';

const MainLayoutWrapper: React.SFC<ThemeConsumerProps> = (props) => (
    <AuthProvider {...props} component={MainLayout} />
)

class BrowserAction extends React.Component<{}, {}> {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <ThemeProvider component={MainLayoutWrapper} />
        )
    }
}

ReactDOM.render(
    <BrowserAction />,
    document.getElementById('root')
)