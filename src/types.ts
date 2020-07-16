/*
 * Lunachat - sattelite chat based on NuCypher
 * Copyright (c) 2020. Mikhail Lazarev
 */

// TYPES
export const TYPES = {
  // CHATS
  ChatsController: Symbol.for('ChatsController'),
  ChatsRepository: Symbol.for('ChatsRepository'),
  ChatsService: Symbol.for('ChatsService'),
  MessagesRepository: Symbol.for('MessagesRepository'),

  // USERS
  UserController: Symbol.for('UserController'),
  UserRepository: Symbol.for('UserRepository'),
  UserService: Symbol.for('UserService'),

  AuthController: Symbol.for('AuthController'),
  AuthService: Symbol.for('AuthService'),
  AuthWebController: Symbol.for('AuthWebController'),
};
