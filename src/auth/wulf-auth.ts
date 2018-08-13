import { WulfAuth } from "./auth-core";
import { firebase } from '../firebase';

export const AuthCore = new WulfAuth({
    domain: 'wulf.eu.auth0.com',
    clientID: 'N05T621mqmuVSXzYWq2uptIdJEkKcG4J',
    loginUrl: 'https://vsync.ch/_oauth/login',
    logoutUrl: 'https://vsync.ch/_oauth/logout',
    audience: 'https://wulf.eu.auth0.com/userinfo'
}, firebase.auth());