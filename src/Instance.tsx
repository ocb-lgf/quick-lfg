import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import firebase from 'firebase/app';
import { Col, Container, Row, ListGroup, ListGroupItem, Button, Jumbotron } from 'react-bootstrap';
import { Room, User } from "./types";

interface ParamTypes {
    id: string;
}

interface IProps {
    user?: User;
    room?: Room;
}

export default function Instance(props: IProps) {
    let { id } = useParams<ParamTypes>();
    const [room, setRoom] = useState<Room | undefined>(props.room);
    const [players, setPlayers] = useState<User[]>();
    const history = useHistory();

    useEffect(() => {
        if (!room) {
            const collection = firebase.firestore().collection('rooms');
            collection.doc(id).get().then(d => {
                setRoom(d.data() as Room);
            });
        }
        else if (room) {
            const collection = firebase.firestore().collection('users');
            room.filledSlots.forEach(p => {
                collection.doc(p).get().then(d => {
                    if (players) {
                        setPlayers([
                            ...players,
                            d.data() as User
                        ]);
                    } else {
                        setPlayers([
                            d.data() as User
                        ]);
                    }
                });
            });
        }
    }, [id, room]);

    console.log(players);


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

    return (
        room ?
            <>
                <Jumbotron fluid className="bg-secondary px-3 py-3">
                    <Jumbotron className="d-flex justify-content-center bg-primary py-3">
                        <h2>{room.title}</h2>
                    </Jumbotron>
                    <Row className="px-4">
                        <Col>
                            <Row>
                                <h3>{room.game}</h3>
                            </Row>
                            <Row>
                                <h5>({room.platform})</h5>
                            </Row>
                            <Row>
                                <h5>Posted by {room.username}</h5>
                            </Row>
                        </Col>
                        <Col>
                            <Row className="d-flex justify-content-end">
                                <h5 className="mt-1">Posted: {room.time.toDate().toLocaleTimeString()}</h5>
                            </Row>
                            <Row className="d-flex justify-content-end">
                                <h3>{timeToGo()}</h3>
                            </Row>
                        </Col>
                    </Row>
                </Jumbotron>
                <Container>
                    {props.user ?
                        <Row>
                            <Col xs={2}>test</Col>
                            <Col xs={10}>test</Col>
                        </Row>
                        :
                        <Button onClick={() => history.push('/login')}>Create a user to join!</Button>
                    }
                </Container>
            </>
            :
            <div></div>
    );
}
