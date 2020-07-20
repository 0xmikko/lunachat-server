/*
 * Lunachat - sattelite chat based on NuCypher
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {Chat, ChatsRepositoryI} from '../core/chat';
import {injectable} from 'inversify';
import {TypeORMRepository} from './typeORMRepository';

@injectable()
export class ChatsRepository extends TypeORMRepository<Chat>
  implements ChatsRepositoryI {
  constructor() {
    super(Chat);
  }

  findByIdFull(id: string): Promise<Chat | undefined> {
    return this.repository.findOne({where: {id}, relations: ['members', 'messages', 'messages.user']});
  }

  async update(user_id: string, newChat: Chat): Promise<void> {
    await this.repository.save(newChat);
  }

  async create(newChat: Chat): Promise<Chat | undefined> {
    return await this.repository.save(newChat);
  }
}
