import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import firebase from 'firebase/app';
import { Col, Container, Row as ListGroupItem, ListGroup, Table, Button, Jumbotron, InputGroup } from 'react-bootstrap';
import { Room, User } from "./types";
import useOwner from "./useOwner";

interface ParamTypes {
    id: string;
}

interface IProps {
    user?: User;
}

export default function Instance(props: IProps) {
    let { id } = useParams<ParamTypes>();
    const user = firebase.auth().currentUser;
    const [room, setRoom] = useState<Room>();
    const owner = useOwner({ rid: id });
    const [players, setPlayers] = useState<User[]>([]);
    const history = useHistory();
    const roomsCollection = firebase.firestore().collection('rooms');

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
                    ign = players[index][room.platform as keyof User] !== '' ?
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
                                        <Button className="btn-warning" onClick={() => handleBan(players[index].uid)}>Ban</Button>
                                        <Button className="btn-danger" onClick={() => handleKick(players[index].uid)}>Kick</Button>
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
            room.filledSlots = room.filledSlots.filter(s => s !== playerToKick);
            setRoom({
                ...room,
                filledSlots: room.filledSlots
            });
            roomsCollection.doc(room.rid).set(room, { merge: true });
        }
    }

    function handleBan(playerToBan: string) {
        if (room && user !== null) {
            const usersCollection = firebase.firestore().collection('users');

        }
    }

    function handleJoin() {
        if (room && room.filledSlots.length <= room.totalSlots && user !== null) {
            room.filledSlots.push(user.uid);
            setRoom({
                ...room,
                filledSlots: room.filledSlots,
            });
            roomsCollection.doc(room.rid).set(room, { merge: true });
        }
    }

    function handleLeave() {
        if (room && user !== null) {
            room.filledSlots = room.filledSlots.filter(s => s !== user.uid);
            setRoom({
                ...room,
                filledSlots: room.filledSlots
            });
            roomsCollection.doc(room.rid).set(room, { merge: true });
        }
    }

    function joinLeaveButtons() {
        let button = <div></div>;

        if (room && owner && user !== null) {
            if (!room.filledSlots.includes(user.uid)) {
                button = <Button onClick={handleJoin}>Join!</Button>;
            }
            else if (owner.uid !== user.uid) {
                button = <Button className="btn-danger" onClick={handleLeave}>Leave</Button>;
            }
        }

        return button;
    }

    return (
        room ?
            <>
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
                        <thead>
                            <tr>
                                <th style={{ width: '1rem' }}>#</th>
                                <th style={{ width: 'auto' }}>Player</th>
                                {user && owner && owner.uid === user.uid && <th style={{ width: '9rem' }}></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {props.user ?
                                populateSlots()
                                :
                                <tr>
                                    <td>
                                        <Button onClick={() => history.push('/login')}>Log in to join!</Button>
                                    </td>
                                </tr>
                            }
                        </tbody>
                    </Table>
                    {joinLeaveButtons()}
                </Container>
            </>
            :
            <div></div>
    );
}
