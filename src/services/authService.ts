/*
 * Lunachat - sattelite chat based on NuCypher
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {AuthServiceI} from '../core/auth';
import {inject, injectable} from 'inversify';
import NodeCache from 'node-cache';

import config from '../config';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import {TYPES} from '../types';
import {AuthWebController} from '../controllers/authWebController';
import {User, UserServiceI} from '../core/user';
import {tokenData, TokenPair} from "../payloads/userPayload";

@injectable()
export class AuthService implements AuthServiceI {
  private _cache: NodeCache;
  private _webAuthController: AuthWebController;
  private _profileService: UserServiceI;
  // @ts-ignore
  private _tsClient: any;
  private _jwtSecret: string;
  private _from: string;
  private _send_to_debug: boolean;
  private _debug_phone: string;
  private _magic_phone: string;
  private _magic_code: string;

  public constructor(
    @inject(TYPES.AuthWebController)
    webAuthController: AuthWebController,
    @inject(TYPES.UserService) profilesService: UserServiceI,
  ) {
    this._cache = new NodeCache({deleteOnExpire: true, stdTTL: 120});
    this._webAuthController = webAuthController;
    this._profileService = profilesService;
    this._tsClient = require('twilio')(config.twillio_sid, config.twillio_key);
    this._jwtSecret = config.jwt_secret;
    this._from = config.twillio_from;
    this._send_to_debug = config.send_to_debug;
    this._debug_phone = config.debug_phone;

  }

  sendCode(phone: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {

      const length = 5;
      const possible = '0123456789';
      let code = '';
      for (let i = 0; i < length; i++) {
        code += possible.charAt(Math.floor(Math.random() * possible.length));
      }

      const phoneNumber = this._send_to_debug ? this._debug_phone : phone;
      const message = `Your code is ${code}`;
      await this._tsClient.messages.create({
        body: message,
        from: this._from,
        to: phoneNumber,
      });
      console.log(message)
      this._cache.set(phone, code);
      resolve(true);
    });
  }

  login(phone: string, code: string): Promise<TokenPair> {
    return new Promise<TokenPair>(async (resolve, reject) => {
      const savedCode = this._cache.get(phone);
      console.log(this._cache.get(phone), code);

      if (phone !== this._magic_phone && code !== this._magic_code) {
        if (savedCode === undefined || code !== savedCode) reject('Wrong code');
      }
      const user_id = this.getHash(phone);
      console.log(`Logged in ${phone} with id ${user_id}`);
      let user : User | undefined
      try {
        user = await this._profileService.getProfile(user_id);
      } catch (e) {
        user = await this._profileService.createProfile(user_id);
      }
      if (user === undefined) throw new Error("Cant create user")
      resolve(this.generateTokenPair(user.id));
    });
  }

  refresh(refreshToken: string): TokenPair {
    try {
      const data: tokenData = jwt.verify(
        refreshToken,
        config.jwt_secret,
      ) as tokenData;
      if (Date.now() > data.exp * 1000) throw 'Expired token';
      return this.generateTokenPair(data.user_id);
    } catch (e) {
      console.log(e);
      throw 'Token error';
    }
  }

  authorizeWeb(userId: string, code: string) {
    this._webAuthController.sendAuth(code, this.generateTokenPair(userId));
  }

  private getHash(phone: string): string {
    return crypto
      .createHash('md5')
      .update(phone + config.jwt_secret)
      .digest('hex');
  }

  private generateTokenPair(user_id: string): TokenPair {
    const HOUR = 3600; // Hour in seconds

    const accessExp = Date.now() / 1000 + 30 * 24 * HOUR;
    const accessData: tokenData = {user_id, exp: accessExp};
    const access = jwt.sign(accessData, this._jwtSecret);

    const refreshExp = Date.now() / 1000 + 30 * 24 * HOUR;
    const refreshData: tokenData = {user_id, exp: refreshExp};
    const refresh = jwt.sign(refreshData, this._jwtSecret);
    return {
      access,
      refresh,
    };
  }
}
