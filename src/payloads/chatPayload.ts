/*
 * Lunachat - sattelite chat based on NuCypher
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {Message} from "../core/message";

export interface ChatCreateDTO {
    id: string;
    members: string[];
    isTetATetChat: boolean;
}

export interface PostMessageDTO {
    chatId: string;
    msg: Message;
}

export interface DeleteMessageDTO {
    chatId: string;
    msgId: string;
}
