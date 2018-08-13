import * as React from 'react';
import * as ReactDOM from 'react-dom';

import '../resource-loader'

import { browser } from 'webextension-polyfill-ts';

import { ThemeProvider, ThemeConsumerProps } from 'components/theme-provider';
import { AuthProvider, AuthConsumerProps } from 'components/auth-provider';

import { User } from 'firebase/app';
import { AuthCore } from 'auth/wulf-auth';

import { Typography } from '@material-ui/core';
import { red, green } from '@material-ui/core/colors';

type LoginHandlerProps = AuthConsumerProps & ThemeConsumerProps

type LoginHandlerState = {
    type: 'success' | 'error' | 'pending'
    message: string
    countdown: number
}

class LoginHandler extends React.Component<LoginHandlerProps, LoginHandlerState> {
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
        const tab = await browser.tabs.getCurrent();
        browser.tabs.remove(tab.id);
    }

    render() {
        let title = 'Calculating...';

        let bgColor = this.props.theme.palette.background.default;
        let color = this.props.theme.palette.text.primary;
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

const Wrapper: React.SFC<ThemeConsumerProps> = (props) => (
    <AuthProvider {...props} component={LoginHandler} />
)

ReactDOM.render(
    <ThemeProvider component={Wrapper} />,
    document.getElementById('root')
)