import * as React from 'react';
import * as ReactDOM from 'react-dom';

import 'typeface-roboto';

import { MainLayout } from './browser-action/main-layout';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { deepOrange, amber } from '@material-ui/core/colors';

const theme = createMuiTheme({
    overrides: {
        MuiButton: {
            root: {
                textTransform: 'none'
            }
        }
    },
    palette: {
        type: 'dark',
        contrastThreshold: 3,
        primary: deepOrange,
        secondary: amber
    }
});

class BrowserAction extends React.Component<{}, {}> {

    render() {
        return (
            <MuiThemeProvider theme={theme}>
                <MainLayout />
            </MuiThemeProvider>
        )
    }
}

ReactDOM.render(
    <BrowserAction />,
    document.getElementById('root')
)