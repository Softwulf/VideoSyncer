import * as auth0 from 'auth0-js';
import * as UrlParser from 'url-parse';
import * as browser from 'webextension-polyfill-ts';

type WulfAuthOptions = {
    domain: string
    clientID: string
    loginUrl: string
    logoutUrl: string
    audience: string
}

const firebaseTokenClaimName = 'https://softwulf.com/firebase_token';

const responseType = 'token id_token';
const scopes = 'openid profile'

function toQueryString(params: {
    [key: string]: string
}): string {
    return '?' + Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
}


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
            redirectUri: options.loginUrl,
            audience: options.audience,
            responseType,
            scope: scopes
        });

        this.login = this.login.bind(this);
    }

    async login() {
        console.log(this.options.loginUrl);
        browser.browser.windows.create({
            url: `https://${this.options.domain}/authorize` + toQueryString({
                response_type: responseType,
                client_id: this.options.clientID,
                redirect_uri: this.options.loginUrl,
                display: 'popup',
                nonce: '1234'
            }),
            type: 'panel',
            width: 500,
            height: 600
        });
        /*this.auth0.popup.authorize({
            domain: this.options.domain,
            clientId: this.options.clientID,
            redirectUri: this.options.loginUrl,
            audience: this.options.audience,
            responseType: 'token id_token',
            scope: 'openid profile'
        }, (err, response) => {
            // this callback will never be called due to web extension limitations
        });*/
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
        browser.browser.windows.create({
            url: `https://${this.options.domain}/v2/logout` + toQueryString({
                returnTo: this.options.logoutUrl,
                client_id: this.options.clientID
            }),
            type: 'panel'
        });
        this.firebaseAuth.signOut();
    }

}