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
    username: string;
    profilePic?: string;
    platforms: platform[];
    games: string[];
    blockedPlayers?: string[];
}

export type platform = 'PSN' | 'Xbox' | 'Switch' | 'PC' | 'Steam' | 'Battle.net' | 'Epic' | 'Origin';
