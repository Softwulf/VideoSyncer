import * as React from 'react';

import { Layout } from 'components/layout';
import { AppBar, Toolbar, Typography, IconButton, BottomNavigation, BottomNavigationAction, Button } from '@material-ui/core';

import {
    Menu as MenuIcon,
    SettingsApplications as SettingsApplicationsIcon,
    HomeRounded as HomeIcon,
    Info as InfoIcon

} from '@material-ui/icons'

import { withTheme, Theme } from '@material-ui/core/styles';

import { ProfileTab } from './profiles/profile-tab';
import { TutorialTab } from './tutorials/tutorial-tab';
import { SettingsTab } from './settings/settings-tab';

import { browser } from 'webextension-polyfill-ts';

export const TabContainer = withTheme()((props) => {
    return (
        <div style={{display: 'flex', flexGrow: 1, overflow: 'auto', backgroundColor: props.theme.palette.background.default}}>
            {props.children}
        </div>
    );
});

type MainLayoutProps = {
    setTheme: (theme: Theme['palette']['type']) => any
}

type MainLayoutState = {
    bottomNavigation: number
}

export class MainLayout extends React.Component<MainLayoutProps, MainLayoutState> {
    constructor(props) {
        super(props);
        console.log(props);
    }

    state = {
        bottomNavigation: 0
    }

    render() {
        const style: React.CSSProperties = {
            display: 'flex'
        }
        return (
            <Layout
                header={
                    <AppBar position='sticky' color='primary' style={style}>
                        <Toolbar variant='dense' color='inherit' style={style}>
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
                        this.state.bottomNavigation === 0 && <TabContainer><ProfileTab /></TabContainer>
                    }

                    {
                        this.state.bottomNavigation === 1 && <TabContainer><TutorialTab /></TabContainer>
                    }

                    {
                        this.state.bottomNavigation === 2 && <TabContainer><SettingsTab setTheme={this.props.setTheme} /></TabContainer>
                    }
            </Layout>
        )
    }
}