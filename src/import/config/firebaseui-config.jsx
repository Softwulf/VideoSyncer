import { firebase } from './firebase-config';

import firebaseui from 'firebaseui';
import { StyledFirebaseAuth } from 'react-firebaseui';
import React from 'react';

// Configure FirebaseUI.
const uiConfig = {
    signInOptions: [
        {
            provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
            requireDisplayName: false
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