/*
 * Lunachat - sattelite chat based on NuCypher
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {inject, injectable} from 'inversify';
import {TYPES} from '../types';
import {
  ChatsServiceI,
} from '../core/chat';
import {SocketController, socketListeners, SocketPusher, SocketWithToken} from "../core/socket";
import {ChatCreateDTO, DeleteMessageDTO, PostMessageDTO} from "../payloads/chatPayload";

@injectable()
export class ChatsController implements SocketController {
  private _service: ChatsServiceI;
  private _namespace = 'chat';

  constructor(@inject(TYPES.ChatsService) service: ChatsServiceI) {
    this._service = service;
  }

  setPusher(pusher: SocketPusher): void {
    this._service.setPusher(pusher);
  }

  get namespace(): string {
    return this._namespace;
  }

  getListeners(socket: SocketWithToken, userId: string): socketListeners {
    return {
      create: async (dto: ChatCreateDTO, opHash: string) => {
        try {
          const chat = await this._service.create(userId, dto);
          console.log(chat);
          socket.emit(this._namespace + ':updateDetails', chat);
          socket.ok(opHash);
        } catch (e) {
          console.log(e);
          socket.failure(opHash, e);
        }
      },

      retrieve: async (id: string, opHash: string) => {
        try {
          const data = await this._service.findById(userId, id);
          console.log('GOTT', data);
          socket.emit(this._namespace + ':updateDetails', data);
          socket.ok(opHash);
        } catch (e) {
          console.log(e);
          socket.failure(opHash, e);
        }
      },

      postMessage: async (dto: PostMessageDTO, opHash: string) => {
        console.log(dto);

        dto.msg.createdAt = Date.now();
        try {
          socket.emit(this._namespace + ':pendingMessage', {
            id: dto.chatId,
            messages: [dto.msg],
          });

          await this._service.postMessage(userId, dto);
          socket.ok(opHash);
        } catch (e) {
          console.log(e);
          socket.failure(opHash, e);
        }
      },

      deleteMessage: async (dto: DeleteMessageDTO, opHash: string) => {
        console.log(dto);
        try {
          await this._service.deleteMessage(userId, dto);
          socket.ok(opHash);
        } catch (e) {
          console.log(e);
          socket.failure(opHash, e);
        }
      },
    };
  }
}
