import { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import { User } from "./types";

export default function useUser(uid: string) {
    const [user, setUser] = useState<User>();

    useEffect(() => {
        const usersCollection = firebase.firestore().collection('users');
        if (uid) {
            return usersCollection.doc(uid).onSnapshot(u => {
                setUser(u.data() as User);
            });
        }
    }, [uid]);

    return user;
}
