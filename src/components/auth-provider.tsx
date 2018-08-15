import * as React from 'react';
import { auth, db } from '../firebase';
import { HasDispatch, mapDispatch, HasRouter, mapRouter } from 'pages/_redux';
import { setUser } from 'pages/_redux/users/actions';
import { connect } from 'react-redux';
import { setProfiles, setProfilesLoading } from 'pages/_redux/profiles/actions';

class AuthProviderBase extends React.Component<HasDispatch & HasRouter, {}> {
    dbRef?: firebase.database.Reference

    componentDidMount() {
        auth.onAuthStateChanged(user => {
            this.props.dispatch(setUser(user));
            if(user) {
                this.props.dispatch(setProfilesLoading(true));
                this.dbRef = db.ref(`vsync/profiles/${user.uid}`);
                this.dbRef.on('value', snap => {
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
                    this.props.dispatch(setProfiles(profileArray));
                    this.props.dispatch(setProfilesLoading(false));
                });
            } else {
                if(this.dbRef) this.dbRef.off();
                this.props.dispatch(setProfiles([]));
            }
        });
    }

    render() {
        return this.props.children;
    }
}

export const AuthProvider = connect(mapRouter, mapDispatch)(AuthProviderBase);