import React from 'react';
import firebase from 'firebase/app';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { User } from './types';
import { useHistory } from 'react-router-dom';

interface IProps {
    setUser: (user: User) => void;
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
                    const newUser: User = { uid: authResult.user.uid };
                    collection.add(newUser);
                }
                history.push('/settings');
                return false;
            }
        },
    };

    return <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />;
}
