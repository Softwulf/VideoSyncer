import * as auth0 from 'auth0-js';
import * as UrlParser from 'url-parse';
import * as browser from 'webextension-polyfill-ts';

type WulfAuthOptions = {
    domain: string
    clientID: string
    redirectUri: string
    audience: string
}

const firebaseTokenClaimName = 'https://softwulf.com/firebase_token';

export class WulfAuth {
    options: WulfAuthOptions
    firebaseAuth: firebase.auth.Auth
    auth0: auth0.WebAuth

    constructor(options: WulfAuthOptions, firebaseAuth: firebase.auth.Auth) {
        this.options = options;
        this.firebaseAuth = firebaseAuth;

        this.auth0 = new auth0.WebAuth({
            domain: options.domain,
            clientID: options.clientID,
            redirectUri: options.redirectUri,
            audience: options.audience,
            responseType: 'token id_token',
            scope: 'openid profile'
        });

        this.login = this.login.bind(this);
    }

    async login() {
        this.auth0.popup.authorize({
            domain: this.options.domain,
            clientId: this.options.clientID,
            redirectUri: this.options.redirectUri,
            audience: this.options.audience,
            responseType: 'token id_token',
            scope: 'openid profile'
        }, (err, response) => {
            // this callback will never be called due to web extension limitations
        });
    }

    validate(url: string) {
        return new Promise((resolve, reject) => {
            const hash = new UrlParser(url).hash;
            (this.auth0 as any).parseHash({ hash }, (err, authResult) => {
                if(err) {
                    reject(err);
                } else {
                    if(!authResult.idTokenPayload[firebaseTokenClaimName]) {
                        reject({
                            message: 'No firebase token received!'
                        })
                    } else {
                        const firebaseToken = authResult.idTokenPayload[firebaseTokenClaimName];
                        this.firebaseAuth.signInWithCustomToken(firebaseToken).then(resolve).catch(reject);
                    }
                }
            });
        })
    }

    logout() {
        console.log('Logging out');
        browser.browser.windows.create({
            url: `https://${this.options.domain}/v2/logout?returnTo=${encodeURIComponent(this.options.redirectUri)}&client_id=${this.options.clientID}`
        });
        this.firebaseAuth.signOut();
    }

}