import { firebase } from './firebase-config';

import firebaseui from 'firebaseui';
import { StyledFirebaseAuth } from 'react-firebaseui';
import React from 'react';

// Configure FirebaseUI.
const uiConfig = {
    credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
    signInOptions: [
        {
            provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
            requireDisplayName: true
        }
    ],
    callbacks: {
        signInSuccess: () => {
            return false; // Avoid redirects after sign-in.
        }
    }
};

class AuthComponent extends React.Component {
    render() {
        return (
              <StyledFirebaseAuth uiConfig={ uiConfig } firebaseAuth={ firebase.auth() } />
            );
    }
}


export { firebaseui, AuthComponent }