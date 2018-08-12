import * as React from 'react';
import * as ReactDOM from 'react-dom';

import 'typeface-roboto';

import { MainLayout } from './browser-action/main-layout';

import { MuiThemeProvider, createMuiTheme, Theme } from '@material-ui/core/styles';
import { deepOrange, amber } from '@material-ui/core/colors';

import bind from 'bind-decorator';

type BrowserActionState = {
    theme: Theme
}

class BrowserAction extends React.Component<{}, BrowserActionState> {
    constructor(props) {
        super(props);

        this.state = {
            theme: this.getTheme('dark')
        }
    }

    @bind
    getTheme(theme: Theme['palette']['type']): Theme {
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

    @bind
    setTheme(theme: Theme['palette']['type']) {
        this.setState({
            theme: this.getTheme(theme)
        })
    }

    render() {
        return (
            <MuiThemeProvider theme={this.state.theme}>
                <MainLayout setTheme={this.setTheme} />
            </MuiThemeProvider>
        )
    }
}

ReactDOM.render(
    <BrowserAction />,
    document.getElementById('root')
)