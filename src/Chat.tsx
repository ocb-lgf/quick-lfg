import React, { ChangeEvent, useEffect, useState } from 'react';
import firebase from "firebase/app";
import { ChatMessage } from "./types";
import { Button, Form, Row, Col, Container, InputGroup } from 'react-bootstrap';
import { v4 as uuid } from 'uuid';

// Create a reference to the chat collection
interface IProps {
  rid: string;
}
export default function Chat({ rid }: IProps) {
  const collection = firebase.firestore().collection("rooms").doc(rid).collection("chat")
  const date = firebase.firestore.Timestamp.fromDate(new Date());
  const username = firebase.auth().currentUser?.displayName
  const [message, setMessage] = useState<ChatMessage>({
    mid: '',
    message: '',
    username: '',
    time: date
  })
  const [messages, setMessages] = useState<ChatMessage[]>([])

  useEffect(() => {
    const mCollection = firebase.firestore().collection("rooms").doc(rid).collection("chat").orderBy('time', 'asc')
    return mCollection.onSnapshot((snapshot) => {
      setMessages(snapshot.docs.map(d => ({
        ...d.data()
      })) as ChatMessage[]);
    });
  }, [])


  function handleChange(event: ChangeEvent<any>) {
    const target = event.target;
    const value = target.value;
    if (username) {
      const message: ChatMessage = {
        mid: uuid(),
        message: value,
        username: username,
        time: firebase.firestore.Timestamp.fromDate(new Date())
      }
      setMessage(message)
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if(message.message !== ''){
      collection.doc(message.mid).set(message)
    }
  }

  return (
    <Container className="mt-3">
      <Col className="chatbox">
        {messages && messages.length && messages.map(m => 
          <Row className="d-flex justify-content-start ">
            <Col><span className="text-muted">{m.time.toDate().toLocaleTimeString()}</span> - <span className="text-primary">{m.username}:</span> {m.message}</Col>
          </Row>
          )}
      </Col>
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Form.Control type="text" value={message.message}
            onChange={handleChange}
            placeholder="messages" />
        <Button
          type="submit">Send
          </Button>
          </InputGroup>
      </Form>
    </Container>
  );
}
