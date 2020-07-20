/*
 * Lunachat - sattelite chat based on NuCypher
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {CreateDateColumn} from 'typeorm/index';
import {Chat} from './chat';
import {User} from "./user";

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({default: ''})
  text: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne((type) => Chat, (chat) => chat.messages)
  chat: Chat;

  @ManyToOne((type) => User, (user) => user.messages)
  user: User;
}

export interface MessagesRepositoryI {
  findOne(messageId: string): Promise<Message | undefined>;
  list(chatId: string): Promise<Message[] | undefined>;
  addMessage(chatId: string, message: Message): Promise<Message | undefined>;
  // deleteMessage(
  //   chatId: string,
  //   messageId: string,
  // ): Promise<Message[] | undefined>;
}
