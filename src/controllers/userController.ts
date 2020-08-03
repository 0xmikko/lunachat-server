/*
 * Lunachat - sattelite chat based on NuCypher
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {UserServiceI} from '../core/user';
import {inject, injectable} from 'inversify';
import {TYPES} from '../types';
import {SocketUpdate} from '../core/operations';
import {
  SocketController,
  socketListeners,
  SocketPusher,
  SocketWithToken,
} from '../core/socket';
import {ProfileContactDTO, ProfileUpdateDTO} from '../payloads/profilePayload';

@injectable()
export class UserController implements SocketController {
  private _service: UserServiceI;
  private _namespace = 'profile';

  constructor(@inject(TYPES.UserService) service: UserServiceI) {
    console.log('Profiles controller started');
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
      list: async (data: string, opHash: string) => {
        try {
          const result = await this._service.list();
          socket.emit(this._namespace + ':updateList', result);

          socket.ok(opHash);
        } catch (e) {
          console.log(e);
          socket.failure(opHash, e);
        }
      },

      retrieve: async (data: string, opHash: string) => {
        try {
          const result = await this._service.getProfile(userId);
          console.log(result);
          socket.emit(this._namespace + ':updateDetails', result);
          socket.ok(opHash);
        } catch (e) {
          console.log(e);
          socket.failure(opHash, e);
        }
      },

      update: async (dto: ProfileUpdateDTO, opHash: string) => {
        const dtoCut : ProfileUpdateDTO = {
          name: dto.name,
          avatar: dto.avatar,
        }
        try {
          const result = await this._service.updateProfile(userId, dtoCut);
          socket.emit(this._namespace + ':updateDetails', result);
          socket.ok(opHash);
        } catch (e) {
          console.log(e);
          socket.failure(opHash, e);
        }
      },

      new_contact: async (dto: ProfileContactDTO, opHash: string) => {
        console.log(dto);
        try {
          const result = await this._service.addContact(userId, dto.id);
          socket.emit(this._namespace + ':updateDetails', result);
          socket.ok(opHash);
        } catch (e) {
          console.log(e);
          socket.failure(opHash, e);
        }
      },
    };
  }
}
