import * as React from 'react';
import * as ReactDOM from 'react-dom';

import browser from 'webextension-polyfill';

import { firebase, base } from '../../import/config/firebase-config';
import user from '../../import/user';

import { Accordion, Icon, Button, Segment, Message, Grid, Popup } from 'semantic-ui-react'

import swalc from '../../import/config/swal-config';
import { SyncServer } from '../../import/sync';

const Server = new SyncServer();

function toHHMMSS(time) {
    var sec_num = parseInt(time, 10); // don't forget the second param
    var hours: number | string = Math.floor(sec_num / 3600);
    var minutes: number | string = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds: number | string = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    return hours + ':' + minutes + ':' + seconds;
}

type ProfileListProps = {
    profiles: Array<vsync.Profile>
    message?: any,
    editProfile: (profile: vsync.Profile) => any,
    removeProfile: (profile: vsync.Profile) => any
}

class ProfileList extends React.Component<ProfileListProps, any> {
    constructor(props: ProfileListProps) {
        super(props);
    }

    setupIncomplete(profile: vsync.Profile): boolean {
        return profile.videoHost == null;
    }

    nextIncomplete(profile: vsync.Profile): boolean {
        return profile.nextQuery == null;
    }

    getUrl(profile: vsync.Profile): string {
        if (profile.currentURL) {
            return profile.currentURL;
        } else {
            return 'N/A';
        }
    }

    openProfile(profile: vsync.Profile): void {
        if (profile.currentURL) {
            window.open(profile.currentURL);
        }
        else {
            window.open(profile.urlPattern);
        }
    }

    setupProfile(profile: vsync.Profile): void {
        Server.clickInit(profile, 'SETUP');
    }

    setupNext(profile: vsync.Profile): void {
        Server.clickInit(profile, 'NEXT');
    }

    render() {
        const profiles = this.props.profiles;
        const panels = profiles.map((profile) => ({
            title: {
                content: (
                    <span>
                        {this.setupIncomplete(profile) &&
                            <Popup wide hideOnScroll trigger={<Icon name='warning sign' color='yellow' />} header={browser.i18n.getMessage('player_incomplete')} content={browser.i18n.getMessage('player_incomplete_detail')} />
                        }
                        <span>{profile.name} - {toHHMMSS(profile.currentTime)}</span>
                    </span>
                ),
                key: profile.key
            },
            content: {
                content: (
                    <Grid columns={2} stretched>
                        <Grid.Column>
                            <Button basic content={browser.i18n.getMessage('launch')} labelPosition='left' icon='play' onClick={() => { this.openProfile(profile) }} />
                        </Grid.Column>
                        <Grid.Column>
                            <Button basic content={browser.i18n.getMessage('edit')} labelPosition='left' icon='edit' onClick={() => { this.props.editProfile(profile) }} />
                        </Grid.Column>
                        <Grid.Column>
                            <Button onClick={() => { this.setupProfile(profile) }} basic={!this.setupIncomplete(profile)} content={browser.i18n.getMessage('setup')} labelPosition='left' icon='external' color={(this.setupIncomplete(profile) && 'yellow') || null} />
                        </Grid.Column>
                        <Grid.Column>
                            <Button onClick={() => { this.setupNext(profile) }} basic={!this.nextIncomplete(profile)} content={browser.i18n.getMessage('next')} labelPosition='left' icon='external' color={(this.nextIncomplete(profile) && 'yellow') || null} />
                        </Grid.Column>
                        <Grid.Column>
                            <Button onClick={() => { swalc.showProfileUrl(this.getUrl(profile)) }} content={browser.i18n.getMessage('show_url')} basic labelPosition='left' icon='linkify' />
                        </Grid.Column>
                        <Grid.Column>
                            <Button basic negative onClick={() => { this.props.removeProfile(profile); }} content={browser.i18n.getMessage('delete')} labelPosition='left' icon='delete' />
                        </Grid.Column>
                    </Grid>
                )
            }
        }));
        return (
            <Accordion className='profileList' panels={panels} fluid styled />
        );
    }
}

type LoggedInProps = {
    user: firebase.User,
    message?: any
}
class LoggedIn extends React.Component<LoggedInProps, any> {
    constructor(props) {
        super(props);

        this.state = {

        }

        this.addProfile = this.addProfile.bind(this);
        this.editProfile = this.editProfile.bind(this);
        this.removeProfile = this.removeProfile.bind(this);
    }

