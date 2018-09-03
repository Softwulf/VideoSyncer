import { vyrebase } from 'vyrebase';
import { VSyncStorage } from '../storage';


export class AuthListener {
    vStorage = new VSyncStorage(true);

    constructor() {
        vyrebase.auth().onAuthStateChanged(user => {
            if(user) {
                console.log(`User ${user.displayName} [${user.uid}] signed in`);
                this.vStorage.set({
                    user: {
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        uid: user.uid
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