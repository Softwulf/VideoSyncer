import React from 'react';
import ReactDOM from 'react-dom';

import { firebase, base } from '../../import/firebase-config';
import user from '../../import/user';

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
        if(this.state.profile) {
            return (
                <li key={this.state.profile.key}>
                    {this.state.profile.name}
                    <button onClick={() => { let profile = this.state.profile;profile.name = 'chaaanged';this.setState({profile: profile}); }}>R</button>
                </li>
            );
        } else {
            return (
                <li>loading...</li>
            );
        }
    }
}

class ProfileList extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const profiles = this.props.profiles;
        const listItems = profiles.map((profile) =>
            <Profile profile={profile} />
        );
        return (
            <ul>{listItems}</ul>
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
        var immediatelyAvailableReference = base.push('profiles/' + firebase.auth().currentUser.uid, {
            data: { name: 'new_profile' },
            then(err) {
                if (!err) {
                    console.log('added');
                } else {
                    console.log('failed...', err);
                }
            }
        });
        //available immediately, you don't have to wait for the callback to be called
        var generatedKey = immediatelyAvailableReference.key;
        console.log('key', generatedKey);
    }

    render() {
        var mainComp;
        if (!this.state.profiles) {
            mainComp = (
                <p>loading...</p>
            );
        }
        else {
            if(this.state.profiles.length > 0) {
                mainComp = (
                    <ProfileList profiles={this.state.profiles} />
                );
            }
            else {
                mainComp = (
                    <p>No profiles found</p>
                );
            }
        } 
        return (
            <div>
                <p>Username: {this.props.user.displayName}</p>
                {mainComp}
                <button onClick={() => { this.addProfile() }}>new</button>
                <button onClick={() => { user.logout() }}>Logout</button>
            </div>
        );

    }
}

export default Main;