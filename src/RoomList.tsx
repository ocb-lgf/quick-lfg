import React, { useEffect, useState } from 'react';
import firebase from "firebase/app";
import { Room, User } from "./types";
import { Col, Container, Row, ListGroup, ListGroupItem, Button, Collapse, InputGroup, FormControl, Form } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FaSearch, FaTimes } from "react-icons/fa";


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

  useEffect(() => {
    const collection = firebase.firestore().collection('rooms').orderBy('time', 'desc');;
    return collection.onSnapshot((snapshot) => {
      setRooms(snapshot.docs.map(d => ({
        ...d.data()
      })) as Room[]);
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
          const owner = owners.find(o => {
            if (r.filledSlots[0] === o.uid) {
              return true;
            }
            return false;
          });
          if ((owner && owner.blockedPlayers.includes(user.uid))
            || (user && owner && user.blockedPlayers.includes(owner.uid))) {
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
      <Button onClick={() => setOpen(!open)} aria-controls="collapse-filter" aria-expanded={open}>Filter</Button>
      <Collapse in={open}>
        <Container id="collapse-filter">
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
                  <Form.Check type="checkbox" label="PSN" name="psn" onChange={() => { checkPlatform("psn"); }} />
                  <Form.Check type="checkbox" label="Xbox" name="xbox" onChange={() => { checkPlatform("xbox"); }} />
                  <Form.Check type="checkbox" label="Switch" name="switch" onChange={() => { checkPlatform("switch"); }} />
                  <Form.Check type="checkbox" label="PC" name="pc" onChange={() => { checkPlatform("pc"); }} />
                </Row>
              </Form>
            </Col>
          </Row>
        </Container>
      </Collapse>
      <ListGroup>
        {(search === "" && !searchPlatforms[0]) && list(allowList)}
        {!(search === "" && !searchPlatforms[0]) && filterRooms && list(filterRooms)}
      </ListGroup>
      <Button className="fab" onClick={() => history.push('/new-post')}>Post New</Button>
    </>);
}
