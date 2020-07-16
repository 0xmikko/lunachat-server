
/*
 * Lunachat - sattelite chat based on NuCypher
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {inject, injectable} from 'inversify';
import { Request, Response } from "express";
import {TYPES} from '../types';
import Ajv, { ValidateFunction } from "ajv";
import {
  AuthServiceI,
} from '../core/auth';
import {RequestWithUser} from "./types";
import {
    AuthorizeWebDTO,
    authorizeWebDTOSchema, LoginDTO,
    loginDTOSchema,
    refreshDTO,
    refreshDTOSchema, sendCodeDTOSchema, UserSendCodeDTO
} from "../payloads/userPayload";


@injectable()
export class AuthController  {
  private _service: AuthServiceI;
  private readonly _sendCodeDTOValidate: ValidateFunction;
  private readonly _loginDTOValidate: ValidateFunction;
  private readonly _refreshDTOValidate: ValidateFunction;
  private readonly  _authorizeWebDTOSchema : ValidateFunction;

  constructor(@inject(TYPES.AuthService) service: AuthServiceI) {
    this._service = service;
    this._sendCodeDTOValidate = new Ajv().compile(sendCodeDTOSchema);
    this._loginDTOValidate = new Ajv().compile(loginDTOSchema);
    this._refreshDTOValidate = new Ajv().compile(refreshDTOSchema);
    this._authorizeWebDTOSchema = new Ajv().compile(authorizeWebDTOSchema);
  }

  sendCode() {
    return async (req: Request, res: Response) => {
      const dto: UserSendCodeDTO = {
        phone: req.body.phone,
      };

      if (!this._sendCodeDTOValidate(dto)) {
        console.log("Incorrect request", dto);
        return res.status(400).send("Incorrect request");
      }

      console.log(dto);

      try {
        const result = await this._service.sendCode(dto.phone);
        console.log(result);
        res.status(200).json(result);
      } catch (e) {
        console.log(e);
        res.status(400).send(e);
      }
    };
  }

  login() {
    return async (req: Request, res: Response) => {
      const dto: LoginDTO = {
        phone: req.body.phone,
        code: req.body.code,
      };

      if (!this._loginDTOValidate(dto)) {
        console.log("Incorrect request", dto);
        return res.status(400).send("Incorrect request");
      }

      console.log(dto);

      try {
        const result = await this._service.login(dto.phone, dto.code);
        console.log(result);
        res.status(200).json(result);
      } catch (e) {
        console.log(e);
        res.status(400).send(e);
      }
    };
  }

  refresh() {
    return async (req: Request, res: Response) => {
      const dto: refreshDTO = {
        refresh: req.body.refresh,
      };

      if (!this._refreshDTOValidate(dto)) {
        console.log("Incorrect request", dto);
        return res.status(400).send("Incorrect request");
      }

      try {
        const result = await this._service.refresh(dto.refresh);
        console.log(result);
        res.status(200).json(result);
      } catch (e) {
        console.log(e);
        res.status(400).send(e);
      }
    };
  }

  authorize_web() {
    return async (req: RequestWithUser, res: Response) => {

      const user_id = req.user?.user_id
      if (user_id === undefined) {
        console.log("No user ID");
        return res.status(400).send("Incorrect request");
      }

      const dto: AuthorizeWebDTO = {
        code: req.body.code,
      };



      if (!this._authorizeWebDTOSchema(dto)) {
        console.log("Incorrect request", dto);
        return res.status(400).send("Incorrect request");
      }

      console.log(dto);

      try {
        const result = await this._service.authorizeWeb(user_id, dto.code);
        console.log(result);
        res.status(200).json(result);
      } catch (e) {
        console.log(e);
        res.status(400).send(e);
      }
    };
  }

}
