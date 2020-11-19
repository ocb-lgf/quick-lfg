import React from 'react';
import firebase from 'firebase/app';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { User } from './types';
import { useHistory } from 'react-router-dom';

interface IProps {
    setDocId: (id: string) => void;
}

export default function Login(props: IProps) {
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
                props.setDocId(authResult.user.uid);
                history.push('/settings');
                return false;
            }
        },
    };

    return <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />;
}
