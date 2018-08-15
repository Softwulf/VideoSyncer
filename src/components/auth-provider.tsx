import * as React from 'react';
import { auth, db } from '../firebase';
import { HasDispatch, mapDispatch, HasRouter, mapRouter } from 'pages/_redux';
import { setUser } from 'pages/_redux/users/actions';
import { connect } from 'react-redux';
import { setSeriesList, setSeriesLoading } from 'pages/_redux/series/actions';

class AuthProviderBase extends React.Component<HasDispatch & HasRouter, {}> {
    dbRef?: firebase.database.Reference

    componentDidMount() {
        auth.onAuthStateChanged(user => {
            this.props.dispatch(setUser(user));
            if(user) {
                this.props.dispatch(setSeriesLoading(true));
                this.dbRef = db.ref(`vsync/series/${user.uid}`);
                this.dbRef.on('value', snap => {
                    const seriesArray: VSync.Series[] = [];
                    if(snap && snap.exists() && snap.hasChildren()) {
                        snap.forEach(childSnap => {
                            const childVal = childSnap.val();
                            seriesArray.push({
                                key: childSnap.key,
                                ...childVal
                            })
                        })
                    }
                    this.props.dispatch(setSeriesList(seriesArray));
                    this.props.dispatch(setSeriesLoading(false));
                }, err => {
                    console.error('Error subscribing to database', err);
                    this.props.dispatch(setSeriesList([]));
                    this.props.dispatch(setSeriesLoading(false));
                });
            } else {
                if(this.dbRef) this.dbRef.off();
                this.props.dispatch(setSeriesList([]));
            }
        });
    }

    render() {
        return this.props.children;
    }
}

export const AuthProvider = connect(mapRouter, mapDispatch)(AuthProviderBase);