/*
 * Lunachat - sattelite chat based on NuCypher
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {TokenPair} from "../payloads/userPayload";


export interface AuthServiceI {
  sendCode(phone: string): Promise<boolean>;
  login(phone: string, code: string): Promise<TokenPair>;
  refresh(refreshToken: string): TokenPair;
  authorizeWeb(userId: string, code: string) : void;
}
