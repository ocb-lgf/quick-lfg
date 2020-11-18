import { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import { User } from "./types";

export default function useOwner(rid: string) {
    const [uid, setUid] = useState<string | undefined>();
    const [owner, setOwner] = useState<User>();

    useEffect(() => {
        const roomsCollection = firebase.firestore().collection('rooms');

        roomsCollection.doc(rid).get().then(r => {
            const d = r.data();
            if (d) {
                setUid(d.filledSlots[0]);
            }
        });
    }, [rid]);

    useEffect(() => {
        if (uid) {
            const usersCollection = firebase.firestore().collection('users');
            return usersCollection.doc(uid).onSnapshot(u => {
                setOwner(u.data() as User);
            });
        }
    }, [uid]);

    return owner;

}
