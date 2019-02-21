import { vyrebase } from 'vyrebase';
import { VSyncStorage } from '../storage';
import * as Sentry from '@sentry/browser';

export class AuthListener {
    vStorage = new VSyncStorage(true);

    constructor() {
        vyrebase.auth().onAuthStateChanged(async user => {
            if(user) {
                console.log(`User ${user.displayName} [${user.uid}] signed in`);
                const idToken = await user.getIdTokenResult();
                let role: VSync.User['role'] = idToken.claims.role;

                if(role !== 'user' && role !== 'premium' && role !== 'admin') role = 'user';

                let username = user.displayName ? user.displayName : 'Anonymous';

                this.vStorage.set({
                    user: {
                        displayName: username,
                        photoURL: user.photoURL,
                        uid: user.uid,
                        role
                    }
                });
                Sentry.configureScope(scope => {
                    scope.setUser({
                        id: user.uid
                    });
                });
                Sentry.addBreadcrumb({
                    category: 'auth',
                    level: Sentry.Severity.Info,
                    message: `Authenticated user ${user.uid}`
                });
            } else {
                console.log('User signed out');
                this.vStorage.set({
                    user: false
                });
                Sentry.configureScope(scope => {
                    scope.setUser(undefined);
                });
                Sentry.addBreadcrumb({
                    category: 'auth',
                    level: Sentry.Severity.Info,
                    message: `User signed out`
                });
            }
        });
    }
}