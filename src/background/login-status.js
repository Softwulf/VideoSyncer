import { firebase } from '../import/config/firebase-config';

class LoginStatus {
    constructor() {
        this.uid = null;
        this.statusRef = null;
        this.infoRef = null;
    }

    on(user) {
        this.isOfflineForDatabase = {
            state: 'offline',
            last_changed: firebase.database.ServerValue.TIMESTAMP,
            displayName: user.displayName
        };
        
        this.isOnlineForDatabase = {
            state: 'online',
            last_changed: firebase.database.ServerValue.TIMESTAMP,
            displayName: user.displayName
        };
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
            this.statusRef.onDisconnect().set(this.isOfflineForDatabase).then(() => {
                // The promise returned from .onDisconnect().set() will
                // resolve as soon as the server acknowledges the onDisconnect() 
                // request, NOT once we've actually disconnected:
                // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect
        
                // We can now safely set ourselves as 'online' knowing that the
                // server will mark us as offline once we lose connection.
                this.statusRef.set(this.isOnlineForDatabase);
            });
        });

        console.debug('Status managent registered!');
    }

    off() {
        if(this.uid) this.uid = null;
        if(this.statusRef) {
            this.statusRef.set(this.isOfflineForDatabase);
            this.statusRef.off();
            this.statusRef = null;
        }
        if(this.infoRef) {
            this.infoRef.off();
            this.infoRef = null;
        }

        console.debug('Status managent unregistered!');
    }
}

export default LoginStatus;