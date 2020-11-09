import React, { useEffect, useState } from 'react';
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import { Room } from "./types";
import RoomList from './RoomList';


type NewPost = {
    text: string;
}

export default function NewPost() {
    const [posts, setPost] = useState<Room[]>([]);

    useEffect(() => {
        const collection = firebase.firestore().collection('rooms')
        return collection.onSnapshot((snapshot) => {
            setPost(snapshot.docs.map(d => ({
                ...d.data()
            })) as Room[]);
        });
    }, []);

    const post = posts.map((room: Room) => <li className="post-group-item">
        <h3>{room.uid}</h3>
        <h3>{room.username}</h3>
        <h3>{room.title}</h3>
        <h3>{room.game}</h3>
        <h3>{room.platform}</h3>
        <h3>{room.time}</h3>
        <h3>{room.timeLimit}</h3>
        <h3>Party size:{room.totalSlots}</h3>
        <h3>Party slots filled: {room.filledSlots}</h3>
        <h4 className="post-title">{room.title}</h4>
        <h2>{RoomList}</h2>
        </li>)


    return <div>
        {<ol className="post-list">{post}</ol>}
    </div>;
}