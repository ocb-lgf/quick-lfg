import React from 'react';
import firebase from 'firebase/app';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { User } from './types';
import { useHistory } from 'react-router-dom';

interface IProps {
    setUser: (user: User) => void;
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
                console.log('anything!');
                const collection = firebase.firestore().collection('users');
                if (authResult.additionalUserInfo.isNewUser) {
                    const newUser: User = { uid: authResult.user.uid };
                    collection.add(newUser);
                }
                collection.where('uid', '==', authResult.user.uid).get()
                    .then(qSnapshot => {
                        qSnapshot.forEach(doc => {
                            const user: User = {
                                uid: authResult.user.uid,
                                ...doc.data()
                            };
                            props.setUser(user);
                            history.push('/settings');
                        });
                    }
                    );
                return false;
            }
        },
    };

    return <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />;
}
