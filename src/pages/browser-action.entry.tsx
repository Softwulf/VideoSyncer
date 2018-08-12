import * as React from 'react';
import * as ReactDOM from 'react-dom';

import 'typeface-roboto';

import { Layout } from 'components/layout';
// import { Button } from 'components/button';
import { SvgIcon, AppBar, Toolbar, Typography, IconButton, BottomNavigation, BottomNavigationAction } from '@material-ui/core';

// import SvgIcon from '@material-ui/core/SvgIcon';
// import AppBar from '@material-ui/core/AppBar';
// import Toolbar from '@material-ui/core/Toolbar';
// import Typography from '@material-ui/core/Typography';
// import IconButton from '@material-ui/core/IconButton';
// import BottomNavigation from '@material-ui/core/BottomNavigation';
// import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
// import Button from '@material-ui/core/Button'

import SwipeableViews from 'react-swipeable-views';

import {
    Menu as MenuIcon,
    SettingsApplications as SettingsApplicationsIcon,
    HomeRounded as HomeIcon,
    Info as InfoIcon

} from '@material-ui/icons'

import { browser } from 'webextension-polyfill-ts';
import { Button } from 'components/button';

type BrowserActionState = {
    bottomNavigation: number
}

class BrowserAction extends React.Component<{}, BrowserActionState> {
    state = {
        bottomNavigation: 0
    }

    render() {
        return (
            <Layout
                header={
                    <AppBar color='primary'>
                        <Toolbar variant='dense' color='inherit'>
                        <IconButton color='inherit' aria-label='Menu'>
                                <MenuIcon />
                            </IconButton>
                            <Typography variant='title' color='inherit' style={{flexGrow: 1}}>
                                VSync
                            </Typography>
                            <Button color='primary' variant='contained'>Log out</Button>
                        </Toolbar>
                    </AppBar>
                }
                footer={
                    <BottomNavigation
                        showLabels
                        value={this.state.bottomNavigation}
                        onChange={(event, value) => {
                            this.setState({
                                bottomNavigation: value
                            })
                        }}
                        style={{
                            display: 'flex'
                        }}
                    >
                        <BottomNavigationAction label='Profiles' icon={<HomeIcon />} />
                        <BottomNavigationAction label='Tutorial' icon={<InfoIcon />} />
                        <BottomNavigationAction label='Settings' icon={<SettingsApplicationsIcon />} />
                    </BottomNavigation>
                }
            >
                <SwipeableViews
                    index={this.state.bottomNavigation}
                    onChangeIndex={(index) => {
                        this.setState({
                            bottomNavigation: index
                        })
                    }}
                    >
                    <div>Profiles</div>
                    <div>Tutorial</div>
                    <div>Settings</div>
                </SwipeableViews>
                <Button color='primary' variant='contained'>
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