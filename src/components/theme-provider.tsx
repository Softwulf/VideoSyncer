import * as React from 'react';

import bind from 'bind-decorator';
import { MuiThemeProvider, createMuiTheme, Theme } from '@material-ui/core/styles';


import { firebase } from '../firebase';

import { browser } from 'webextension-polyfill-ts';
import { defaultState } from 'pages/_redux/themes/reducers';
import { ThemeState, ThemeName } from 'pages/_redux/themes/types';
import { HasDispatch, ApplicationState, mapDispatch, HasRouter } from 'pages/_redux';
import { connect } from 'react-redux';
import { setTheme } from 'pages/_redux/themes/actions';

export type ThemeProviderProps = {
    theme: ThemeState
} & HasRouter

class ThemeProviderBase extends React.Component<ThemeProviderProps & HasDispatch, {}> {
    async componentDidMount() {
        const results = await browser.storage.local.get({theme: defaultState.name});

        this.props.dispatch(setTheme(results.theme));

        // setup listener
        browser.storage.onChanged.addListener((change, area) => {
            if(area === 'local') {
                if(change.theme) {
                    this.props.dispatch(setTheme(change.theme.newValue));
                }
            }
        });
    }

    render() {
        return (
            <MuiThemeProvider theme={this.props.theme.theme}>
                {this.props.children}
            </MuiThemeProvider>
        )
    }
}

export const ThemeProvider = connect(
    (state: ApplicationState): ThemeProviderProps => {
        return {
            theme: state.theme,
            router: state.router
        }
    }, mapDispatch)(ThemeProviderBase)


export const changeTheme = (theme: ThemeName): boolean => {
    if(theme === 'dark' || theme === 'light') {
        browser.storage.local.set({theme});

        // if user is signed in, also update db
        if(firebase.auth().currentUser) {
            firebase.database().ref(`settings/${firebase.auth().currentUser.uid}`).update({theme});
        }
        return true;
    }
    return false;
}