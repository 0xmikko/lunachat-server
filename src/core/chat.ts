/*
 * Lunachat - sattelite chat based on NuCypher
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {Message} from './message';
import {SocketPusherDelegateI} from './socket';

import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  ChatCreateDTO,
  DeleteMessageDTO,
  PostMessageDTO,
} from '../payloads/chatPayload';
import {JoinTable, ManyToMany} from "typeorm/index";
import {BasicRepositoryI} from "./basic";
import {User} from "./user";

@Entity()
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({default: ''})
  name: string;

  @ManyToMany(type => User)
  @JoinTable()
  members: User[];

  @OneToMany((type) => Message, (message) => message.chat)
  messages: Message[];
}

export interface ChatsRepositoryI extends BasicRepositoryI<Chat> {
  create(chat: Chat): Promise<Chat | undefined>;
  findByIdFull(id: string): Promise<Chat | undefined>
}

export interface ChatsServiceI extends SocketPusherDelegateI {
  create(user_id: string, dto: ChatCreateDTO): Promise<Chat | undefined>;
  findById(user_id: string, chat_id: string): Promise<Chat>;
  postMessage(user_id: string, dto: PostMessageDTO): Promise<void>;
  deleteMessage(user_id: string, dto: DeleteMessageDTO): Promise<void>;
}
