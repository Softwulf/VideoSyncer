import * as React from 'react';

import bind from 'bind-decorator';
import { MuiThemeProvider, createMuiTheme, Theme } from '@material-ui/core/styles';
import { deepOrange, amber } from '@material-ui/core/colors';

export type ThemeName = Theme['palette']['type'];

const DEFAULT_THEME: ThemeName = 'light';

const getTheme = (theme: ThemeName): Theme => {
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


    @bind
    setTheme(theme: ThemeName) {
        if(this.state.theme.palette.type !== theme) {
            this.setState({
                theme: getTheme(theme)
            })
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