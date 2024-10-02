export interface User {
    id: number;
    email: string;
    name: string;
    roles: [Role];
}

export interface Role {
    id: number;
    roleName: string;
}
