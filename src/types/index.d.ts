interface IUser {
    id: number;
    name: string;
}

interface IGame {
    id: string;
    numbers : Roll[];
}

type Roll = 1 | 2 | 3 | 4 | 5 | 6 | undefined;