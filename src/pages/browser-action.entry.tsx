import * as React from 'react';
import * as ReactDOM from 'react-dom';

import 'typeface-roboto';

import { Layout } from 'components/layout';
// import { Button } from 'components/button';
import { SvgIcon, Button, AppBar, Toolbar, Typography, IconButton } from '@material-ui/core';
import { Menu as MenuIcon } from '@material-ui/icons'

import { browser } from 'webextension-polyfill-ts';

class BrowserAction extends React.Component {
    render() {
        return (
            <Layout
                header={
                    <AppBar color='inherit'>
                        <Toolbar variant='dense'>
                            <IconButton color="inherit" aria-label="Menu">
                                <MenuIcon />
                            </IconButton>
                            <Typography variant='title' color='inherit'>
                                VSync
                            </Typography>
                        </Toolbar>
                    </AppBar>
                }
                footer={<div>Footer</div>}
            >
                <Button color='primary'>
                    Hello World
                </Button>
            </Layout>
        )
    }
}

ReactDOM.render(
    <BrowserAction />,
    document.getElementById('root')
)