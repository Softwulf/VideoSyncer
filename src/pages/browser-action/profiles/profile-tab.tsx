import * as React from 'react';
import { List, ListSubheader, ListItem, ListItemText, CircularProgress, Typography, Button } from '@material-ui/core';
import { AddCircle } from '@material-ui/icons';
import { firebase } from '../../../firebase';
import { ProfileList } from './profile-list';
import { UserState } from '../../_redux/users/types';
import { connect } from 'react-redux';
import { ApplicationState } from '../../_redux';
import { ProfileState } from '../../_redux/profiles/types';

export type ProfileTabProps = {
    user: UserState
    profiles: ProfileState
}

class ProfileTabBase extends React.Component<ProfileTabProps, {}> {
    profileRef?: firebase.database.Reference

    render() {
        if(this.props.profiles.loading) {
            return <div style={{display: 'flex', flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}><CircularProgress variant='indeterminate' color='secondary' /></div>
        }

        if(this.props.profiles.profiles.length === 0) {
            return (
            <div style={{display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
                <Typography variant='headline'>Get started by creating a profile</Typography>
                <Button variant='extendedFab' color='primary' style={{marginTop: '20px'}}>
                    <AddCircle style={{marginRight: '10px'}} />
                    Create your first profile
                </Button>
            </div>
            )
        }

        const profileListElement = ProfileList({profiles: this.props.profiles.profiles});

        return (
            <List subheader={<ListSubheader disableSticky>Profiles</ListSubheader>} style={{flexGrow: 1}}>
                {profileListElement}
                {profileListElement}
                {profileListElement}
                {profileListElement}
                {profileListElement}
                {profileListElement}
                {profileListElement}
                {profileListElement}
                {profileListElement}
                {profileListElement}
                {profileListElement}
                {profileListElement}
                {profileListElement}
                {profileListElement}
                {profileListElement}
                {profileListElement}
                {profileListElement}
                {profileListElement}
                {profileListElement}
                {profileListElement}
                {profileListElement}
                {profileListElement}
                {profileListElement}
                {profileListElement}
                {profileListElement}
                {profileListElement}
                {profileListElement}
            </List>
        )
    }
}

export const ProfileTab = connect<ProfileTabProps>((state: ApplicationState): ProfileTabProps => {
    return {
        user: state.user,
        profiles: state.profiles
    }
}, null)(ProfileTabBase);