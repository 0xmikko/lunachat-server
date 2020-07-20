/*
 * Lunachat - sattelite chat based on NuCypher
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {Column, Entity, ManyToMany, PrimaryGeneratedColumn, RelationCount,} from 'typeorm';
import {SocketPusherDelegateI} from './socket';
import {BasicRepositoryI} from './basic';
import {Chat} from './chat';
import {JoinTable, OneToMany} from 'typeorm/index';
import {ProfileUpdateDTO} from "../payloads/profilePayload";
import {Message} from "./message";

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({default: ''})
  name: string;

  @Column({default: ''})
  avatar: string;

  @ManyToMany((type) => Chat, (chat) => chat.members)
  chats: Chat[];

  @OneToMany((type) => Message, (message) => message.owner)
  messages: Message[];

  @ManyToMany((type) => User, (Profile) => Profile.following)
  @JoinTable()
  contacts: User[];

  @ManyToMany((type) => User, (Profile) => Profile.contacts)
  following: User[];

  @RelationCount((Profile: User) => Profile.contacts)
  contactsCount: number;

  @RelationCount((Profile: User) => Profile.following)
  followingCount: number;
}

export const DefaultUser: User = {
  id: '',
  name: 'New User',
  avatar: '',
  chats: [],
  messages: [],
  contacts: [],
  following: [],
  followingCount: 0,
  contactsCount: 0,
};

export interface UserRepositoryI extends BasicRepositoryI<User> {
  findOneFull(id: string): Promise<User | undefined>;
}

export interface UserServiceI extends SocketPusherDelegateI {
  createProfile(Profile_id: string): Promise<User>;
  getProfile(Profile_id: string): Promise<User | undefined>;
  addContact(
    Profile_id: string,
    contact_id: string,
  ): Promise<User | undefined>;

  update(
    Profile_id: string,
    dto: ProfileUpdateDTO,
  ): Promise<User | undefined>;
  list(): Promise<User[] | undefined>;
}
