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

  @ManyToMany(type => User, user => user.chats)
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

  ampqControllerDelegate : AmpqChatControllerI

  create(user_id: string, dto: ChatCreateDTO, broadcast?: boolean): Promise<Chat | undefined>;
  findById(user_id: string, chat_id: string): Promise<Chat>;
  postMessage(
      user_id: string,
      dto: PostMessageDTO,
      broadcast?: boolean,
  ): Promise<void>
  deleteMessage(user_id: string, dto: DeleteMessageDTO): Promise<void>;
}

export interface AmpqChatControllerI {
  createChat(receiverId: string, dto: ChatCreateDTO) : void
  sendMessage(user: User, msg: PostMessageDTO): void
}
