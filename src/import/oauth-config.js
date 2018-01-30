/*global browser*/

var config = {
    google: {
        client_id: "879765482619-vhj2vq252njdsjci6co3qheave27qmp6.apps.googleusercontent.com",
        authURL: 'https://accounts.google.com/o/oauth2/auth',
        revokeURL: 'https://accounts.google.com/o/oauth2/revoke',
        redirectURL: 'https://crosssitefeeding.ch/vsync',
        validationBaseURL: 'https://www.googleapis.com/oauth2/v3/tokeninfo',
        scopes: browser.runtime.getManifest().oauth2.scopes,
        storageKey: 'google_token',
        authURLFilled() {
            return `${this.authURL}?client_id=${this.client_id}&response_type=token&redirect_uri=${encodeURIComponent(this.redirectURL)}&scope=${encodeURIComponent(this.scopes.join(' '))}`
        },

        fetchToken() {
            const instance = this;
            var extractAccessToken = function (redirectUri) {
                let m = redirectUri.match(/[#?](.*)/);
                if (!m || m.length < 1)
                    return null;
                let params = new URLSearchParams(m[1].split("#")[0]);
                return params.get("access_token");
            }
            
            var validate = function (redirectURL) {
                const accessToken = extractAccessToken(redirectURL);
                if (!accessToken) {
                    throw "Authorization failure";
                }
                const validationURL = `${instance.validationBaseURL}?access_token=${accessToken}`;
                const validationRequest = new Request(validationURL, {
                    method: "GET"
                });
            
                function checkResponse(response) {
                    return new Promise((resolve, reject) => {
                        if (response.status != 200) {
                            reject("Token validation error");
                        }
                        response.json().then((json) => {
                            if (json.aud && (json.aud === instance.client_id)) {
                                resolve(accessToken);
                            } else {
                                reject("Token validation error");
                            }
                        });
                    });
                }
            
                return fetch(validationRequest).then(checkResponse);
            }

            return browser.identity.launchWebAuthFlow({
                interactive: true,
                url: instance.authURLFilled()
            }).then(validate);
        },

        revokeToken(token) {
            const revokeRequest = new Request(this.revokeURL + '?token='+token, {
                method: "GET"
            });
            return fetch(revokeRequest);
        },

        fetchAndStoreToken() {
            const instance = this;
            return new Promise((resolve, reject) => {
                instance.fetchToken().then((token) => {
                    instance.storeLocalToken(token).then(() => {
                        resolve(token);
                    }).catch((err) => {
                        reject(err);
                    });
                }).catch((err) => {
                    reject(err);
                });
            });
        },

        storeLocalToken(token) {
            var tokenObject = {};
            tokenObject[this.storageKey] = token;
            return browser.storage.local.set(tokenObject);
        },
        removeLocalToken() {
            return browser.storage.local.remove(this.storageKey);
        },
        getLocalToken() {
            const instance = this;
            return new Promise((resolve, reject) => {
                browser.storage.local.get(this.storageKey).then((result) => {
                    if(result[instance.storageKey]) {
                        resolve(result[instance.storageKey]);
                    } else {
                        resolve();
                    }
                }).catch((err) => {
                    reject(err);
                })
            });
        }
    }
};

export default config;