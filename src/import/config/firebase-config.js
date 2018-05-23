import firebase from 'firebase';
import Rebase from 're-base';

var config = {
    apiKey: "AIzaSyBLKHfIWkEW7fsAGwe0zXol9n8k0p6vDDs",
    authDomain: "softwulf.firebaseapp.com",
    databaseURL: "https://softwulf.firebaseio.com",
    projectId: "softwulf",
    storageBucket: "softwulf.appspot.com",
    messagingSenderId: "436445289686"
};
var app = firebase.initializeApp(config);

var db = firebase.database(app);

var base = Rebase.createClass(db);

export {
    firebase as firebase, db as db, base as base,
}