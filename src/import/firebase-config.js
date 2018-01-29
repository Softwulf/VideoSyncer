import firebase from 'firebase';
import Rebase from 're-base';

var config = {
    apiKey: "AIzaSyCIkv6bZbXWgpd6mdu72h8uDsySE3qolYg",
    authDomain: "videosyncer.firebaseapp.com",
    databaseURL: "https://videosyncer.firebaseio.com/"
};
var app = firebase.initializeApp(config);

var db = firebase.database(app);

var base = Rebase.createClass(db);

export {
    firebase as firebase,
    db as db,
    base as base,
}