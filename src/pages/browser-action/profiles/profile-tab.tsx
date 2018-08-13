import * as React from 'react';
import { List, ListSubheader, ListItem, ListItemText, CircularProgress, Typography, Button } from '@material-ui/core';
import { AddCircle } from '@material-ui/icons';
import { firebase } from '../../../firebase';
import { ProfileList } from './profile-list';

export type ProfileTabProps = {
    user: firebase.User
}

export type ProfileTabState = {
    loading: boolean
    profiles: vsync.Profile[]
}

export class ProfileTab extends React.Component<ProfileTabProps, ProfileTabState> {
    profileRef?: firebase.database.Reference

    state = {
        loading: true,
        profiles: []
    }

    componentDidMount() {
        this.profileRef = firebase.database().ref(`vsync/profiles/${this.props.user.uid}`);
        this.profileRef.on('value', snap => {
            const profileArray: vsync.Profile[] = [];
            if(snap && snap.exists() && snap.hasChildren()) {
                snap.forEach(childSnap => {
                    const childVal = childSnap.val();
                    profileArray.push({
                        key: childSnap.key,
                        ...childVal
                    })
                })
            }

            this.setState({
                loading: false,
                profiles: profileArray
            });
        });
    }

    componentWillUnmount() {
        if(this.profileRef) this.profileRef.off();
    }

    render() {
        if(this.state.loading) {
            return <div style={{display: 'flex', flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}><CircularProgress variant='indeterminate' color='secondary' /></div>
        }

        if(this.state.profiles.length === 0) {
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

        const profileListElement = ProfileList({profiles: this.state.profiles});

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