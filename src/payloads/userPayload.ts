/*
 * Lunachat - sattelite chat based on NuCypher
 * Copyright (c) 2020. Mikhail Lazarev
 */

export interface tokenData {
    user_id: string;
    exp: number;
}

export interface TokenPair {
    access: string;
    refresh: string;
}

export interface UserSendCodeDTO {
    phone: string;
}

export const sendCodeDTOSchema = {
    type: 'object',
    required: ['phone'],
    properties: {
        phone: {
            type: 'string',
        },
    },
};

export interface LoginDTO {
    phone: string;
    code: string;
}

export const loginDTOSchema = {
    type: 'object',
    required: ['phone', 'code'],
    properties: {
        phone: {
            type: 'string',
        },
        code: {
            type: 'string',
        },
    },
};

export interface AuthorizeWebDTO {
    code: string;
}

export const authorizeWebDTOSchema = {
    type: 'object',
    required: ['code'],
    properties: {
        code: {
            type: 'string',
        },
    },
};

export interface refreshDTO {
    refresh: string;
}

export const refreshDTOSchema = {
    type: 'object',
    required: ['refresh'],
    properties: {
        refresh: {
            type: 'string',
        },
    },
};
