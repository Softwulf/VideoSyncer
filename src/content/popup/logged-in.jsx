import React from 'react';
import ReactDOM from 'react-dom';

import { firebase, base } from '../../import/firebase-config';
import user from '../../import/user';

import { Accordion, Icon, Button, Segment, Message, Grid } from 'semantic-ui-react'

import weh from 'weh-content';

class ProfileList extends React.Component {
    constructor(props) {
        super(props);

        this.removeProfile = this.removeProfile.bind(this);
    }

    removeProfile(key) {
        const instance = this;
        base.remove('profiles/' + firebase.auth().currentUser.uid+'/'+key, function(err){
            if(!err){
                instance.props.message('Profile removed', 'success')
            } else {
                console.error('Failed to remove profile', err);
                instance.props.message('Failed to remove profile', 'error')
            }
        });
    }

    render() {
        const profiles = this.props.profiles;
        const panels = profiles.map((profile) => ({
            title: {
                content: profile.name,
                key: profile.key
            },
            content: {
                content: (
                    <Button negative onClick={() => { this.removeProfile(profile.key) }} icon='delete' />
                 )
            }
        }));
        return (
            <Accordion className='profileList' panels={panels} fluid styled  />
        );
    }
}

class Main extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

        }

        this.addProfile = this.addProfile.bind(this);
    }

    componentWillMount() {
        base.syncState('profiles/' + firebase.auth().currentUser.uid, {
            context: this,
            state: 'profiles',
            asArray: true
        });
    }

    addProfile() {
        const instance = this;

        var profileRef = base.push('profiles/' + firebase.auth().currentUser.uid, {
            data: {
                name: 'new_profile'
            },
            then(err) {
                if (!err) {
                    instance.props.message('Profile created', 'success');
                } else {
                    console.log('Failed to create profile', err);
                    instance.props.message('Failed to create profile', 'error');
                }
            }
        });
    }

    render() {
        var mainComp;
        if (this.state.profiles && this.state.profiles.length > 0) {
            mainComp = (
                <ProfileList profiles={ this.state.profiles } message={this.props.message} />
            );
        } else if( this.state.profiles && this.state.profiles.length <= 0) {
            mainComp = (
                <Message warning>
                    <Message.Header>{weh._('no_profiles')}</Message.Header>
                    <p>{weh._('no_profiles_detail')}</p>
                </Message>
            );
        }
        return (
            <div>
                <div>
                    <Button onClick={this.addProfile} primary icon='add'/>
                    <Button onClick={user.logout} negative icon='shutdown' />
                </div>

                <Message icon hidden={this.state.profiles !== undefined}>
                    <Icon name='circle notched' loading />
                    <Message.Content>
                        <Message.Header>{weh._('just_one_sec')}</Message.Header>
                        {weh._('loading_profiles')}
                    </Message.Content>
                </Message>
                {mainComp}
            </div>
            );

    }
}

export default Main;