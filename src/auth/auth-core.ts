import * as auth0 from 'auth0-js';
import * as UrlParser from 'url-parse';
import { browser } from 'webextension-polyfill-ts';
import { randomBytes } from 'crypto';
import * as auth from 'firebase/auth';

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

function randomString() {
    const random = randomBytes(48);

    return random.toString('hex');
}

const nonceStorageKey = 'auth0_nonce';
const stateStorageKey = 'auth0_state';

export class WulfAuth {
    options: WulfAuthOptions
    firebaseAuth: auth.Auth
    auth0: auth0.WebAuth

    constructor(options: WulfAuthOptions, firebaseAuth: auth.Auth) {
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
        this.validate = this.validate.bind(this);
        this.logout = this.logout.bind(this);
    }

    async login() {
        const nonce = randomString();
        const state = randomString();

        const storageObj = {};
        storageObj[nonceStorageKey] = nonce;
        storageObj[stateStorageKey] = state;

        await browser.storage.local.set(storageObj);

        browser.windows.create({
            url: `https://${this.options.domain}/authorize` + toQueryString({
                response_type: responseType,
                client_id: this.options.clientID,
                redirect_uri: this.options.loginUrl,
                nonce,
                state
            }),
            type: 'panel',
            width: 500,
            height: 600
        });
    }

    validate(url: string) {
        return new Promise((resolve, reject) => {
            browser.storage.local.get([nonceStorageKey, stateStorageKey]).then(fromStorage => {
                const hash = new UrlParser(url).hash;
                const nonce = fromStorage[nonceStorageKey];
                const state = fromStorage[stateStorageKey];

                (this.auth0 as any).parseHash({
                    hash,
                    state,
                    nonce
                }, (err, authResult) => {
                    if(err) {
                        reject(err);
                    } else {
                        // clear state / nonce from storage
                        browser.storage.local.remove([nonceStorageKey, stateStorageKey]);
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
            }).catch(err => {
                reject(err);
            });
        })
    }

    logout() {
        const options = {
            url: `https://${this.options.domain}/v2/logout` + toQueryString({
                returnTo: this.options.logoutUrl,
                client_id: this.options.clientID
            }),
            type: 'panel',
            width: 60,
            height: 50,
            focused: false
        };
        browser.windows.create(options as any);
        this.firebaseAuth.signOut();
    }

}