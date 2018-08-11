import { WulfAuth } from "./auth-core";
import { browser } from "webextension-polyfill-ts";
import { firebase } from '../../import/config/firebase-config';

export const AuthCore = new WulfAuth({
    domain: 'wulf.eu.auth0.com',
    clientID: 'N05T621mqmuVSXzYWq2uptIdJEkKcG4J',
    loginUrl: browser.runtime.getURL('content/oauth/login.html')/*'https://example.com'*/,
    logoutUrl: browser.runtime.getURL('content/oauth/logout.html'),
    audience: 'https://wulf.eu.auth0.com/userinfo'
}, firebase.auth());