import * as React from 'react';

import bind from 'bind-decorator';
import { MuiThemeProvider } from '@material-ui/core/styles';


import { ThemeState, ThemeName } from 'pages/_redux/themes/types';
import { HasDispatch, ApplicationState, mapDispatch, HasRouter } from 'pages/_redux';
import { connect } from 'react-redux';
import { setTheme } from 'pages/_redux/themes/actions';
import { VSyncStorage } from 'background/storage';

export type ThemeProviderProps = {
    theme: ThemeState
} & HasRouter

class ThemeProviderBase extends React.Component<ThemeProviderProps & HasDispatch, {}> {
    vStorage = new VSyncStorage();

    async componentDidMount() {
        // setup listener
        this.vStorage.subscribe<'settings'>('settings', (changes) => {
            this.props.dispatch(setTheme(changes.newValue.theme as ThemeName));
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