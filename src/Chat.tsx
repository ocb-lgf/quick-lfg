import React, { ChangeEvent, useState } from 'react';
import firebase from "firebase/app";
import { Chats } from "./types";
import { Button, Form } from 'react-bootstrap';
import { v4 as uuid } from 'uuid';
import { useHistory } from 'react-router';

// Create a reference to the chat collection
var messagesRef = firebase.firestore().collection("chat");

export default function Chat() {

  messagesRef.doc("chat").set({
    message: '',
    display: firebase.auth().currentUser?.displayName,
  });
  const history = useHistory();
  const id: string = uuid();
  const date = firebase.firestore.Timestamp.fromDate(new Date());

  const [messages, setMessage] = useState<Chats>({
    mid: '',
    message: '',
    username: firebase.auth().currentUser?.displayName || '',
    time: date,
  });

  function handleChange(event: ChangeEvent<any>) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    if (name === 'time') {
      setMessage(value);
      setMessage(
        {
          ...messages,
          time: firebase.firestore.Timestamp.fromDate(new Date(date.seconds + value))
        }
      );
    } else {
      setMessage({
        ...messages,
        [name]: value
      });
    }
  }
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const collection = firebase.firestore().collection('rooms');
    collection.doc(id).set({ ...messages, mid: id })

    .then(_r => history.push('/chat/' + id))
    .catch(error => console.log(error));
  }


  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="formBasicTitle">
        <Form.Label>Enter a title</Form.Label>
        <Form.Control type="text" name="time" value={messages.message}
          onChange={handleChange}
          placeholder="messages" />
        <Form.Text className="text-muted">
          Your message.
          </Form.Text>
      </Form.Group>
      <Button variant="outline-primary"
        className="createMessage"
        size="lg"
        type="submit">Send
            </Button>
    </Form>
  );
}