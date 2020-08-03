/*
 * Lunachat - sattelite chat based on NuCypher
 * Copyright (c) 2020. Mikhail Lazarev
 */

export interface ProfileUpdateDTO {
    id?: string
    name: string;
    avatar: string;
    reader?: string;
}

export interface ProfileContactDTO {
    id: string;
}
