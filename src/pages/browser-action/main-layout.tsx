import * as React from 'react';

import { Layout } from 'components/layout';
import { AppBar, Toolbar, Typography, IconButton, BottomNavigation, BottomNavigationAction, Button } from '@material-ui/core';

import {
    Menu as MenuIcon,
    SettingsApplications as SettingsApplicationsIcon,
    HomeRounded as HomeIcon,
    Info as InfoIcon

} from '@material-ui/icons'

import { withTheme } from '@material-ui/core/styles';

import { browser } from 'webextension-polyfill-ts';

export const TabContainer = withTheme()((props) => {
    return (
        <div style={{display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', overflow: 'auto', backgroundColor: props.theme.palette.background.default}}>
            {props.children}
        </div>
    );
});

type MainLayoutState = {
    bottomNavigation: number
}

export class MainLayout extends React.Component<{}, MainLayoutState> {
    constructor(props) {
        super(props);
        console.log(props);
    }

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
                            <Button color='secondary' variant='contained'>Log out</Button>
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
                    >
                        <BottomNavigationAction label='Profiles' icon={<HomeIcon />} />
                        <BottomNavigationAction label='Tutorial' icon={<InfoIcon />} />
                        <BottomNavigationAction label='Settings' icon={<SettingsApplicationsIcon />} />
                    </BottomNavigation>
                }
            >

                    {
                        this.state.bottomNavigation === 0 && <TabContainer>Profiles</TabContainer>
                    }

                    {
                        this.state.bottomNavigation === 1 && <TabContainer>Tutorial</TabContainer>
                    }

                    {
                        this.state.bottomNavigation === 2 && <TabContainer>Settings</TabContainer>
                    }
            </Layout>
        )
    }
}