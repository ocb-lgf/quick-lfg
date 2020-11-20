import React, { ChangeEvent, useEffect, useState } from 'react';
import { User } from './types';
import firebase from 'firebase/app';
import { Container, Col, Form, Button, Alert, Spinner, Row } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import BlockedUsers from './BlockedUsers';

interface IProps {
    user: User;
}

export default function Settings(props: IProps) {
    const [saveStatus, setSaveStatus] = useState<string>();
    const [user, setUser] = useState<User>();
    const history = useHistory();

    useEffect(() => {
        setUser(props.user);
    }, [props.user]);

    function handleChange(event: ChangeEvent<any>) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        if (user) {
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
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaveStatus('');

        const collection = firebase.firestore().collection('users');
        collection.doc(props.user.uid).set({ ...user }, { merge: true })
            .then(_r => setSaveStatus('success'))
            .catch(_e => setSaveStatus('error'));
    }

    return (
        user ? <Container className="d-flex flex-row justify-content-center">
            <Col lg={6} className="py-2">
                <Form className="d-flex flex-column" onSubmit={handleSubmit}>
                    <Row>
                        <Col xs={5} md={4}>
                            <Button className="btn-danger" onClick={() => {
                                history.push('/list');
                                window.location.reload();
                                firebase.auth().signOut();
                            }
                            }>Log out</Button>
                        </Col>
                        <Col className="d-flex flex-column">
                            <h2 className="mb-4">Settings</h2>
                        </Col>
                    </Row>
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
                    <Form.Group className="pt-3 d-flex flex-row justify-content-center">
                        <Button variant="primary" type="submit">Save</Button>
                    </Form.Group>
                    {user.blockedPlayers.length !== 0 && <BlockedUsers uid={props.user.uid} />}
                </Form>
            </Col>
        </Container >
            :
            <Spinner className="align-self-center justify-self-center" animation="border" />
    );
}
