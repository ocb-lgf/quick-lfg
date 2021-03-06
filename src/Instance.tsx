import React, { useEffect, useState, useRef, ChangeEvent } from 'react';
import { Redirect, useHistory, useParams } from 'react-router';
import { Link } from "react-router-dom";
import firebase from 'firebase/app';
import { Col, Container, Row as ListGroupItem, ListGroup, Table, Button, Jumbotron, InputGroup, Spinner, Nav, Modal, Popover, Overlay } from 'react-bootstrap';
import { FaCrown } from 'react-icons/fa';
import { HiDotsVertical } from "react-icons/hi";
import useWindowSize from './useWindowSize';
import { Room, User } from "./types";
import useOwner from "./useOwner";
import Chat from "./Chat";
import DeleteMessages from './DeleteMessages';
import DeleteRooms from './DeleteRoom';
import prettyPlatform from './PrettyPlatform';

interface ParamTypes {
    id: string;
}

export default function Instance() {
    let { id } = useParams<ParamTypes>();
    const user = firebase.auth().currentUser;
    const history = useHistory();
    const { width } = useWindowSize();
    const roomsCollection = firebase.firestore().collection('rooms');
    const owner = useOwner(id);
    const [room, setRoom] = useState<Room>();
    const [players, setPlayers] = useState<User[]>([]);
    const [showTab, setShowTab] = useState('joined');
    const [bannedUsers, setBannedUsers] = useState<User[]>();
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [popShow, setPopShow] = useState(false);
    const [popTarget, setPopTarget] = useState(null);
    const popRef = useRef();

    useEffect(() => {
        const collection = firebase.firestore().collection('rooms');
        return collection.doc(id).onSnapshot(d => {
            if (d.data()) {
                setRoom(d.data() as Room);
            } else {
                history.push('/list');
            }
        });
    }, [id, history]);

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

    function handleKick(playerToKick: string) {
        if (room) {
            const usersCollection = firebase.firestore().collection('users');
            setPopShow(false);

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

    function deleteModal() {
        return (
            <Modal centered size="sm" show={confirmDelete} animation={false} onHide={() => setConfirmDelete(false)}>
                <Modal.Header closeButton>
                    <Modal.Title className="text-black-50">Are you sure?</Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                    <Link to="/list"><Button variant="danger" onClick={() => DeleteRooms(id)}>Delete</Button></Link>
                    <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    function joinLeaveDeleteButtons() {
        let button = <div></div>;

        if (room && owner && user) {
            if (!room.filledSlots.includes(user.uid) && room.filledSlots.length < room.totalSlots) {
                button = <Button onClick={handleJoin}>Join!</Button>;
            }
            else if (owner.uid !== user.uid) {
                button = <Button className="btn-danger" onClick={handleLeave}>Leave</Button>;
            }
            else if (owner.uid === user.uid) {
                button = <Button className="btn-danger" onClick={() => setConfirmDelete(true)}>Delete room!</Button>;
            }
        }

        return button;
    }

    function openPopover(event: ChangeEvent<any>) {
        setPopShow(!popShow);
        setPopTarget(event.target);
    }

    function populateSlots() {
        if (room) {
            let slots = [];
            for (let index = 0; index < room.totalSlots; index++) {
                let isOwner = ((user && owner && owner.uid === user.uid) && players[index] && players[index].uid !== user.uid) ? true : false;
                let ign;
                if (players[index]) {
                    ign = players[index][room.platform as keyof User] ?
                        prettyPlatform(room.platform) + ' - ' + players[index][room.platform as keyof User]
                        :
                        'Generic - ' + players[index].displayName;
                }
                slots.push(
                    <React.Fragment key={index}><tr>
                        <td>{index + 1}</td>
                        {index === 0 ? <td>{ign} <FaCrown color="#fcba03" className="mb-1 mr-2" /></td> : <td>{ign}</td>}
                        {isOwner && (width >= 576) && (
                            <td>
                                <InputGroup className="justify-content-end">
                                    <Button className="btn-danger mr-2" onClick={() => handleBlock(players[index].uid)}>Block</Button>
                                    <Button className="btn-warning mr-2" onClick={() => handleBan(players[index].uid)}>Ban</Button>
                                    <Button className="btn-success" onClick={() => handleKick(players[index].uid)}>Kick</Button>
                                </InputGroup>
                            </td>
                        )}
                        {isOwner && (width < 576) && (
                            <>
                                <td onClick={openPopover} className="text-center"><HiDotsVertical /></td>
                                <Overlay
                                    show={popShow}
                                    target={popTarget}
                                    transition={false}
                                    placement="bottom"
                                    rootClose={true}
                                    onHide={() => setPopShow(false)}
                                    container={popRef.current}>
                                    <Popover id="mod-buttons">
                                        <Popover.Content>
                                            <InputGroup className="justify-content-end">
                                                <Button className="btn-danger mr-2" onClick={() => handleBlock(players[index].uid)}>Block</Button>
                                                <Button className="btn-warning mr-2" onClick={() => handleBan(players[index].uid)}>Ban</Button>
                                                <Button className="btn-success" onClick={() => handleKick(players[index].uid)}>Kick</Button>
                                            </InputGroup></Popover.Content>
                                    </Popover>

                                </Overlay>
                            </>
                        )}
                        {!isOwner && <td></td>}
                    </tr>
                    </React.Fragment>);
            }
            return slots;
        }
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
                    <th></th>
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
                        <td style={{ width: 'auto' }}>{p[room.platform as keyof User] ? prettyPlatform(room.platform) + ' - ' + p[room.platform as keyof User] : 'Generic - ' + p.displayName}</td>
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
                {deleteModal()}
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
                    {joinLeaveDeleteButtons()}
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
