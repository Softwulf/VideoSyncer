import { WulfAuth } from "./auth-core";
import { browser } from "webextension-polyfill-ts";
import { firebase } from '../../import/config/firebase-config';

export const AuthCore = new WulfAuth({
    domain: 'wulf.eu.auth0.com',
    clientID: 'N05T621mqmuVSXzYWq2uptIdJEkKcG4J',
    /*loginUrl: browser.runtime.getURL('content/oauth/login.html'),
    logoutUrl: browser.runtime.getURL('content/oauth/logout.html'),*/
    loginUrl: 'https://vsync.ch/_oauth/login',
    logoutUrl: 'https://vsync.ch/_oauth/logout',
    audience: 'https://wulf.eu.auth0.com/userinfo'
}, firebase.auth());