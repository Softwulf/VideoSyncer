/*global browser*/

var config = {
    chrome: {
        client_id: "879765482619-vhj2vq252njdsjci6co3qheave27qmp6.apps.googleusercontent.com",
        authURL: 'https://accounts.google.com/o/oauth2/auth',
        revokeURL: 'https://accounts.google.com/o/oauth2/revoke',
        redirectURL: 'https://crosssitefeeding.ch/vsync',
        scopes: browser.runtime.getManifest().oauth2.scopes
    }
};

export default config;