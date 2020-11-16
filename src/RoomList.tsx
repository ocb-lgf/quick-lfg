import React, { useEffect, useState } from 'react';
import firebase from "firebase/app";
import { Room } from "./types";
import { Col, Container, Row, ListGroup, ListGroupItem, Button, Collapse, InputGroup, FormControl, Form } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FaSearch, FaTimes } from "react-icons/fa";


export default function RoomList() {
  const history = useHistory();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState<any>({
    searchTerm: "",
    platforms: [],
  });
  const [filterRooms, setFilterRooms] = useState<Room[]>(rooms);

  useEffect(() => {
    console.log(search)
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

  
  const list = (chosenRoom: Room[]) => chosenRoom.map((room: Room) => (
    <Link key={room.rid} to={'/instance/' + room.rid}>
    <ListGroupItem action>
      <Container>
        <Row>
          <Col xs={2} className="d-flex justify-content-start align-items-center">
            <div>
              {room.platform.toLowerCase() === "psn" && <img style={{ width: "40px", height: "40px" }} alt="psimg" src="https://upload.wikimedia.org/wikipedia/commons/0/0d/Font_Awesome_5_brands_playstation.svg" />}
              {room.platform.toLowerCase() === "xbox" && <img style={{ width: "35px", height: "35px" }} alt="xboximg" src="https://upload.wikimedia.org/wikipedia/commons/7/77/Font_Awesome_5_brands_xbox.svg" />}
              {room.platform.toLowerCase() === "switch" && <img style={{ width: "45px", height: "45px" }} alt="s-img" src="https://upload.wikimedia.org/wikipedia/commons/3/3f/Nintendo_Switch_Logo_%28without_text%29.svg" />}
              <br />
              {room.platform === "psn" && "PSN"}
              {room.platform === "xbox" && "XBox"}
              {room.platform === "switch" && "Switch"}
              {room.platform === "pc" && "PC"}
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

  const [open, setOpen] = useState(false);
  const [psnCheck, setPsnCheck] = useState<boolean>(false);
  const [xboxCheck, setXboxCheck] = useState<boolean>(false);
  const [pcCheck, setPcCheck] = useState<boolean>(false);
  const [switchCheck, setSwitchCheck] = useState<boolean>(false);

  useEffect(() => {

    const searchedList = [...rooms].filter(e => e.game.toLowerCase().includes((search.searchTerm).toLowerCase() as unknown as string))
    let filteredList;
    filteredList = [...searchedList].filter(e => search.platforms.includes(e.platform))

    if (search.platforms[0] !== undefined) {
      setFilterRooms(filteredList);
    } else setFilterRooms(searchedList)

  }, [search])

  useEffect(() => {
    let roomObj = { ...search };
    if (psnCheck) {
      if (!(roomObj.platforms.includes("psn"))) {
        roomObj.platforms.push("psn")
      }
    } else roomObj.platforms = roomObj.platforms.filter((e: string) => e !== "psn")
    setSearch(roomObj);
  }, [psnCheck]);

  useEffect(() => {
    let roomObj = { ...search };
    if (xboxCheck) {
      if (!(roomObj.platforms.includes("xbox"))) {
        roomObj.platforms.push("xbox")
      }
    } else roomObj.platforms = roomObj.platforms.filter((e: string) => e !== "xbox")
    setSearch(roomObj);
  }, [xboxCheck]);

  useEffect(() => {
    let roomObj = { ...search };
    if (switchCheck) {
      if (!(roomObj.platforms.includes("switch"))) {
        roomObj.platforms.push("switch")
      }
    } else roomObj.platforms = roomObj.platforms.filter((e: string) => e !== "switch")
    setSearch(roomObj);
  }, [switchCheck]);

  useEffect(() => {
    let roomObj = { ...search };
    if (pcCheck) {
      if (!(roomObj.platforms.includes("pc"))) {
        roomObj.platforms.push("pc")
      }
    } else roomObj.platforms = roomObj.platforms.filter((e: string) => e !== "pc")
    setSearch(roomObj);
  }, [pcCheck]);


  return (
    <>
      <Button onClick={() => setOpen(!open)} aria-controls="collapse-filter" aria-expanded={open}>Filter</Button>
      <Collapse in={open}>
        <Container id="collapse-filter">
          <Row>
            <Col>
              <Form>
                <InputGroup className="mb-3" style={{ position: "relative" }}>
                  <FormControl onChange={e => setSearch({searchTerm: e.target.value,platforms: {...search}.platforms})} value={search.searchTerm} name="searchText" type="text" placeholder="Search..." aria-label="Search"
                    aria-describedby="search-term" /><FaTimes style={{ color: "#3e4c58", position: "absolute", right: "56px", top: "10px", fontSize: "20px", zIndex: 100}}
                      type="button" onClick={() => setSearch({searchTerm: "",platforms: {...search}.platforms})} />
                  <InputGroup.Append>
                    <Button variant="secondary" onClick={() => setOpen(!open)}><FaSearch style={{marginBottom: 3}} /></Button>
                  </InputGroup.Append>
                </InputGroup>
                <Row className="d-flex justify-content-around" style={{ marginBottom: 15 }}>
                  <Form.Check type="checkbox" label="PSN" name="psn" onChange={() => { setPsnCheck(!psnCheck); console.log(psnCheck) }} />
                  <Form.Check type="checkbox" label="Xbox" name="xbox" onChange={() => { setXboxCheck(!xboxCheck) }} />
                  <Form.Check type="checkbox" label="Switch" name="switch" onChange={() => { setSwitchCheck(!switchCheck) }} />
                  <Form.Check type="checkbox" label="PC" name="pc" onChange={() => { setPcCheck(!pcCheck) }} />
                </Row>
              </Form>
            </Col>
          </Row>
        </Container>
      </Collapse>
      <ListGroup>
        {(search.searchTerm === "" && !search.platforms[0]) && list(rooms)}
        {!(search.searchTerm === "" && !search.platforms[0]) && list(filterRooms)}
      </ListGroup>
      <Button className="fab" onClick={() => history.push('/new-post')}>Post New</Button>
    </>);
}
