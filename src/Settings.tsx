import React, { ChangeEvent, useState } from 'react';
import { User } from './types';
import firebase from 'firebase/app';
import { Form, Button, Alert } from 'react-bootstrap';

interface IProps {
    user: User;
    docId?: string;
}

export default function Settings(props: IProps) {
    const [saveStatus, setSaveStatus] = useState<string>();
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
                [name]: value.split(',')
            });
        } else {
            setUser({
                ...user,
                [name]: value
            });
        }
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaveStatus('');

        const games = user.games?.map((g: string) => g.trim());
        if (props.docId) {
            const collection = firebase.firestore().collection('users');
            collection.doc(props.docId).set({ ...user, games: games }, { merge: true })
                .then(_r => setSaveStatus('success'))
                .catch(_e => setSaveStatus('error'));
        }
    }

    return (
        <Form className="px-3 m-auto d-flex flex-column align-content-start" onSubmit={handleSubmit}>
            {saveStatus === 'success' && <Alert variant='success'>Successfully saved!</Alert>}
            {saveStatus === 'error' && <Alert variant='error'>Something went wrong.</Alert>}
            <Form.Label>Games you're interested in (separate with comma):</Form.Label>
            <Form.Control type='text' value={user.games?.join(',')} name="games" onChange={handleChange} />
            <Form.Label>PSN username:</Form.Label>
            <Form.Control className="w-50" type='text' value={user.psn} name="psn" onChange={handleChange} />
            <Form.Label>Xbox username:</Form.Label>
            <Form.Control className="w-50" type='text' value={user.xbox} name="xbox" onChange={handleChange} />
            <Form.Label>Switch friendcode:</Form.Label>
            <Form.Control className="w-50" type='text' value={user.switch} name="switch" onChange={handleChange} />
            <Form.Label>PC username:</Form.Label>
            <Form.Control className="w-50" type='text' value={user.pc} name="pc" onChange={handleChange} />
            <Form.Label>Steam username:</Form.Label>
            <Form.Control className="w-50" type='text' value={user.steam} name="steam" onChange={handleChange} />
            <Form.Label>Battle.net username:</Form.Label>
            <Form.Control className="w-50" type='text' value={user.battlenet} name="battlenet" onChange={handleChange} />
            <Form.Label>Epic username:</Form.Label>
            <Form.Control className="w-50" type='text' value={props.user.epic} name="epic" onChange={handleChange} />
            <Form.Label>Origin username:</Form.Label>
            <Form.Control className="w-50" type='text' value={user.origin} name="origin" onChange={handleChange} />
            <Form.Group className="align-self-center mt-3">
                <Button variant="primary" type="submit">Save</Button>
            </Form.Group>
        </Form>
    );
}
