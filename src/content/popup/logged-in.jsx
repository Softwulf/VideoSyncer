import React from 'react';
import ReactDOM from 'react-dom';

import { firebase, base } from '../../import/firebase-config';
import user from '../../import/user';

import { Accordion, Icon, Button, Segment, Message, Grid, Popup } from 'semantic-ui-react'

import swalc from '../../import/swal-config';

import weh from 'weh-content';

class ProfileList extends React.Component {
    constructor(props) {
        super(props);
    }

    setupIncomplete(profile) {
        return profile.playerQuery == null || profile.playerHost == null;
    }

    render() {
        const profiles = this.props.profiles;
        const panels = profiles.map((profile) => ({
            title: {
                content: (
                    <span>
                        { this.setupIncomplete(profile) && 
                            <Popup hideOnScroll flowing trigger={ <Icon name='warning' color='yellow' /> } header={ weh._('player_incomplete') } content={ weh._('player_incomplete_detail') } />
                        }
                        <span>{profile.name}</span>
                    </span>
                ),
                key: profile.key
            },
            content: {
                content: (
                    <Grid columns={2} stretched>
                        <Grid.Column>
                            <Button basic content={weh._('edit')} labelPosition='left' icon='edit' onClick={() => {this.props.editProfile(profile)}} />
                        </Grid.Column>
                        <Grid.Column>
                            <Button basic={!this.setupIncomplete(profile)} content={weh._('setup')} labelPosition='left' icon='external' color={(this.setupIncomplete(profile) && 'yellow') || 'black'} />
                        </Grid.Column>
                        <Grid.Column>
                            <Button basic negative onClick={() => {this.props.removeProfile(profile);}} content={weh._('delete')} labelPosition='left' icon='delete' />
                        </Grid.Column>
                    </Grid>
                )
            }
        }));
        return (
            <Accordion className='profileList' panels={ panels } fluid styled />
            );
    }
}

class Main extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

        }

        this.addProfile = this.addProfile.bind(this);
        this.editProfile = this.editProfile.bind(this);
        this.removeProfile = this.removeProfile.bind(this);
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

        swalc.editProfile(null).then((profile) => {
            var profileRef = base.push('profiles/' + firebase.auth().currentUser.uid, {
                data: {
                    name: profile.name,
                    urlPattern: profile.urlPattern,
                    endTime: parseInt(profile.endTime),
                    currentTime: 0
                },
                then(err) {
                    if (!err) {
                        instance.props.message(weh._('profile_created', profile.name), 'success');
                    } else {
                        console.log('Failed to create profile', err);
                        instance.props.message(weh._('profile_created_failed'), 'error');
                    }
                }
            });
        }).catch((err) => {
            instance.props.message(weh._('profile_created_cancelled'), 'info');
        });
    }

    editProfile(profile) {
        const instance = this;

        swalc.editProfile(profile).then((profile) => {
            var profileRef = base.update('profiles/' + firebase.auth().currentUser.uid + '/' + profile.key, {
                data: {
                    name: profile.name,
                    urlPattern: profile.urlPattern,
                    endTime: parseInt(profile.endTime)
                },
                then(err) {
                    if (!err) {
                        instance.props.message(weh._('profile_edit', profile.name), 'success');
                    } else {
                        console.log('Failed to edit profile', err);
                        instance.props.message(weh._('profile_edit_failed'), 'error');
                    }
                }
            });
        }).catch((err) => {
            instance.props.message(weh._('profile_edit_cancelled'), 'info');
        });
    }

    removeProfile(profile) {
        const instance = this;

        swalc.askForProfileRemoval(profile).then(() => {
            base.remove('profiles/' + firebase.auth().currentUser.uid + '/' + profile.key, function(err) {
                if (!err) {
                    instance.props.message(weh._('profile_removed'), 'success');
                } else {
                    console.error('Failed to remove profile', err);
                    instance.props.message(weh._('profile_removed_failed'), 'error');
                }
            });
        }).catch(() => {
            instance.props.message(weh._('profile_removed_cancelled'), 'info');
        });
    }

    render() {
        var mainComp;
        if (this.state.profiles && this.state.profiles.length > 0) {
            mainComp = (
                <ProfileList profiles={ this.state.profiles } message={ this.props.message } editProfile={ this.editProfile } removeProfile={ this.removeProfile } />
            );
        } else if (this.state.profiles && this.state.profiles.length <= 0) {
            mainComp = (
                <Message warning>
                  <Message.Header>
                    { weh._('no_profiles') }
                  </Message.Header>
                  <p>
                    { weh._('no_profiles_detail') }
                  </p>
                </Message>
            );
        }
        return (
            <div>
              <div>
                <Grid columns={2} stretched className='buttonBar'>
                    <Grid.Column>
                        <Button icon='plus' labelPosition='left' content={weh._('create')} basic onClick={ this.addProfile } />
                    </Grid.Column>
                    <Grid.Column>
                        <Popup hideOnScroll trigger={ <Button basic onClick={ user.logout } negative icon='shutdown' /> } header={ weh._('logout') } content={ weh._('logout_detail') } />
                    </Grid.Column>
                </Grid>
                
              </div>
              <Message icon hidden={ this.state.profiles !== undefined }>
                <Icon name='circle notched' loading />
                <Message.Content>
                  <Message.Header>
                    { weh._('just_one_sec') }
                  </Message.Header>
                  { weh._('loading_profiles') }
                </Message.Content>
              </Message>
              { mainComp }
            </div>
            );

    }
}

export default Main;