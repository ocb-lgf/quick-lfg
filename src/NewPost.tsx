import React, { ChangeEvent, useState } from 'react';
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import { Room, User } from "./types";
import { Alert, ButtonGroup, Form } from 'react-bootstrap';
import Button from "react-bootstrap/Button";
import { useHistory } from 'react-router';
import { v4 as uuid } from 'uuid';

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

  const [room, setRoom] = useState<Room>({
    rid: '',
    username: firebase.auth().currentUser?.displayName || '',
    title: '',
    game: '',
    platform: 'none',
    time: date,
    timeLimit: date,
    totalSlots: 0,
    filledSlots: [user.uid],
    joinedPlayers: user.displayName ? [user.displayName] : [],
    bannedPlayers: [...user.blockedPlayers]
  });

  function handleChange(event: ChangeEvent<any>) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    if (name === 'timeLimit') {
      setTimeToAdd(value);
      setRoom({
        ...room,
        // timeLimit: new Date(date.getTime() + value * 60000)
        timeLimit: firebase.firestore.Timestamp.fromDate(new Date(date.seconds * 1000 + value * 60000))
      });
    } else {
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

  function AlertDismissible() {
    const [show, setShow] = useState(true);

    if (show) {
      return (
        <Alert variant="dark" onClose={() => setShow(false)} dismissible>
          <Alert.Heading>Make sure you don't have an ongoing party open!</Alert.Heading>
          <p>
            You can only have one party open, make sure you don't have an existing LFG open!
          </p>
        </Alert>
      );
    }
    return <Button onClick={() => setShow(true)}>Notifier</Button>;
  }

  return (

    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="formBasicTitle">
        <Form.Label>Enter a title</Form.Label>
        <Form.Control type="text" name="title" value={room.title}
          onChange={handleChange}
          placeholder="title" />
        <Form.Text className="text-muted">
          Enter the title of your post.
          </Form.Text>
      </Form.Group>

      <Form.Group controlId="formBasicName">
        <Form.Label>Enter your IGN name</Form.Label>
        <Form.Control type="text" name="username" value={room.username}
          onChange={handleChange}
          placeholder="username" />
        <Form.Text className="text-muted">
          Enter the your in game name.
          </Form.Text>
      </Form.Group>

      <Form.Group controlId="formBasicGame">
        <Form.Label>Enter a game</Form.Label>
        <Form.Control type="text" name="game" value={room.game}
          onChange={handleChange}
          placeholder="game" />
        <Form.Text className="text-muted">
          Enter the name of your game.
          </Form.Text>
      </Form.Group>

      <Form.Group controlId="timeForm.ControlSelect1">
        <Form.Label>Platform</Form.Label>
        <Form.Control as="select" type="text" name="platform" value={room.platform}
          onChange={handleChange}
          placeholder="platform">
          <option>none</option>
          <option>psn</option>
          <option>xbox</option>
          <option>switch</option>
          <option>pc</option>
        </Form.Control>
        <Form.Text className="text-muted">
          Choose your platform
          </Form.Text>
      </Form.Group>

      <Form.Group controlId="timeForm.ControlSelect2">
        <Form.Label>Time select</Form.Label>
        <Form.Control as="select" type="number" value={timeToAdd}
          onChange={handleChange}
          name="timeLimit"
          placeholder="none">
          <option>15</option>
          <option>30</option>
          <option>45</option>
          <option>60</option>
          <option>90</option>
          <option>120</option>
        </Form.Control>
        <Form.Text className="text-muted">
          Choose your desired time (in minutes)
          </Form.Text>
      </Form.Group>

      <Form.Group controlId="formBasicSlots">
        <Form.Label>Size of party</Form.Label>
        <Form.Control type="number" min="0" max="40" value={room.totalSlots}
          onChange={handleChange}
          name="totalSlots">
        </Form.Control>
        <Form.Text className="text-muted">
          Enter your party size
          </Form.Text>
      </Form.Group>

      <div>
        <ButtonGroup className="mr-2" aria-label="Button group">
          <>
            <Button variant="outline-success"
              className="createRoom"
              size="lg"
              type="submit"
                  /* onClick={() => history.push('/list')} */ >New party
            </Button>
            <Button variant="outline-danger"
              className="cancelRoom"
              size="lg"
            >Cancel
            </Button>
          </>
        </ButtonGroup>
      </div>

      <AlertDismissible />
    </Form>
  );
}