    componentWillMount() {
        base.syncState('vsync/profiles/' + firebase.auth().currentUser.uid, {
            context: this,
            state: 'profiles',
            asArray: true
        });
    }

    addProfile() {
        const instance = this;

        swalc.editProfile(null).then((profile) => {
            var profileRef = base.push('vsync/profiles/' + firebase.auth().currentUser.uid, {
                data: {
                    name: profile.name,
                    urlPattern: profile.urlPattern,
                    startTime: parseInt(profile.startTime),
                    endTime: parseInt(profile.endTime),
                    currentTime: 0,
                },
                then(err) {
                    if (!err) {
                        instance.props.message(browser.i18n.getMessage('profile_created', profile.name), 'success');
                    } else {
                        console.log('Failed to create profile', err);
                        instance.props.message(browser.i18n.getMessage('profile_created_failed'), 'error');
                    }
                }
            });
        }).catch((err) => {
            instance.props.message(browser.i18n.getMessage('profile_created_cancelled'), 'info');
        });
    }

    editProfile(profileIn) {
        const instance = this;

        swalc.editProfile(profileIn).then((profile) => {
            var profileRef = base.update('vsync/profiles/' + firebase.auth().currentUser.uid + '/' + profile.key, {
                data: {
                    name: profile.name,
                    urlPattern: profile.urlPattern,
                    startTime: parseInt(profile.startTime),
                    endTime: parseInt(profile.endTime),
                },
                then(err) {
                    if (!err) {
                        instance.props.message(browser.i18n.getMessage('profile_edit', profile.name), 'success');
                    } else {
                        console.log('Failed to edit profile', err);
                        instance.props.message(browser.i18n.getMessage('profile_edit_failed'), 'error');
                    }
                }
            });
        }).catch((err) => {
            instance.props.message(browser.i18n.getMessage('profile_edit_cancelled'), 'info');
        });
    }

    removeProfile(profile) {
        const instance = this;

        swalc.askForProfileRemoval(profile).then(() => {
            base.remove('vsync/profiles/' + firebase.auth().currentUser.uid + '/' + profile.key, function (err) {
                if (!err) {
                    instance.props.message(browser.i18n.getMessage('profile_removed'), 'success');
                } else {
                    console.error('Failed to remove profile', err);
                    instance.props.message(browser.i18n.getMessage('profile_removed_failed'), 'error');
                }
            });
        }).catch(() => {
            instance.props.message(browser.i18n.getMessage('profile_removed_cancelled'), 'info');
        });
    }

    render() {
        var mainComp;
        if (this.state.profiles && this.state.profiles.length > 0) {
            mainComp = (
                <ProfileList profiles={this.state.profiles} message={this.props.message} editProfile={this.editProfile} removeProfile={this.removeProfile} />
            );
        } else if (this.state.profiles && this.state.profiles.length <= 0) {
            mainComp = (
                <Message warning>
                    <Message.Header>
                        {browser.i18n.getMessage('no_profiles')}
                    </Message.Header>
                    <p>
                        {browser.i18n.getMessage('no_profiles_detail')}
                    </p>
                </Message>
            );
        }
        return (
            <div>
                <div>
                    <Grid columns={2} stretched className='buttonBar'>
                        <Grid.Column>
                            <Button icon='plus' labelPosition='left' content={browser.i18n.getMessage('create')} basic onClick={this.addProfile} />
                        </Grid.Column>
                        <Grid.Column>
                            <Popup hideOnScroll trigger={<Button basic onClick={user.logout} negative icon='shutdown' />} header={browser.i18n.getMessage('logout')} content={browser.i18n.getMessage('logout_detail')} />
                        </Grid.Column>
                    </Grid>

                </div>
                <Message icon hidden={this.state.profiles !== undefined}>
                    <Icon name='circle notched' loading />
                    <Message.Content>
                        <Message.Header>
                            {browser.i18n.getMessage('just_one_sec')}
                        </Message.Header>
                        {browser.i18n.getMessage('loading_profiles')}
                    </Message.Content>
                </Message>
                {mainComp}
            </div>
        );

    }
}

export default LoggedIn;