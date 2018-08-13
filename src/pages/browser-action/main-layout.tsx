import * as React from 'react';

import { Layout } from 'components/layout';
import { AppBar, Toolbar, Typography, BottomNavigation, BottomNavigationAction, Button, CircularProgress } from '@material-ui/core';

import {
    SettingsApplications as SettingsApplicationsIcon,
    HomeRounded as HomeIcon,
    Info as InfoIcon

} from '@material-ui/icons'

import { withTheme, Theme } from '@material-ui/core/styles';

import { ProfileTab } from './profiles/profile-tab';
import { TutorialTab } from './tutorials/tutorial-tab';
import { SettingsTab } from './settings/settings-tab';
import { ThemeConsumerProps } from 'components/theme-provider';
import { AuthConsumerProps } from 'components/auth-provider';

export const TabContainer = withTheme()((props) => {
    return (
        <div className='has-scrollbars' style={{display: 'flex', flexGrow: 1, overflow: 'auto', backgroundColor: props.theme.palette.background.default}}>
            {props.children}
        </div>
    );
});

type MainLayoutProps = ThemeConsumerProps & AuthConsumerProps

type MainLayoutState = {
    bottomNavigation: number
}

export class MainLayout extends React.Component<MainLayoutProps, MainLayoutState> {
    constructor(props) {
        super(props);
    }

    state = {
        bottomNavigation: 0
    }

    render() {
        let currentTab: React.ReactNode;

        if(this.props.loading) {
            currentTab = <TabContainer><div style={{display: 'flex', flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}><CircularProgress variant='indeterminate' color='primary' /></div></TabContainer>
        } else {
            switch(this.state.bottomNavigation) {
                case 1:
                    currentTab = <TabContainer><TutorialTab /></TabContainer>
                    break;
                case 2:
                    currentTab = <TabContainer><SettingsTab setTheme={this.props.setTheme} /></TabContainer>
                    break;
                default:
                    currentTab = <TabContainer><ProfileTab /></TabContainer>
            }
        }

        return (
            <Layout
                header={
                    <AppBar position='sticky' color='primary'>
                        <Toolbar variant='dense' color='inherit'>
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
                    >
                        <BottomNavigationAction label='Profiles' icon={<HomeIcon />}  />
                        <BottomNavigationAction label='Tutorial' icon={<InfoIcon />} />
                        <BottomNavigationAction label='Settings' icon={<SettingsApplicationsIcon />} />
                    </BottomNavigation>
                }
            >
                {currentTab}
            </Layout>
        )
    }
}