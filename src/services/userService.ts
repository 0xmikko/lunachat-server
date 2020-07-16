/*
 * Lunachat - sattelite chat based on NuCypher
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {
  DefaultUser,
  User,
  UserRepositoryI,
  UserServiceI,

} from '../core/user';
import {inject, injectable} from 'inversify';
import {TYPES} from '../types';
import {SocketUpdate} from '../core/operations';
import {Chat, ChatsRepositoryI } from '../core/chat';
import {SocketPusher} from "../core/socket";
import {ProfileUpdateDTO} from "../payloads/profilePayload";

@injectable()
export class UserService implements UserServiceI {
  private _repository: UserRepositoryI;
  private _chatsRepository: ChatsRepositoryI;
  private _updateQueue: SocketUpdate[];
  private _profileInProgress: Set<string>;
  private _pusher : SocketPusher;

  public constructor(
    @inject(TYPES.UserRepository) repository: UserRepositoryI,
    @inject(TYPES.ChatsRepository) chatsRepository: ChatsRepositoryI,
  ) {
    this._repository = repository;
    this._chatsRepository = chatsRepository;
    this._updateQueue = [];
    this._profileInProgress = new Set<string>();
  }

  setPusher(pusher: SocketPusher): void {
    this._pusher = pusher;
  }


  async createProfile(user_id: string): Promise<void> {
    const profile = DefaultUser;
    profile.id = user_id;
    try {
      await this._repository.insert(profile);
    } catch (e) {
      this._profileInProgress.delete(user_id);
    }
  }

  async getProfile(user_id: string): Promise<User | undefined> {
    return await this._repository.findOneFull(user_id);
  }

  async update(user_id: string, dto: ProfileUpdateDTO): Promise<User> {
    const user = await this._repository.findOneFull(user_id);
    if (user === undefined) throw 'User not found';
    user.name = dto.name;
    user.avatar = dto.avatar;
    await this._repository.save(user);

    return user;
  }

  async addContact(
    user_id: string,
    contact_id: string,
  ): Promise<User | undefined> {
    const user = await this._repository.findOneFull(user_id);
    if (user === undefined) throw 'User not found';

    const newContact = await this._repository.findOneFull(contact_id);
    if (newContact === undefined) throw 'User not found';

    user.contacts = user.contacts || [];
    user.contacts = user.contacts.filter(
      (elm) => elm.id !== contact_id,
    );
    user.contacts.push(newContact);

    await this._repository.save(user);
    return await this.getProfile(user_id);
  }

  async list(): Promise<User[] | undefined> {
    const result = await this._repository.list();
    console.log(result);
    return result;
  }


}
