import React from 'react';
import ReactDOM from 'react-dom';

import { firebase, base } from '../../import/firebase-config';
import user from '../../import/user';
import toastr from '../../import/toastr';

import { Accordion, Icon, Button, Segment, Message, Grid } from 'semantic-ui-react'

import weh from 'weh-content';

class Profile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        }
    }

    componentWillMount() {
        base.syncState('profiles/' + firebase.auth().currentUser.uid + '/' + this.props.profile.key, {
            context: this,
            state: 'profile'
        });
    }

    render() {
        if (this.state.profile) {
            return (
                <div key={ this.state.profile.key }>
                <Accordion.Title>
                    <Icon name='dropdown' />
                    { this.state.profile.name }
                </Accordion.Title>
                <Accordion.Content>
                    <p>
                    A dog is a type of domesticated animal. Known for its loyalty and faithfulness, it can be found as a
                    {' '}welcome guest in many households across the world.
                    </p>
                </Accordion.Content>
                </div>
            );
        } else {
            return null;
        }
    }
}

class ProfileList extends React.Component {
    constructor(props) {
        super(props);
    }

    removeProfile(key) {
        base.remove('profiles/' + firebase.auth().currentUser.uid+'/'+key, function(err){
            if(!err){
                toastr.success('Successfully deleted')
            } else {
                toastr.error('Failed to remove')
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
            <Accordion panels={panels} fluid styled  />
        );
    }
}

class Main extends React.Component {
    constructor(props) {
        super(props);
        var instance = this;

        this.state = {

        }
    }

    componentWillMount() {
        base.syncState('profiles/' + firebase.auth().currentUser.uid, {
            context: this,
            state: 'profiles',
            asArray: true
        });
    }

    addProfile() {
        var profileRef = base.push('profiles/' + firebase.auth().currentUser.uid, {
            data: {
                name: 'new_profile'
            },
            then(err) {
                if (!err) {
                    console.log('added');
                } else {
                    console.log('failed...', err);
                }
            }
        });
    }

    render() {
        var mainComp;
        if (this.state.profiles && this.state.profiles.length > 0) {
            mainComp = (
                <ProfileList profiles={ this.state.profiles } />
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
                <Grid>
                    <Grid.Row columns={2} fluid>
                        <Grid.Column>
                            <Button onClick={this.addProfile} primary icon='add'/>
                        </Grid.Column>
                        <Grid.Column>
                            <Button onClick={user.logout} negative icon='shutdown' />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>

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