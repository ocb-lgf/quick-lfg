export interface Room {
    uid: string;
    username: string;
    title: string;
    game: string;
    platform: platform;
    time: Date;
    timeLimit?: Date;
    totalSlots: number;
    filledSlots: string[];
}

export interface User {
    uid: string;
    games?: string[];
    blockedPlayers?: string[];
    psn?: string;
    xbox?: string;
    switch?: string;
    steam?: string;
    pc?: string;
    battlenet?: string;
    epic?: string;
    origin?: string;
}

export type platform = 'psn' | 'xbox' | 'switch' | 'pc' | 'steam' | 'battlenet' | 'epic' | 'origin';
