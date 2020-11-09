import React, { useEffect, useState } from 'react';
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import { Room } from "./types"


export default function RoomList() {
    const [rooms, setRooms] = useState<Room[]>([]);

    useEffect(() => {
        const collection = firebase.firestore().collection('rooms');
        return collection.onSnapshot((snapshot) => {
            setRooms(snapshot.docs.map(d => ({
                ...d.data()
            }))as Room[]);
        });
    }, []);

    const list = rooms.map((room: Room) => <li className="list-group-item">
        <h3 className="float-left">{room.game}</h3>
        <h4>{room.platform}</h4>
        <h5>Slots filled: {room.filledSlots.length} of {room.totalSlots}</h5>
        <p className="card-title">{room.title}</p>
        </li>)

    return <div>
        {<ul className="list-group">{list}</ul>}
    </div>;
}
