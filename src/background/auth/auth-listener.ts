import { vyrebase } from 'vyrebase';
import { VSyncStorage } from '../storage';


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
            } else {
                console.log('User signed out');
                this.vStorage.set({
                    user: false
                });
            }
        });
    }
}