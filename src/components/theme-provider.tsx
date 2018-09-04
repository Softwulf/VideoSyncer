import * as React from 'react';

import bind from 'bind-decorator';
import { MuiThemeProvider } from '@material-ui/core/styles';


import { ThemeState, ThemeName } from 'pages/_redux/themes/types';
import { HasDispatch, ApplicationState, mapDispatch, HasRouter } from 'pages/_redux';
import { connect } from 'react-redux';
import { setTheme } from 'pages/_redux/themes/actions';
import { VSyncStorage } from 'background/storage';

export type ThemeProviderPropsRedux = {
    theme: ThemeState
} & HasRouter

export type ThemeProviderPropsSelf = {
    containerId?: string
}

class ThemeProviderBase extends React.Component<ThemeProviderPropsRedux & ThemeProviderPropsSelf & HasDispatch, {}> {
    vStorage = new VSyncStorage();

    async componentDidMount() {
        // setup listener
        this.vStorage.subscribe<'settings'>('settings', (changes) => {
            if(this.props.containerId) {
                this.props.dispatch(setTheme(changes.newValue.theme as ThemeName, this.props.containerId));
            } else {
                this.props.dispatch(setTheme(changes.newValue.theme as ThemeName));
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

export const ThemeProvider = connect<ThemeProviderPropsRedux, HasDispatch, ThemeProviderPropsSelf>(
    (state: ApplicationState): ThemeProviderPropsRedux => {
        return {
            theme: state.theme,
            router: state.router
        }
    }, mapDispatch)(ThemeProviderBase)