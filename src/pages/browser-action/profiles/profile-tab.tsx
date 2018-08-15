import * as React from 'react';
import { List, ListSubheader, ListItem, ListItemText, CircularProgress, Typography, Button } from '@material-ui/core';
import { AddCircle } from '@material-ui/icons';
import { firebase } from '../../../firebase';
import { ProfileList } from './profile-list';
import { UserState } from '../../_redux/users/types';
import { connect } from 'react-redux';
import { ApplicationState } from '../../_redux';
import { ProfileState } from '../../_redux/profiles/types';
import { Link, Switch, Route } from 'react-router-dom';
import { ProfileCreate } from './profile-create';
import { RouterState } from 'connected-react-router';

export type ProfileTabProps = {
    user: UserState
    profiles: ProfileState
    router: RouterState
}

class ProfileTabBase extends React.Component<ProfileTabProps, {}> {
    profileRef?: firebase.database.Reference

    newProfileLink = (props) => <Link to='new' {...props as any} />

    render() {
        if(this.props.profiles.loading) {
            return <div style={{display: 'flex', flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}><CircularProgress variant='indeterminate' color='secondary' /></div>
        }

        return (
            <div style={{display: 'flex', flexGrow: 1}}>
                <Switch>
                    <Route path='/new' component={ProfileCreate} />
                    <Route render={() => {
                        return (
                            <div style={{display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'space-around', alignItems: 'stretch'}}>
                                <ProfileList profiles={this.props.profiles.profiles} />
                                <Button variant='fab' color='primary' style={{alignSelf: 'flex-end', justifySelf: 'flex-end', margin: '10px', flexBasis: 'content'}} component={this.newProfileLink}>
                                    <AddCircle />
                                </Button>
                            </div>
                        )
                    }} />
                </Switch>
            </div>
        )
    }
}

export const ProfileTab = connect<ProfileTabProps>((state: ApplicationState): ProfileTabProps => {
    return {
        user: state.user,
        profiles: state.profiles,
        router: state.router
    }
}, null)(ProfileTabBase);