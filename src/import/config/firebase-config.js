import firebase from 'firebase';
import Rebase from 're-base';

var config = {
    apiKey: "AIzaSyCepp-bxGmXdvaZMls7gWAD2yjXTZ-LB24",
    authDomain: "aurora-appz.firebaseapp.com",
    databaseURL: "https://aurora-appz.firebaseio.com",
    projectId: "aurora-appz",
    storageBucket: "aurora-appz.appspot.com",
    messagingSenderId: "722597016924"
};
var app = firebase.initializeApp(config);

var db = firebase.database(app);

var base = Rebase.createClass(db);

export { firebase as firebase, db as db, base as base,
}