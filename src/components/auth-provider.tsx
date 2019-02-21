import * as React from 'react';
import { HasDispatch, mapDispatch, HasRouter, mapRouter } from 'pages/_redux';
import { setUser } from 'pages/_redux/users/actions';
import { connect } from 'react-redux';
import { setSeriesList, setSeriesLoading } from 'pages/_redux/series/actions';
import { VSyncStorage } from 'background/storage';
import * as Sentry from '@sentry/browser';

class AuthProviderBase extends React.Component<HasDispatch & HasRouter, {}> {
    vStorage = new VSyncStorage()

    async componentDidMount() {
        // subscribe to user changes
        this.vStorage.subscribe<'user'>('user', changes => {
            const newUser = changes.newValue;
            if(newUser) {
                this.props.dispatch(setUser(newUser));
                Sentry.configureScope(scope => {
                    scope.setUser({
                        id: newUser.uid
                    });
                });
                Sentry.addBreadcrumb({
                    category: 'auth',
                    level: Sentry.Severity.Info,
                    message: `Authenticated user ${newUser.uid}`
                });
            } else {
                this.props.dispatch(setUser());
                Sentry.configureScope(scope => {
                    scope.setUser(undefined);
                });
                Sentry.addBreadcrumb({
                    category: 'auth',
                    level: Sentry.Severity.Info,
                    message: `User signed out`
                });
            }
        })

        // subscribe to series changes
        this.vStorage.subscribe<'series_loading'>('series_loading', changes => {
            this.props.dispatch(setSeriesLoading(changes.newValue));
        });

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