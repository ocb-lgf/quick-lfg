import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import firebase from "firebase/app";
import { ChatMessage } from "./types";
import { Button, Form, Row, Col, Container, InputGroup } from 'react-bootstrap';
import { v4 as uuid } from 'uuid';

interface IProps {
  rid: string;
}

export default function Chat({ rid }: IProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const collection = firebase.firestore().collection("rooms").doc(rid).collection("chat");
  const date = firebase.firestore.Timestamp.fromDate(new Date());
  const username = firebase.auth().currentUser?.displayName;
  const uid = firebase.auth().currentUser?.uid;
  const [message, setMessage] = useState<ChatMessage>({
    mid: '',
    message: '',
    username: '',
    uid: '',
    time: date,
    isDeleted: false,
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const mCollection = firebase.firestore().collection("rooms").doc(rid).collection("chat").orderBy('time', 'asc');
    return mCollection.onSnapshot((snapshot) => {
      setMessages(snapshot.docs.map(d => ({
        ...d.data()
      })) as ChatMessage[]);
      scrollToBottom();
    });
  }, [rid]);

  function handleChange(event: ChangeEvent<any>) {
    const target = event.target;
    const value = target.value;
    if (username && uid) {
      const message: ChatMessage = {
        mid: uuid(),
        message: value,
        username: username,
        uid: uid,
        time: firebase.firestore.Timestamp.fromDate(new Date()),
        isDeleted: false,
      };
      setMessage(message);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (message.message !== '') {
      collection.doc(message.mid).set(message);
      setMessage({
        mid: '',
        message: '',
        username: '',
        uid: '',
        time: date,
        isDeleted: false,
      });
    }
  }

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  return (
    <Container className="mt-3 mb-5">
      <Col className="chatbox">
        {messages && messages.length !== 0 && messages.map(m =>
          <Row key={m.mid} className="d-flex justify-content-start">
            <Col>
              <span className="text-muted">
                {m.time.toDate().toLocaleTimeString()}
              </span> - <span className="text-primary">{m.username}:</span> <span className={m.isDeleted ? "text-muted" : ""}>
                {m.isDeleted ? 'This message has been deleted.' : m.message}
              </span>
            </Col>
          </Row>
        )}
        <Row ref={bottomRef} className="chat-bottom"></Row>
      </Col>
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Form.Control type="text" value={message.message}
            onChange={handleChange}
            placeholder="Chat..." />
          <Button
            type="submit">Send
          </Button>
        </InputGroup>
      </Form>
    </Container>
  );
}
