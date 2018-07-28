import { firebase } from '../import/config/firebase-config';

class LoginStatus {
    constructor(appName, appVersion) {
        this.appName = appName;
        this.appVersion = appVersion;
        this.user = null;
        this.statusRef = null;
        this.infoRef = null;

        firebase.auth().onAuthStateChanged(user => {
            if(user) {
                this.on(user);
            } else {
                this.off();
            }
        });
    }

    on(user) {
        this.user = user;
        this.uid = user.uid;
        this.statusRef = firebase.database().ref('/status/' + this.uid);
        this.infoRef = firebase.database().ref('.info/connected');

        this.infoRef.on('value', snapshot => {
            // If we're not currently connected, don't do anything.
            if (snapshot.val() == false) {
                return;
            };
        
            // If we are currently connected, then use the 'onDisconnect()' 
            // method to add a set which will only trigger once this 
            // client has disconnected by closing the app, 
            // losing internet, or any other means.
            this.statusRef.onDisconnect().update(this.getPresence('offline')).then(() => {
                // The promise returned from .onDisconnect().set() will
                // resolve as soon as the server acknowledges the onDisconnect() 
                // request, NOT once we've actually disconnected:
                // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect
        
                // We can now safely set ourselves as 'online' knowing that the
                // server will mark us as offline once we lose connection.
                this.statusRef.update(this.getPresence('online'));
            });
        });

        console.debug('Status managent registered!');
    }

    off() {
        if(this.uid) this.uid = null;
        if(this.statusRef) {
            this.statusRef.update(this.getPresence('offline'));
            this.statusRef.off();
            this.statusRef = null;
        }
        if(this.infoRef) {
            this.infoRef.off();
            this.infoRef = null;
        }
        this.user = null;

        console.debug('Status managent unregistered!');
    }

    getPresence(state) {
        let presence = {
            last_changed: firebase.database.ServerValue.TIMESTAMP,
            displayName: this.user.displayName,
            photoURL: this.user.photoURL,
            state,
        };

        presence[`apps/${this.appName}/version`] = this.appVersion;

        return presence;
    }
}

export default LoginStatus;