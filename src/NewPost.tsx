import React, { ChangeEvent, useState, useEffect } from 'react';
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import { Room } from "./types"
import { platform } from 'os';
import { ButtonGroup, Form } from 'react-bootstrap';
import Button from "react-bootstrap/Button";

export default function NewPost() {
  const [post, setPost] = useState(); {

  }
  const date = new Date();
  const [room, setRoom] = useState<Room>({
    uid: '',
    username: '',
    title: '',
    game: '',
    platform: 'none',
    time: date,
    timeLimit: date,
    totalSlots: 0,
    filledSlots: ['']
  }); 

  function handleChange(event: ChangeEvent<any>) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    setRoom({
      ...room, 
      [name]: value
    });
  }


  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

 /*   const roomCreation = (room);
    if () {
      const collection = firebase.firestore().collection('rooms');
      collection.doc(props.post).set({ ...post, room: room }, { merge: true })
        .then(_r => setPost('success'))
        .catch(_e => setPost('error'));
    } */
  } 


/* of type Room, handlesubmit, object */
console.log(room);
return (
  <>
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
          Enter the your In Game Name.
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

      <Form.Group controlId="formBasicPlatform">
        <Form.Label>Platform</Form.Label>
        <Form.Control type="text" name="username" value={room.platform} 
        onChange={handleChange}
        placeholder="platform" />
        <Form.Text className="text-muted">
          
    </Form.Text>
      </Form.Group>

      <Form.Group controlId="timeForm.ControlInput1">
        <Form.Label>Creation date</Form.Label>
        <Form.Control type="number"
        onChange={handleChange}
        placeholder="time" />
      </Form.Group>
      <Form.Group controlId="timeForm.ControlSelect1">
        <Form.Label>Time select</Form.Label>
        <Form.Control as="select" type="number"
        onChange={handleChange}
        name="timelimit">
          <option>15</option>
          <option>30</option>
          <option>45</option>
          <option>60</option>
        </Form.Control>
      </Form.Group>

      <Form.Group controlId="partyForm.ControlInput1">
        <Form.Label>Size of party</Form.Label>
        <Form.Control type="number" 
        onChange={handleChange}
        placeholder="party" />
      </Form.Group>
      <Form.Group controlId="partyForm.ControlSelect1">
      </Form.Group>

      <div>
        <ButtonGroup className="mr-2" aria-label="Button group">
          <>
            <Button variant="outline-success"
              className="createRoom"
              size="lg"
              type="submit"
              active>New Party
            </Button>

            <Button variant="outline-danger"
              className="deleteRoom"
              size="lg"
              type="submit"
              active>Delete
            </Button>
          </>
        </ButtonGroup>
      </div>
    </Form>
  </>
);
} 