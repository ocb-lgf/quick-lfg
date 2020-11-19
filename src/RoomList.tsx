import React, { useEffect, useState } from 'react';
import firebase from "firebase/app";
import { Room, User } from "./types";
import { Col, Container, Row, ListGroup, ListGroupItem, Button, InputGroup, FormControl, Form, Image } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FaSearch, FaTimes } from "react-icons/fa";
import slot_filled from "./assets/slot-filled.svg";
import slot_empty from "./assets/slot-empty.svg";
import psIcon from './assets/playstation.svg';
import pcIcon from './assets/pc.svg';
import xboxIcon from './assets/xbox.svg';
import switchIcon from './assets/switch.svg';

export default function RoomList() {
  const history = useHistory();

  const [rooms, setRooms] = useState<Room[]>();
  const [search, setSearch] = useState<string>("");
  const [filterRooms, setFilterRooms] = useState<Room[]>();
  const [searchPlatforms, setSearchPlatforms] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const [owners, setOwners] = useState<User[]>();
  const [user, setUser] = useState<User>();
  const [allowList, setAllowList] = useState<Room[]>([]);
  const iconStyle = { height: 32, };

  useEffect(() => {
    const collection = firebase.firestore().collection('rooms').orderBy('timeLimit', 'asc');
    return collection.onSnapshot((snapshot) => {
      const r = snapshot.docs.map(d => d.data() as Room);
      setRooms(r.filter(r => {
        if (r.timeLimit && r.timeLimit?.toDate() < new Date()) {
          return false;
        }
        return true;
      }));
    });
  }, [search, searchPlatforms]);

  useEffect(() => {
    const collection = firebase.firestore().collection('users');
    return firebase.auth().onAuthStateChanged(cu => {
      if (cu) {
        collection.doc(cu.uid).get().then(d => {
          setUser(d.data() as User);
        });
      }
    });
  }, []);

  useEffect(() => {
    if (rooms) {
      const collection = firebase.firestore().collection('users');
      Promise.all(rooms.map(r => {
        return collection.doc(r.filledSlots[0]).get().then(d => d.data() as Promise<User>);
      })).then(o => setOwners(o));
      setAllowList(rooms);
    }
  }, [rooms]);

  useEffect(() => {
    if (user && owners && rooms) {
      const filteredList =
        rooms.filter(r => {
          if (r.bannedPlayers && r.bannedPlayers.includes(user.uid)) {
            return false;
          }
          return true;
        });

      setAllowList(filteredList);
    }
  }, [user, owners, rooms]);

  const seconds = 1000;
  const minutes = seconds * 60;
  const hours = minutes * 60;
  const days = hours * 24;

  function timeText(e: any, order: number) {
    let currentTime = new Date();
    let givenTime = new Date(e.seconds * 1000);
    let ms;

    if (order === 0) {
      ms = (Date.parse(currentTime as unknown as string) - Date.parse(givenTime as unknown as string));
    } else {
      ms = (Date.parse(givenTime as unknown as string) - Date.parse(currentTime as unknown as string));
    }

    if ((ms / seconds) < 2) {
      return "s";
    } else if ((ms / seconds) < 60) {
      return "s";
    } else if ((ms / minutes) < 2) {
      return "m";
    } else if ((ms / minutes) < 60) {
      return "m";
    } else if ((ms / hours) < 2) {
      return "h";
    } else if ((ms / hours) < 24) {
      return "h";
    } else if ((ms / days) < 2) {
      return "d";
    } else if ((ms / days) > 2) {
      return "d";
    }
  }

  function timeNumber(e: any, order: number) {
    let currentTime = new Date();
    let givenTime = new Date(e.seconds * 1000);
    let ms;

    if (order === 0) {
      ms = (Date.parse(currentTime as unknown as string) - Date.parse(givenTime as unknown as string));
    } else {
      ms = (Date.parse(givenTime as unknown as string) - Date.parse(currentTime as unknown as string));
    }

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
    let text = timeText(e, 1);
    let timeNum = timeNumber(e, 1);



    if (Math.sign(ms) === -1) {
      return "Expired.";
    } else return ("" + timeNum + text + " left");
  }

  function iconList(total: number, filled: string[]) {
    let icons = [<Image key={-1} className="mt-1" src={slot_filled} title={filled[0]} style={iconStyle} />];

    for (let i = 1; i < filled.length; i++) {
      icons.push(<Image key={i} className="mt-1 ml-1" src={slot_filled} title={filled[i]} style={iconStyle} />);
    }
    for (let i = 0; i < (total - filled.length); i++) {
      icons.push(<Image key={i} className="mt-1 ml-1" src={slot_empty} style={iconStyle} />);
    }
    return icons;
  }

  const list = (chosenRoom: Room[]) => chosenRoom.map((room: Room) => (
    <Link key={room.rid} to={'/instance/' + room.rid}>
      <ListGroupItem action>
        <Container>
          <Row>
            <Col xs={2} className="d-flex justify-content-start align-items-center">
              <div>
                {room.platform.toLowerCase() === "psn" && <img style={{ width: "40px", height: "40px" }} alt="PS" src={psIcon} />}
                {room.platform.toLowerCase() === "xbox" && <img style={{ width: "35px", height: "35px" }} alt="Xbox" src={xboxIcon} />}
                {room.platform.toLowerCase() === "switch" && <img style={{ width: "45px", height: "45px" }} alt="Switch" src={switchIcon} />}
                {room.platform.toLowerCase() === "pc" && <img style={{ width: "35px", height: "35px" }} alt="PC" src={pcIcon} />}
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
                <Col xs={8} className="d-flex justify-content-start text-left">
                  {room.totalSlots < 7 && iconList(room.totalSlots, room.joinedPlayers)}
                  {room.totalSlots >= 7 && <Form.Text className="mt-1 d-flex flex-row">
                    <span className="slot-count">{room.filledSlots.length}</span>
                    <Image className="ml-1" src={slot_filled} style={iconStyle} />
                    <Image className="ml-2 mr-1" src={slot_empty} style={iconStyle} />
                    <span className="slot-count">{room.totalSlots - room.filledSlots.length}</span>
                  </Form.Text>}
                </Col>
                <Col className="d-flex justify-content-end">{timeNumber(room.time, 0)}{timeText(room.time, 0)} ago</Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </ListGroupItem>
    </Link>
  ));


  useEffect(() => {

    const searchedList = allowList.filter(e => e.game.toLowerCase().includes((search).toLowerCase() as unknown as string) || e.title.toLowerCase().includes((search).toLowerCase() as unknown as string));
    let filteredList;
    filteredList = [...searchedList].filter(e => searchPlatforms.includes(e.platform));

    if (searchPlatforms[0] !== undefined) {
      setFilterRooms(filteredList);
    } else setFilterRooms(searchedList);

  }, [search, allowList, searchPlatforms]);

  function checkPlatform(plat: string) {
    let pushArr = [...searchPlatforms];

    if (searchPlatforms.includes(plat)) {
      setSearchPlatforms(searchPlatforms.filter((e: string) => e !== plat));
    } else {
      pushArr.push(plat);
      setSearchPlatforms(pushArr);
    };
  };

  return (
    <>
      <Container className="border-primary mt-3">
        <Row>
          <Col>
            <Form>
              <InputGroup className="mb-3" style={{ position: "relative" }}>
                <FormControl onChange={e => setSearch(e.target.value)} value={search} name="searchText" type="text" placeholder="Search..." aria-label="Search"
                  aria-describedby="search-term" />
                {search !== "" && <FaTimes style={{ color: "#3e4c58", position: "absolute", right: "56px", top: "10px", fontSize: "20px", zIndex: 100 }}
                  type="button" onClick={() => setSearch("")} />}
                <InputGroup.Append>
                  <Button variant="secondary" onClick={() => setOpen(!open)}><FaSearch style={{ marginBottom: 3 }} /></Button>
                </InputGroup.Append>
              </InputGroup>
              <Row className="d-flex justify-content-around" style={{ marginBottom: 15 }}>
                <Form.Check type="checkbox" inline label="PSN" id={`inline-checkbox-1`} name="psn" onChange={() => { checkPlatform("psn"); }} />
                <Form.Check type="checkbox" inline label="Xbox" id={`inline-checkbox-2`} name="xbox" onChange={() => { checkPlatform("xbox"); }} />
                <Form.Check type="checkbox" inline label="Switch" id={`inline-checkbox-3`} name="switch" onChange={() => { checkPlatform("switch"); }} />
                <Form.Check type="checkbox" inline label="PC" id={`inline-checkbox-4`} name="pc" onChange={() => { checkPlatform("pc"); }} />
              </Row>
            </Form>
          </Col>
        </Row>
      </Container>
      <ListGroup>
        {(search === "" && !searchPlatforms[0]) && list(allowList)}
        {!(search === "" && !searchPlatforms[0]) && filterRooms && list(filterRooms)}
      </ListGroup>
      <Button className="fab" onClick={() => history.push('/new-post')}>Post New</Button>
    </>);
}
