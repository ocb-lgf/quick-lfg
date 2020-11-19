import React, { ChangeEvent, useState } from 'react';
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import { Room, User } from "./types";
import { Container, Col, Button, Form, Image } from 'react-bootstrap';
import { useHistory } from 'react-router';
import { v4 as uuid } from 'uuid';
import slot_empty from "./assets/slot-empty.svg";

interface IProps {
  user: User;
}

export default function NewPost(props: IProps) {
  const date = firebase.firestore.Timestamp.fromDate(new Date());
  const [timeToAdd, setTimeToAdd] = useState<number>(0);
  const user = {
    ...props.user
  };
  const history = useHistory();
  const id: string = uuid();
  const iconStyle = { height: 32, alignSelf: 'center' };

  const [room, setRoom] = useState<Room>({
    rid: '',
    username: firebase.auth().currentUser?.displayName || '',
    title: '',
    game: '',
    platform: 'none',
    time: date,
    timeLimit: firebase.firestore.Timestamp.fromDate(new Date(date.seconds * 1000 + 15 * 60000)),
    totalSlots: 2,
    filledSlots: [user.uid],
    joinedPlayers: user.displayName ? [user.displayName] : [],
    bannedPlayers: [...user.blockedPlayers]
  });

  const [icons, setIcons] = useState<any>([
    <Image key={-2} className="ml-3" src={slot_empty} style={iconStyle} />,
    <Image key={-1} className="ml-1" src={slot_empty} style={iconStyle} />
  ]);

  function handleChange(event: ChangeEvent<any>) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    if (name === 'timeLimit') {
      setTimeToAdd(value);
      setRoom({
        ...room,
        timeLimit: firebase.firestore.Timestamp.fromDate(new Date(date.seconds * 1000 + value * 60000))
      });
    }
    else if (name === 'platform') {
      const uname = user[value as keyof User] as string;
      setRoom({
        ...room,
        [name]: value,
        username: uname || user.displayName || ''
      });
    }
    else if (name === 'totalSlots') {
      let slotIcons = [
        <Image key={-2} className="ml-3" src={slot_empty} style={iconStyle} />,
        <Image key={-1} className="ml-1" src={slot_empty} style={iconStyle} />
      ];
      for (let i = 0; i < value - 2; i++) {
        slotIcons.push(<Image key={i} className="ml-1" src={slot_empty} style={iconStyle} />);
      }
      setIcons(slotIcons);
      setRoom({
        ...room,
        [name]: value
      });
    }
    else {
      setRoom({
        ...room,
        [name]: value
      });
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const collection = firebase.firestore().collection('rooms');

    collection.doc(id).set({ ...room, rid: id })
      .then(_r => history.push('/instance/' + id))
      .catch(error => console.log(error));
  }

  return (
    <Container className="d-flex flex-row justify-content-center">
      <Col lg={6} className="my-4">
        <Form className="d-flex flex-column" onSubmit={handleSubmit}>
          <h2 className="mb-4 align-self-center">Post new LFG</h2>
          <Form.Group>
            <Form.Label>Platform</Form.Label>
            <Form.Group className="d-flex flex-row">
              <Form.Control as="select" type="text" name="platform" value={room.platform}
                onChange={handleChange}
                className="col-4"
                defaultValue={undefined}
                required
                placeholder="platform">
                <option value="" hidden>Select...</option>
                <option value="psn">PSN</option>
                <option value="xbox">Xbox</option>
                <option value="switch">Switch</option>
                <option value="pc">PC</option>
              </Form.Control>
              <Form.Control type="text" name="username" value={room.username}
                onChange={handleChange}
                placeholder="username"
                className="display-name-setting"
                disabled
              />
            </Form.Group>
            <Form.Text className="text-muted" style={{ marginTop: '-12px' }}>
              Choose your platform
            </Form.Text>
          </Form.Group>

          <Form.Group controlId="formBasicGame">
            <Form.Label>Enter a game</Form.Label>
            <Form.Control type="text" name="game" value={room.game}
              onChange={handleChange}
              required
              placeholder="game" />
            <Form.Text className="text-muted">
              Enter the name of your game.
          </Form.Text>
          </Form.Group>

          <Form.Group controlId="formBasicTitle">
            <Form.Label>Enter a title</Form.Label>
            <Form.Control type="text" name="title" value={room.title}
              as="textarea"
              rows={3}
              maxLength={115}
              required
              onChange={handleChange}
              placeholder="title" />
            <Form.Text className="text-muted">
              Enter the title of your post.
          </Form.Text>
          </Form.Group>

          <Form.Group controlId="timeForm.ControlSelect2">
            <Form.Label>Time select</Form.Label>
            <Col sm={4} xs={5} className="p-0">
              <Form.Control as="select" type="number" value={timeToAdd}
                onChange={handleChange}
                name="timeLimit"
                placeholder="none">
                <option value="15">15min</option>
                <option value="30">30min</option>
                <option value="45">45min</option>
                <option value="60">1hr</option>
                <option value="90">1hr 30min</option>
                <option value="120">2hr</option>
              </Form.Control>
            </Col>
            <Form.Text className="text-muted">
              Choose your desired time (in minutes)
          </Form.Text>
          </Form.Group>

          <Form.Group controlId="formBasicSlots">
            <Form.Label>Size of party</Form.Label>
            <Form.Group className="d-flex flex-row">
              <Form.Control style={{ width: 60, }} type="number" min="2" max="40" value={room.totalSlots}
                onChange={handleChange}
                name="totalSlots">
              </Form.Control>
              {room.totalSlots > 6 && <>
                <Image className="ml-3" src={slot_empty} style={iconStyle} />
                <Form.Text className="slot-count ml-1">{room.totalSlots}</Form.Text>
              </>}
              {room.totalSlots <= 6 && icons}
            </Form.Group>
            <Form.Text className="text-muted" style={{ marginTop: '-12px' }}>
              Enter your party size
          </Form.Text>
          </Form.Group>

          <Form.Group className="d-flex flex-row mt-3" style={{ justifyContent: 'space-evenly' }}>
            <Button className="btn-success"
              type="submit">Post
            </Button>
            <Button className="btn-danger"
              onClick={() => history.push('/list')}
            >Cancel
            </Button>
          </Form.Group>
        </Form>
      </Col >
    </Container >
  );
}
