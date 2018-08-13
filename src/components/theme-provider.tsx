import * as React from 'react';

import bind from 'bind-decorator';
import { MuiThemeProvider, createMuiTheme, Theme } from '@material-ui/core/styles';
import { deepOrange, amber } from '@material-ui/core/colors';

import { firebase } from '../firebase';

import { browser } from 'webextension-polyfill-ts';

export type ThemeName = Theme['palette']['type'];

const DEFAULT_THEME: ThemeName = 'dark';

const getTheme = (theme: ThemeName): Theme => {
    if (theme !== 'dark' && theme !== 'light') theme = DEFAULT_THEME;
    return createMuiTheme({
        overrides: {
            MuiButton: {
                root: {
                    textTransform: 'none'
                }
            }
        },
        palette: {
            type: theme,
            contrastThreshold: 3,
            primary: deepOrange,
            secondary: amber
        }
    });
}

export type ThemeConsumerProps = {
    setTheme: (theme: ThemeName) => any
    theme: Theme
}

export type ThemeProviderProps = {
    component: React.ComponentClass<ThemeConsumerProps> | React.SFC<ThemeConsumerProps>
}

export type ThemeProviderState = {
    theme: Theme
}

export class ThemeProvider extends React.Component<ThemeProviderProps, ThemeProviderState> {
    constructor(props) {
        super(props);

        this.state = {
            theme: getTheme(DEFAULT_THEME)
        }
    }

    async componentDidMount() {
        const results = await browser.storage.local.get({theme: DEFAULT_THEME});
        this.setState({
            theme: getTheme(results.theme)
        });

        // setup listener
        browser.storage.onChanged.addListener((change, area) => {
            if(area === 'local') {
                if(change.theme) {
                    this.setState({
                        theme: getTheme(change.theme.newValue)
                    })
                }
            }
        });
    }

    @bind
    setTheme(theme: ThemeName) {
        if(this.state.theme.palette.type !== theme && (theme === 'dark' || theme === 'light')) {
            browser.storage.local.set({theme});
            
            // if user is signed in, also update db
            if(firebase.auth().currentUser) {
                firebase.database().ref(`settings/${firebase.auth().currentUser.uid}`).update({theme});
            }
        }
    }

    render() {
        return (
            <MuiThemeProvider theme={this.state.theme}>
                <this.props.component {...this.props} setTheme={this.setTheme} theme={this.state.theme} />
            </MuiThemeProvider>
        )
    }

}