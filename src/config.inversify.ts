/*
 * Lunachat - sattelite chat based on NuCypher
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {Container} from 'inversify';

// Chats
import {TYPES} from './types';

import {AuthWebController} from './controllers/authWebController';
import {AuthServiceI} from './core/auth';

import {ChatsRepositoryI, ChatsServiceI} from './core/chat';
import {ChatsController} from './controllers/chatsController';
import {ChatsRepository} from './repository/chatsRepository';
import {ChatsService} from './services/chatsService';

import {UserRepositoryI, UserServiceI} from './core/user';
import {UserRepository} from './repository/userRepository';
import {UserService} from './services/userService';
import {UserController} from './controllers/userController';

import {AuthService} from './services/authService';
import {AuthController} from './controllers/authController';

import {MessagesRepositoryI} from './core/message';
import {MessagesRepository} from './repository/messagesRepository';
import {AmpqController} from './controllers/ampqController';

let container = new Container();

// CHATS
container
  .bind<ChatsRepositoryI>(TYPES.ChatsRepository)
  .to(ChatsRepository)
  .inSingletonScope();
container
  .bind<MessagesRepositoryI>(TYPES.MessagesRepository)
  .to(MessagesRepository)
  .inSingletonScope();
container
  .bind<ChatsServiceI>(TYPES.ChatsService)
  .to(ChatsService)
  .inSingletonScope();
container.bind<ChatsController>(TYPES.ChatsController).to(ChatsController);

// PROFILES
container
  .bind<UserRepositoryI>(TYPES.UserRepository)
  .to(UserRepository)
  .inSingletonScope();
container
  .bind<UserServiceI>(TYPES.UserService)
  .to(UserService)
  .inSingletonScope();
container.bind<UserController>(TYPES.UserController).to(UserController);

// USERS
container.bind<AuthServiceI>(TYPES.AuthService).to(AuthService);
container.bind<AuthController>(TYPES.AuthController).to(AuthController);

container
  .bind<AuthWebController>(TYPES.AuthWebController)
  .to(AuthWebController)
  .inSingletonScope();

container
  .bind<AmpqController>(TYPES.AmpqController)
  .to(AmpqController)
  .inSingletonScope();

export default container;
