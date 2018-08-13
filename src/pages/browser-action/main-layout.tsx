import * as React from 'react';

import { Layout } from 'components/layout';
import { AppBar, Toolbar, Typography, BottomNavigation, BottomNavigationAction, Button, CircularProgress, Avatar } from '@material-ui/core';
import { red, deepPurple } from '@material-ui/core/colors';

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
import { AuthCore } from 'auth/wulf-auth';
import { SignIn } from './signin/sign-in';

export const TabContainer = withTheme()((props) => {
    return (
        <Typography variant='body1' component='div' className='has-scrollbars' style={{display: 'flex', flexGrow: 1, overflow: 'auto', backgroundColor: props.theme.palette.background.default}}>
            {props.children}
        </Typography>
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
        if(this.props.loading) {
            return <TabContainer><div style={{display: 'flex', flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}><CircularProgress variant='indeterminate' color='primary' /></div></TabContainer>
        }


        let currentTab: React.ReactNode;
        switch(this.state.bottomNavigation) {
            case 1:
                currentTab = <TabContainer><TutorialTab /></TabContainer>
                break;
            case 2:
                currentTab = <TabContainer><SettingsTab setTheme={this.props.setTheme} theme={this.props.theme} /></TabContainer>
                break;
            default:
                currentTab = <TabContainer>{this.props.user ? <ProfileTab user={this.props.user} /> : <SignIn />}</TabContainer>
        }

        return (
            <Layout
                header={
                    <AppBar position='sticky' color='primary'>
                        <Toolbar variant='dense' color='inherit'>
                            <Typography variant='title' color='inherit' style={{flexGrow: 1}}>
                                VSync
                            </Typography>
                            {
                                this.props.user && 
                                    <Typography variant='subheading' color='inherit' style={{paddingLeft: '5px', paddingRight: '5px'}}>
                                        {this.props.user.displayName.charAt(0).toUpperCase() + this.props.user.displayName.substring(1)}
                                    </Typography>
                            }
                            {
                                this.props.user && 
                                    <Avatar alt={this.props.user.displayName} src={this.props.user.photoURL} style={{width: 30, height: 30, marginRight: '10px'}}/>
                            }
                            {
                                this.props.user ?
                                    <Button style={{backgroundColor: red[900], color: '#FFF'}} variant='contained' onClick={AuthCore.logout}>Sign out</Button>
                                :
                                    <Button style={{backgroundColor: deepPurple[500], color: '#FFF'}} variant='contained' onClick={AuthCore.login}>Sign in</Button>
                            }
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