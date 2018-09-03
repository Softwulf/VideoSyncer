import * as auth0 from 'auth0-js';
import * as UrlParser from 'url-parse';
import { browser } from 'webextension-polyfill-ts';
import { randomBytes } from 'crypto';
import { auth } from 'firebase';
import { VSyncStorage } from 'background/storage';

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

function createWindow(options: {
    url: string
    active: boolean
}) {
    if(browser.windows && browser.windows.create) {
        browser.windows.create({
            url: options.url,
            type: 'panel',
            width: 500,
            height: 750
        });
    } else {
        browser.tabs.create({
            url: options.url,
            active: options.active
        });
    }
}

function randomString() {
    const random = randomBytes(48);

    return random.toString('hex');
}

export class AuthCore {
    options: WulfAuthOptions
    firebaseAuth: auth.Auth
    auth0: auth0.WebAuth

    vStorage = new VSyncStorage()

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

        await this.vStorage.set({
            auth0_nonce: nonce,
            auth0_state: state
        })

        createWindow({
            url: `https://${this.options.domain}/authorize` + toQueryString({
                response_type: responseType,
                client_id: this.options.clientID,
                redirect_uri: this.options.loginUrl,
                nonce,
                state
            }),
            active: true
        });
    }

    validate(url: string) {
        return new Promise((resolve, reject) => {
            this.vStorage.get<'auth0_nonce'>('auth0_nonce').then(nonce => {
                this.vStorage.get<'auth0_state'>('auth0_state').then(state => {
                    const hash = new UrlParser(url).hash;

                    (this.auth0 as any).parseHash({
                        hash,
                        state,
                        nonce
                    }, (err, authResult) => {
                        if(err) {
                            reject(err);
                        } else {
                            // clear state / nonce from storage
                            this.vStorage.remove('auth0_nonce');
                            this.vStorage.remove('auth0_state');
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
                });
            });
        })
    }

    logout() {
        createWindow({
            url: `https://${this.options.domain}/v2/logout` + toQueryString({
                returnTo: this.options.logoutUrl,
                client_id: this.options.clientID
            }),
            active: false
        });

        return this.firebaseAuth.signOut();
    }

}