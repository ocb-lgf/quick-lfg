import React, { useEffect, useState } from 'react';
import firebase from "firebase/app";
import { Room } from "./types";
import { Col, Container, Row, ListGroup, ListGroupItem, Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function RoomList() {
  const history = useHistory();
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    const collection = firebase.firestore().collection('rooms');
    return collection.onSnapshot((snapshot) => {
      setRooms(snapshot.docs.map(d => ({
        ...d.data()
      })) as Room[]);
    });
  }, []);



  const seconds = 1000;
  const minutes = seconds * 60;
  const hours = minutes * 60;
  const days = hours * 24;

  function timeText(e: any) {
    let currentTime = new Date();
    let postedTime = new Date(e.seconds * 1000);
    const ms = (Date.parse(currentTime as unknown as string) - Date.parse(postedTime as unknown as string));

    if ((ms / seconds) < 2) {
      return "second";
    } else if ((ms / seconds) < 60) {
      return "seconds";
    } else if ((ms / minutes) < 2) {
      return "minute";
    } else if ((ms / minutes) < 60) {
      return "minutes";
    } else if ((ms / hours) < 2) {
      return "hour";
    } else if ((ms / hours) < 24) {
      return "hours";
    } else if ((ms / days) < 2) {
      return "day";
    } else if ((ms / days) > 2) {
      return "days";
    }
  }

  function timeNumber(e: any) {
    let currentTime = new Date();
    let postedTime = new Date(e.seconds * 1000);
    const ms = (Date.parse(currentTime as unknown as string) - Date.parse(postedTime as unknown as string));

    if (((ms / seconds) < 2) || ((ms / seconds) < 60)) {
      return Math.floor(ms / seconds);
    } else if (((ms / minutes) < 2) || ((ms / minutes) < 60)) {
      return Math.floor(ms / minutes);
    } else if (((ms / hours) < 2) || ((ms / hours) < 24)) {
      return Math.floor(ms / hours);
    } else if (((ms / days) < 2) || ((ms / days) > 2)) {
      return Math.floor(ms / days);
    }
  }

  function timeExpires(e: any) {

    let currentTime = new Date();
    let expireTime = new Date(e.seconds * 1000);
    const ms = (Date.parse(expireTime as unknown as string) - Date.parse(currentTime as unknown as string));
    let text;
    let timeNum;

    if (((ms / seconds) < 2) || ((ms / seconds) < 60)) {
      timeNum = Math.floor(ms / seconds);
    } else if (((ms / minutes) < 2) || ((ms / minutes) < 60)) {
      timeNum = Math.floor(ms / minutes);
    } else if (((ms / hours) < 2) || ((ms / days) < 2)) {
      timeNum = Math.floor(ms / hours);
    } else if (((ms / days) < 2) || ((ms / days) > 2)) {
      timeNum = Math.floor(ms / days);
    }

    if ((ms / seconds) < 2) {
      text = "second";
    } else if ((ms / seconds) < 60) {
      text = "seconds";
    } else if ((ms / minutes) < 2) {
      text = "minute";
    } else if ((ms / minutes) < 60) {
      text = "minutes";
    } else if ((ms / hours) < 2) {
      text = "hour";
    } else if ((ms / hours) < 24) {
      text = "hours";
    } else if ((ms / days) < 2) {
      text = "day";
    } else if ((ms / days) > 2) {
      text = "days";
    }

    if (Math.sign(ms) === -1) {
      return "Expired.";
    } else return ("" + timeNum + " " + text + " left.");
  }

  const list = rooms.map((room: Room) => (
    <Link key={room.uid} to={'/instance/' + room.uid}>
      <ListGroupItem action >
        <Container>
          <Row>
            <Col xs={2} className="d-flex justify-content-start align-items-center">
              <div>
                <img src="unknown.png" alt="" /><br />
                {room.platform}
              </div>
            </Col>
            <Col>
              <Row>
                <Col xs={8} className="d-flex justify-content-start text-left font-weight-bold">{room.game}</Col>
                <Col className="d-flex justify-content-end">{timeExpires(room.timeLimit)}</Col>
              </Row>
              <Row>
                <Col xs={8} className="d-flex justify-content-start text-left font-weight-lighter font-italic">{room.title}</Col>
                <Col className="d-flex justify-content-end">{room.username}</Col>
              </Row>
              <Row>
                <Col xs={8} className="d-flex justify-content-start text-left">Slots: {room.filledSlots.length} of {room.totalSlots}</Col>
                <Col className="d-flex justify-content-end">{timeNumber(room.time)} {timeText(room.time)} ago.</Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </ListGroupItem>
    </Link>
  ));

  return (
    <>
      <ListGroup>
        {list}
      </ListGroup>
      <Button className="fab" onClick={() => history.push('/new-post')}>Post New</Button>
    </>);
}
