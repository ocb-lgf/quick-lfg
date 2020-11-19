import React from 'react';
import firebase from 'firebase/app';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { User } from './types';
import { useHistory } from 'react-router-dom';


export default function Login() {
    const history = useHistory();

    const uiConfig = {
        signInFlow: 'redirect',
        signInOptions: [
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
        ],
        callbacks: {
            signInSuccessWithAuthResult: (authResult: any) => {
                const collection = firebase.firestore().collection('users');
                if (authResult.additionalUserInfo.isNewUser) {
                    const newUser: User = {
                        uid: authResult.user.uid,
                        displayName: authResult.user.displayName,
                        blockedPlayers: [],
                    };
                    collection.doc(authResult.user.uid).set(newUser);
                }
                history.push('/settings');
                return false;
            }
        },
    };

    return <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />;
}
