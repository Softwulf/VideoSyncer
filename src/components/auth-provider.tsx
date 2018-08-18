import * as React from 'react';
import { HasDispatch, mapDispatch, HasRouter, mapRouter } from 'pages/_redux';
import { setUser } from 'pages/_redux/users/actions';
import { connect } from 'react-redux';
import { setSeriesList } from 'pages/_redux/series/actions';
import { VSyncStorage } from 'background/storage';

class AuthProviderBase extends React.Component<HasDispatch & HasRouter, {}> {
    vStorage = new VSyncStorage()

    async componentDidMount() {
        // subscribe to user changes
        this.vStorage.subscribe<'user'>('user', changes => {
            const newUser = changes.newValue;
            if(newUser) {
                this.props.dispatch(setUser(newUser));
            } else {
                this.props.dispatch(setUser());
            }
        })

        // subscribe to series changes
        this.vStorage.subscribe<'series_list'>('series_list', changes => {
            this.props.dispatch(setSeriesList(changes.newValue));
        });
    }

    render() {
        return this.props.children;
    }
}

export const AuthProvider = connect(mapRouter, mapDispatch)(AuthProviderBase);