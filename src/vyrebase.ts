import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

const config = {
    apiKey: 'AIzaSyBLKHfIWkEW7fsAGwe0zXol9n8k0p6vDDs',
    authDomain: 'softwulf.firebaseapp.com',
    databaseURL: 'wss://softwulf.firebaseio.com',
    projectId: 'softwulf',
    storageBucket: 'softwulf.appspot.com',
    messagingSenderId: '436445289686'
};

const app = firebase.initializeApp(config);
const db = firebase.database(app);
const auth = firebase.auth();

export {
    firebase as vyrebase,
    db
}