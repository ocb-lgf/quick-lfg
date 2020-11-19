import React, { ChangeEvent, useState } from 'react';
import { User } from './types';
import firebase from 'firebase/app';
import { Container, Col, Form, Button, Alert } from 'react-bootstrap';

interface IProps {
    user: User;
    docId?: string;
}

export default function Settings(props: IProps) {
    const [saveStatus, setSaveStatus] = useState<string>();
    const [user, setUser] = useState<User>({
        displayName: '',
        psn: '',
        xbox: '',
        switch: '',
        pc: '',
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

        if (props.docId) {
            const collection = firebase.firestore().collection('users');
            collection.doc(props.docId).set({ ...user }, { merge: true })
                .then(_r => setSaveStatus('success'))
                .catch(_e => setSaveStatus('error'));
        }
    }

    return (
        <Container>
            <Col lg={6} className="py-2">
                <Form onSubmit={handleSubmit}>
                    {saveStatus === 'success' && <Alert variant='success'>Successfully saved!</Alert>}
                    {saveStatus === 'error' && <Alert variant='error'>Something went wrong.</Alert>}
                    <Form.Label>PSN username:</Form.Label>
                    <Form.Control type='text' value={user.psn} name="psn" onChange={handleChange} />
                    <Form.Label>Xbox username:</Form.Label>
                    <Form.Control type='text' value={user.xbox} name="xbox" onChange={handleChange} />
                    <Form.Label>Switch friendcode:</Form.Label>
                    <Form.Control type='text' value={user.switch} name="switch" onChange={handleChange} />
                    <Form.Label>PC username:</Form.Label>
                    <Form.Control type='text' value={user.pc} name="pc" onChange={handleChange} />
                    <Form.Group className="pt-3 d-flex flex-row justify-content-end">
                        <Button variant="primary" type="submit">Save</Button>
                    </Form.Group>
                </Form>
            </Col>
        </Container>
    );
}
