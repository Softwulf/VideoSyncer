import { firebase } from '../../firebase';
import { VSyncStorage } from '../storage';


export class AuthListener {
    vStorage = new VSyncStorage(true);

    constructor() {
        firebase.auth().onAuthStateChanged(user => {
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