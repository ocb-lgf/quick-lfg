import React, { useEffect, useState } from 'react';
import { Redirect, useHistory, useParams } from 'react-router';
import firebase from 'firebase/app';
import { Col, Container, Row as ListGroupItem, ListGroup, Table, Button, Jumbotron, InputGroup, Spinner, Nav } from 'react-bootstrap';
import { Room, User } from "./types";
import useOwner from "./useOwner";
import Chat from "./Chat";
import DeleteMessages from './DeleteMessages';

interface ParamTypes {
    id: string;
}

export default function Instance() {
    let { id } = useParams<ParamTypes>();
    const user = firebase.auth().currentUser;
    const history = useHistory();
    const roomsCollection = firebase.firestore().collection('rooms');
    const owner = useOwner(id);
    const [room, setRoom] = useState<Room>();
    const [players, setPlayers] = useState<User[]>([]);
    const [showTab, setShowTab] = useState('joined');
    const [bannedUsers, setBannedUsers] = useState<User[]>();

    useEffect(() => {
        const collection = firebase.firestore().collection('rooms');
        return collection.doc(id).onSnapshot(d => {
            setRoom(d.data() as Room);
        });
    }, [id]);

    useEffect(() => {
        if (room) {
            const collection = firebase.firestore().collection('users');
            Promise.all(room.filledSlots.map(p => {
                return collection.doc(p).get().then(d => d.data()) as Promise<User>;
            })).then(p => setPlayers(p));
        }
    }, [room]);

    useEffect(() => {
        if (room) {
            const collection = firebase.firestore().collection('users');
            Promise.all(room.bannedPlayers.map(p => {
                return collection.doc(p).get().then(d => d.data()) as Promise<User>;
            })).then(p => setBannedUsers(p));
        }
    }, [room]);

    function timeToGo() {
        if (room && room.timeLimit) {
            const rightNow = new Date();
            const deltaTime = new Date(room.timeLimit.toDate().getTime() - rightNow.getTime());

            if (deltaTime.getUTCHours() === 0) {
                return `Starts in ${deltaTime.getUTCMinutes() % 60}m`;
            }
            return `Starts in ${deltaTime.getUTCHours()}h ${deltaTime.getUTCMinutes() % 60}m`;
        }
        return null;
    }

    function populateSlots() {
        if (room) {
            let slots = [];
            for (let index = 0; index < room.totalSlots; index++) {
                let ign;
                if (players[index]) {
                    ign = players[index][room.platform as keyof User] ?
                        room.platform + ' - ' + players[index][room.platform as keyof User]
                        :
                        'generic - ' + players[index].displayName;
                }
                slots.push(
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{ign}</td>
                        {(user && owner && owner.uid === user.uid) &&
                            players[index] && players[index].uid !== user.uid ? (
                                <td>
                                    <InputGroup className="justify-content-between">
                                        <Button className="btn-danger" onClick={() => handleBlock(players[index].uid)}>Block</Button>
                                        <Button className="btn-warning" onClick={() => handleBan(players[index].uid)}>Ban</Button>
                                        <Button className="btn-success" onClick={() => handleKick(players[index].uid)}>Kick</Button>
                                    </InputGroup>
                                </td>
                            ) : (
                                <td></td>
                            )}
                    </tr>);
            }
            return slots;
        }
    }

    function handleKick(playerToKick: string) {
        if (room) {
            const usersCollection = firebase.firestore().collection('users');

            usersCollection.doc(playerToKick).get().then(d => {
                const u = d.data() as User;
                room.filledSlots = room.filledSlots.filter(s => s !== playerToKick);
                room.joinedPlayers = room.joinedPlayers.filter(s => s !== u.displayName);
                setRoom({
                    ...room,
                });
                roomsCollection.doc(room.rid).set(room);
            });
        }
    }

    function handleBlock(playerToBlock: string) {
        if (room && owner) {
            const usersCollection = firebase.firestore().collection('users');

            if (!owner.blockedPlayers.includes(playerToBlock)) {
                owner.blockedPlayers.push(playerToBlock);
                room.bannedPlayers.push(playerToBlock);
            }
            handleKick(playerToBlock);
            DeleteMessages(id, playerToBlock);
            usersCollection.doc(owner.uid).set(owner, { merge: true });
            roomsCollection.doc(id).set(room, { merge: true });
        }
    }

    function handleBan(playerToBan: string) {
        if (room) {
            const roomsCollection = firebase.firestore().collection('rooms');

            if (!room.bannedPlayers.includes(playerToBan)) {
                room.bannedPlayers.push(playerToBan);
            }
            handleKick(playerToBan);
            DeleteMessages(id, playerToBan);
            roomsCollection.doc(id).set(room, { merge: true });
        }
    }

    function handleUnban(playerToUnban: string) {
        if (room) {
            const roomsCollection = firebase.firestore().collection('rooms');

            room.bannedPlayers = room.bannedPlayers.filter(p => p !== playerToUnban);
            setRoom({
                ...room,
                bannedPlayers: room.bannedPlayers
            });
            roomsCollection.doc(id).set(room, { merge: true });
            if (room.bannedPlayers.length === 0) {
                setShowTab('joined');
            }
        }
    }

    function handleJoin() {
        if (room && room.filledSlots.length < room.totalSlots && user && user.displayName) {
            room.filledSlots.push(user.uid);
            room.joinedPlayers.push(user.displayName);
            setRoom({
                ...room,
                filledSlots: room.filledSlots,
                joinedPlayers: room.joinedPlayers,
            });
            roomsCollection.doc(room.rid).set(room, { merge: true });
        }
    }

    function handleLeave() {
        if (room && user) {
            room.filledSlots = room.filledSlots.filter(s => s !== user.uid);
            room.joinedPlayers = room.joinedPlayers.filter(s => s !== user.displayName);
            setRoom({
                ...room,
                filledSlots: room.filledSlots,
                joinedPlayers: room.joinedPlayers,
            });
            roomsCollection.doc(room.rid).set(room, { merge: true });
        }
    }

    function joinLeaveButtons() {
        let button = <div></div>;

        if (room && owner && user) {
            if (!room.filledSlots.includes(user.uid) && room.filledSlots.length < room.totalSlots) {
                button = <Button onClick={handleJoin}>Join!</Button>;
            }
            else if (owner.uid !== user.uid) {
                button = <Button className="btn-danger" onClick={handleLeave}>Leave</Button>;
            }
        }

        return button;
    }

    const joinedPlayers = (
        <Table striped variant='dark'>
            <thead>
                <tr>
                    <th colSpan={3}>Joined Players</th>
                </tr>
                <tr>
                    <th style={{ width: '1rem' }}>#</th>
                    <th style={{ width: 'auto' }}>Player</th>
                    {owner && user && owner.uid === user.uid && <th style={{ width: '13rem' }}></th>}
                </tr>
            </thead>
            <tbody>
                {user && populateSlots()}
            </tbody>
        </Table >);

    const bannedPlayers = (
        <Table striped variant='dark'>
            <thead>
                <tr>
                    <th colSpan={2}>Banned players</th>
                </tr>
            </thead>
            <tbody>
                {room && bannedUsers && bannedUsers.map(p => (
                    <tr key={p.uid}>
                        <td style={{ width: 'auto' }}>{p[room.platform as keyof User] !== '' ? p[room.platform as keyof User] : p.displayName}</td>
                        <td style={{ width: '1rem' }}><Button className="btn-success" onClick={() => handleUnban(p.uid)}>Unban</Button></td>
                    </tr>
                ))}
            </tbody>
        </Table >);

    function displayRoom() {
        let result = (
            <Container className="d-flex flex-column flex-center m-5">
                <Spinner className="align-self-center justify-self-center" animation="border" />
            </Container>);

        if ((user && owner && owner.blockedPlayers.includes(user.uid))
            || (user && room && room.bannedPlayers.includes(user.uid))) {
            result = <Redirect to="/list" />;
        }
        else if (room && user && owner) {
            result = (<>
                <Jumbotron fluid className="bg-secondary px-3 py-3">
                    <Jumbotron className="d-flex justify-content-center bg-warning py-3">
                        <h2>{room.title}</h2>
                    </Jumbotron>
                    <ListGroup>
                        <ListGroupItem className="px-4">
                            <Col>
                                <ListGroupItem>
                                    <h3>{room.game}</h3>
                                </ListGroupItem>
                                <ListGroupItem>
                                    <h5>({room.platform})</h5>
                                </ListGroupItem>
                                <ListGroupItem>
                                    <h5>Posted by {room.username}</h5>
                                </ListGroupItem>
                            </Col>
                            <Col>
                                <ListGroupItem className="d-flex justify-content-end">
                                    <h5 className="mt-1">Posted: {room.time.toDate().toLocaleTimeString()}</h5>
                                </ListGroupItem>
                                <ListGroupItem className="d-flex justify-content-end">
                                    <h3>{timeToGo()}</h3>
                                </ListGroupItem>
                            </Col>
                        </ListGroupItem>
                    </ListGroup>
                </Jumbotron>
                <Container>
                    <h4 className="pb-3">Staging area:</h4>
                    {owner.uid === user.uid && room.bannedPlayers.length !== 0 && (
                        <Nav variant="tabs" defaultActiveKey="joined">
                            <Nav.Item>
                                <Nav.Link eventKey="joined" onClick={() => setShowTab('joined')}>Joined Players</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="banned" onClick={() => setShowTab('banned')}>Banned Players</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    )}
                    {showTab === 'joined' && joinedPlayers}
                    {showTab === 'banned' && bannedPlayers}
                    {joinLeaveButtons()}
                </Container>
                {room.filledSlots.includes(user.uid) && <Chat rid={id} />}
            </>);
        }
        else if (!user && room) {
            result = (<>
                <Jumbotron fluid className="bg-secondary px-3 py-3">
                    <Jumbotron className="d-flex justify-content-center bg-warning py-3">
                        <h2>{room.title}</h2>
                    </Jumbotron>
                    <ListGroup>
                        <ListGroupItem className="px-4">
                            <Col>
                                <ListGroupItem>
                                    <h3>{room.game}</h3>
                                </ListGroupItem>
                                <ListGroupItem>
                                    <h5>({room.platform})</h5>
                                </ListGroupItem>
                                <ListGroupItem>
                                    <h5>Posted by {room.username}</h5>
                                </ListGroupItem>
                            </Col>
                            <Col>
                                <ListGroupItem className="d-flex justify-content-end">
                                    <h5 className="mt-1">Posted: {room.time.toDate().toLocaleTimeString()}</h5>
                                </ListGroupItem>
                                <ListGroupItem className="d-flex justify-content-end">
                                    <h3>{timeToGo()}</h3>
                                </ListGroupItem>
                            </Col>
                        </ListGroupItem>
                    </ListGroup>
                </Jumbotron>
                <Container>
                    <h4>Staging area:</h4>
                    <Table striped variant='dark'>
                        <tbody>
                            <tr>
                                <td>
                                    <Button onClick={() => history.push('/login')}>Log in to join!</Button>
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </Container>
            </>);
        }

        return result;
    }

    return displayRoom();
}
