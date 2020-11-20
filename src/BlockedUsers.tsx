import React, { useState, useEffect } from 'react';
import { User } from './types';
import firebase from 'firebase/app';
import useUser from './useUser';
import { Button, Table } from 'react-bootstrap';

interface IProps {
    uid: string;
}

export default function BlockedUsers({ uid }: IProps) {
    const user = useUser(uid);
    const [blockedUsers, setBlockedUsers] = useState<User[]>();

    useEffect(() => {
        if (user) {
            const collection = firebase.firestore().collection('users');
            Promise.all(user.blockedPlayers.map(p => {
                return collection.doc(p).get().then(d => d.data()) as Promise<User>;
            })).then(p => setBlockedUsers(p));
        }
    }, [user]);

    function handleUnblock(blockedId: string) {
        if (user) {
            const collection = firebase.firestore().collection('users');
            const blockedArray = user.blockedPlayers.filter(p => p !== blockedId);
            collection.doc(uid).set({
                blockedPlayers: blockedArray
            }, { merge: true });
        }
    }

    return blockedUsers ?
        <Table className="mt-3" striped variant='dark'>
            <thead>
                <tr>
                    <td style={{ width: 'auto' }}>Blocked Users</td>
                    <td style={{ width: '1rem' }}></td>
                </tr>
            </thead>
            <tbody>
                {blockedUsers.map(bp => {
                    return (
                        <tr key={bp.uid}>
                            <td>{bp.displayName}</td>
                            <td><Button className='btn-danger' onClick={() => handleUnblock(bp.uid)}>🗙</Button></td>
                        </tr>
                    );
                })}
            </tbody>
        </Table>
        : null;
}
