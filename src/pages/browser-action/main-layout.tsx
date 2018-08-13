import * as React from 'react';

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
import { AuthCore } from 'auth/wulf-auth';
import { SignIn } from './signin/sign-in';
import { UserState } from '../_redux/users/types';
import { connect } from 'react-redux';
import { ApplicationState } from '../_redux';

export type MainLayoutProps = {
    user: UserState
}

export type MainLayoutState = {
    bottomNavigation: number
}

class MainLayoutBase extends React.Component<MainLayoutProps, MainLayoutState> {
    constructor(props) {
        super(props);
    }

    state = {
        bottomNavigation: 0
    }

    render() {
        if(this.props.user.loading) {
            return <TabContainer><div style={{display: 'flex', flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}><CircularProgress variant='indeterminate' color='primary' /></div></TabContainer>
        }


        let currentTab: React.ReactNode;
        switch(this.state.bottomNavigation) {
            case 1:
                currentTab = <TabContainer><TutorialTab /></TabContainer>
                break;
            case 2:
                currentTab = <TabContainer><SettingsTab /></TabContainer>
                break;
            default:
                currentTab = <TabContainer>{this.props.user.user ? <ProfileTab /> : <SignIn />}</TabContainer>
        }

        return (
            <div style={{display: 'flex', flex: 1, flexDirection: 'column', flexWrap: 'nowrap', alignItems: 'stretch', justifyContent: 'center'}}>

                {/* Header */}
                <div style={{flexBasis: 'content'}}>
                    <AppBar position='sticky' color='primary'>
                        <Toolbar variant='dense' color='inherit'>
                            <Typography variant='title' color='inherit' style={{flexGrow: 1}}>
                                VSync
                            </Typography>
                            {
                                this.props.user.user && 
                                    <Typography variant='subheading' color='inherit' style={{paddingLeft: '5px', paddingRight: '5px'}}>
                                        {this.props.user.user.displayName.charAt(0).toUpperCase() + this.props.user.user.displayName.substring(1)}
                                    </Typography>
                            }
                            {
                                this.props.user.user && 
                                    <Avatar alt={this.props.user.user.displayName} src={this.props.user.user.photoURL} style={{width: 30, height: 30, marginRight: '10px'}}/>
                            }
                            {
                                this.props.user.user ?
                                    <Button style={{backgroundColor: red[900], color: '#FFF'}} variant='contained' onClick={AuthCore.logout}>Sign out</Button>
                                :
                                    <Button style={{backgroundColor: deepPurple[500], color: '#FFF'}} variant='contained' onClick={AuthCore.login}>Sign in</Button>
                            }
                        </Toolbar>
                    </AppBar>
                </div>

                {/* Content */}
                {currentTab}

                {/* Footer */}
                <div style={{flexBasis: 'content'}}>
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
                </div>

            </div>
        )
    }
}

export const MainLayout = connect((state: ApplicationState): MainLayoutProps => {
    return {
        user: state.user
    }
}, null)(MainLayoutBase)

export const TabContainer = withTheme()((props) => {
    return (
        <Typography variant='body1' component='div' className='has-scrollbars' style={{display: 'flex', flexGrow: 1, overflow: 'auto', backgroundColor: props.theme.palette.background.default}}>
            {props.children}
        </Typography>
    );
});