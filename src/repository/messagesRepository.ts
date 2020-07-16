/*
 * Lunachat - sattelite chat based on NuCypher
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {inject, injectable} from 'inversify';
import {Message, MessagesRepositoryI} from '../core/message';
import {TypeORMRepository} from './typeORMRepository';
import {ChatsRepositoryI} from '../core/chat';
import {TYPES} from '../types';

@injectable()
export class MessagesRepository extends TypeORMRepository<Message>
  implements MessagesRepositoryI {
  private _chatRepository: ChatsRepositoryI;

  constructor(@inject(TYPES.ChatsRepository) repository: ChatsRepositoryI) {
    super(Message);
    this._chatRepository = repository;
  }

  async addMessage(
    chatId: string,
    message: Message,
  ): Promise<Message | undefined> {
    const chat = await this._chatRepository.findByIdFull(chatId);
    if (chat === undefined) throw new Error('Chat not found');
    message.chat = chat;
    return await this.save(message);
  }

  // async deleteMessage(
  //   messageId: string,
  // ): Promise<Message[] | undefined> {
  //   const messages = (await this.list(chatId)) || [];
  //   const bluAPI = new BluzelleHelper<Message>(chatId);
  //   const newId = await bluAPI.delete(messageId);
  //   return messages.filter((msg) => msg.id !== messageId);
  // }

  // encrypt(text: string) {
  //   const cipher = crypto.createCipheriv(this.ALGORITHM, this._key, this._iv);
  //
  //   return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
  // }
  //
  // decrypt(text: string) {
  //   const decipher = crypto.createDecipheriv(
  //     this.ALGORITHM,
  //     this._key,
  //     this._iv,
  //   );
  //
  //   return decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
  // }
  //
  // decryptMessages(msgs: Message[]): Message[] {
  //   console.log(msgs);
  //   return msgs.map((msg) => {
  //     try {
  //       msg.text = this.decrypt(msg.text);
  //     } catch (e) {
  //       msg.text = 'Unable to decrypt: ' + msg.text;
  //     }
  //
  //     return msg;
  //   });
  // }
}
