import firebase from 'firebase/app';

export interface Room {
    rid: string;
    username: string;
    title: string;
    game: string;
    platform: platform;
    time: firebase.firestore.Timestamp;
    timeLimit?: firebase.firestore.Timestamp;
    totalSlots: number;
    filledSlots: string[];
}

export interface User {
    uid: string;
    displayName: string | null,
    blockedPlayers: string[];
    psn?: string;
    xbox?: string;
    switch?: string;
    pc?: string;
}

export interface ChatMessage {
    mid: string;
    message: string;
    username: string;
    time: firebase.firestore.Timestamp;
}

export type platform = 'psn' | 'xbox' | 'switch' | 'pc' | 'none';
