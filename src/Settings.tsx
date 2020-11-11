import React, { ChangeEvent, useState } from 'react';
import { User } from './types';
import firebase from 'firebase/app';
import { Form, Button } from 'react-bootstrap';

interface IProps {
    user: User;
    docId?: string;
}

export default function Settings(props: IProps) {
    const [user, setUser] = useState<User>({
        games: [''],
        psn: '',
        xbox: '',
        switch: '',
        steam: '',
        pc: '',
        battlenet: '',
        epic: '',
        origin: '',
        ...props.user
    });

    function handleChange(event: ChangeEvent<any>) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        if (name === 'games') {
            setUser({
                ...user,
                [name]: value.split(',').map((g: string) => g.trim())
            });
        } else {
            setUser({
                ...user,
                [name]: value
            });
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (props.docId) {
            const collection = firebase.firestore().collection('users');
            collection.doc(props.docId).set({ ...user }, { merge: true });
        }
    }

    return (
        // <div>Hello {firebase.auth().currentUser?.displayName}</div>
        <Form className="w-75 m-auto" onSubmit={handleSubmit}>
            <Form.Label>Games you're interested in (separate with comma):</Form.Label>
            <Form.Control type='text' value={user.games?.join(',')} name="games" onChange={handleChange} />
            <Form.Label>PSN username:</Form.Label>
            <Form.Control type='text' value={user.psn} name="psn" onChange={handleChange} />
            <Form.Label>Xbox username:</Form.Label>
            <Form.Control type='text' value={user.xbox} name="xbox" onChange={handleChange} />
            <Form.Label>Switch friendcode:</Form.Label>
            <Form.Control type='text' value={user.switch} name="switch" onChange={handleChange} />
            <Form.Label>PC username:</Form.Label>
            <Form.Control type='text' value={user.pc} name="pc" onChange={handleChange} />
            <Form.Label>Steam username:</Form.Label>
            <Form.Control type='text' value={user.steam} name="steam" onChange={handleChange} />
            <Form.Label>Battle.net username:</Form.Label>
            <Form.Control type='text' value={user.battlenet} name="battlenet" onChange={handleChange} />
            <Form.Label>Epic username:</Form.Label>
            <Form.Control type='text' value={props.user.epic} name="epic" onChange={handleChange} />
            <Form.Label>Origin username:</Form.Label>
            <Form.Control type='text' value={user.origin} name="origin" onChange={handleChange} />
            <Button variant="primary" type="submit">Save</Button>
        </Form>
    );
}
