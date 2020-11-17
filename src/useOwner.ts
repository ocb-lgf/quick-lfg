import { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import { User } from "./types";

interface IProps {
    rid: string;
}

export default function useOwner({ rid }: IProps) {
    const [uid, setUid] = useState<string | undefined>();
    const [owner, setOwner] = useState<User>();

    useEffect(() => {
        const roomsCollection = firebase.firestore().collection('rooms');
        const usersCollection = firebase.firestore().collection('users');

        roomsCollection.doc(rid).get().then(r => {
            const d = r.data();
            if (d) {
                setUid(d.filledSlots[0]);
            }
        });
        if (uid) {
            usersCollection.doc(uid).get().then(u => {
                setOwner(u.data() as User);
            });
        }
    });

    return owner;
}
