import * as React from 'react';
import * as ReactDOM from 'react-dom';

import '../resource-loader'

import { browser } from 'webextension-polyfill-ts';

import { ThemeProvider } from 'components/theme-provider';

import { AuthCore } from 'auth/wulf-auth';

import { Typography } from '@material-ui/core';
import { red, green } from '@material-ui/core/colors';
import { ThemeState } from '../_redux/themes/types';
import { ReduxProvider } from '../_redux/redux-provider';
import { AuthProvider } from 'components/auth-provider';
import { connect } from 'react-redux';
import { ApplicationState } from '../_redux';

type LoginHandlerProps = {
    theme: ThemeState
}

type LoginHandlerState = {
    type: 'success' | 'error' | 'pending'
    message: string
    countdown: number
}

class LoginHandlerBase extends React.Component<LoginHandlerProps, LoginHandlerState> {
    timer?: any

    constructor(props) {
        super(props);

        this.state = {
            type: 'pending',
            message: '',
            countdown: 5
        }
    }

    startCountdown() {
        this.timer = setInterval(async() => {
            const i = this.state.countdown - 1;
            this.setState({
                countdown: i,
                message: `This page automatically closes in ${i} seconds`
            });
            if(i <= 0) {
                if(this.timer) clearInterval(this.timer);
                this.closeCurrentTab();
            }
        }, 1000);
    }

    async componentDidMount() {
        try {
            await AuthCore.validate(window.location.href);
            this.setState({
                type: 'success',
                message: ''
            });
            this.startCountdown();
        } catch(err) {
            this.setState({
                type: 'error',
                message: `Details: ${JSON.stringify(err)}`
            })
        }
    }

    async closeCurrentTab() {
        browser.runtime.sendMessage({type: 'CLOSE_TAB'});
    }

    render() {
        let title = 'Calculating...';

        let bgColor = this.props.theme.theme.palette.background.default;
        let color = this.props.theme.theme.palette.text.primary;
        if(this.state.type === 'error') {
            title = 'Error!';
            bgColor = red['500'];
            color = '#FFF';
        } else if(this.state.type === 'success') {
            title = 'Signed in!';
            bgColor = green['600'];
            color = '#FFF';
        }

        return (
            <div style={{display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: bgColor}}>
                <Typography variant='display3' style={{color}}>
                    {title}
                </Typography>
                <Typography variant='body2' style={{color}}>
                    {this.state.message}
                </Typography>
            </div>
        );
    }
}

export const LoginHandler = connect((state: ApplicationState): LoginHandlerProps => {
    return {
        theme: state.theme
    }
}, null)(LoginHandlerBase);

ReactDOM.render(
    <ReduxProvider>
        <ThemeProvider>
            <AuthProvider>
                <LoginHandler />
            </AuthProvider>
        </ThemeProvider>
    </ReduxProvider>,
    document.getElementById('root')
)