/*
 * Lunachat - sattelite chat based on NuCypher
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {Chat, ChatsRepositoryI, ChatsServiceI} from '../core/chat';
import {inject, injectable} from 'inversify';
import {TYPES} from '../types';
import {Message, MessagesRepositoryI} from '../core/message';
import {User, UserRepositoryI, UserServiceI} from '../core/user';
import {SocketPusher} from '../core/socket';
import {
  ChatCreateDTO,
  DeleteMessageDTO,
  PostMessageDTO,
} from '../payloads/chatPayload';

@injectable()
export class ChatsService implements ChatsServiceI {
  private _repository: ChatsRepositoryI;
  private _messagesRepository: MessagesRepositoryI;
  private _profilesRepository: UserRepositoryI;
  private _profilesService: UserServiceI;
  private _pusher: SocketPusher;

  public constructor(
    @inject(TYPES.ChatsRepository) repository: ChatsRepositoryI,
    @inject(TYPES.UserRepository) profilesRepository: UserRepositoryI,
    @inject(TYPES.UserService) profilesService: UserServiceI,
    @inject(TYPES.MessagesRepository) messagesRepository: MessagesRepositoryI,
  ) {
    this._repository = repository;
    this._messagesRepository = messagesRepository;
    this._profilesRepository = profilesRepository;
    this._profilesService = profilesService;
  }

  setPusher(pusher: SocketPusher): void {
    this._pusher = pusher;
  }

  async findById(user_id: string, chat_id: string): Promise<Chat> {
    const chat = await this._repository.findByIdFull(chat_id);
    if (!chat) throw 'Chat not found';
    return chat;
  }

  async postMessage(user_id: string, dto: PostMessageDTO): Promise<void> {
    const chat = await this._repository.findByIdFull(dto.chatId);
    if (!chat) throw 'Chat not found';

    if (!this.isUserInChat(user_id, chat))
      throw 'User is not member of this chat';

    await this._messagesRepository.addMessage(dto.chatId, dto.msg);

    for (let member of chat.members) {
      this._pusher.pushUpdateQueue({
        userId: member.id,
        event: 'chat:updateDetails',
        handler: async () => await this.findById(member.id, dto.chatId),
      });
    }
  }

  async deleteMessage(user_id: string, dto: DeleteMessageDTO): Promise<void> {
    // const chat = await this._repository.findByIdFull(dto.chatId);
    // if (!chat) throw 'Chat not found';
    //
    // if (!this.isUserInChat(user_id, chat)) throw 'User is not member of this chat';
    //
    // const message = await this._messagesRepository.findById(
    //   dto.chatId,
    //   dto.msgId,
    // );
    // if (message === undefined) throw 'Message not found';
    //
    // if (message.userId !== user_id)
    //   throw 'Only owners could delete their messages';
    //
    // // Delete message
    // await this._messagesRepository.deleteMessage(dto.chatId, dto.msgId);
    //
    // // Sending updates all chat members
    // for (let memberId of chat.members) {
    //   this._pusher.pushUpdateQueue({
    //     userId: memberId,
    //     event: 'chat:updateDetails',
    //     handler: async () => this.findById(memberId, dto.chatId),
    //   });
    // }
  }

  async create(user_id: string, dto: ChatCreateDTO): Promise<Chat | undefined> {
    console.log(dto)
    if (
      dto.members.length < 2 ||
      (dto.members[0] !== user_id && dto.members[1] !== user_id)
    ) {
      throw 'UserID not found in chat members!';
    }

    const members: Array<User> = [];

    // Get members profiles
    for (let memId = 0; memId < dto.members.length; memId++) {
      const currentMember = await this._profilesRepository.findOne(
        dto.members[memId],
      );
      if (currentMember === undefined) {
        throw 'Members not found';
      }
      members.push(currentMember);
    }

    // Creating and storing chat
    const newChat: Chat = {
      id: dto.id,
      name: `${members[0]?.name} with ${members[1]?.name}`,
      members: members,
      messages: [],
    };

    return await this._repository.create(newChat);
  }

  private isUserInChat(userId: string, chat: Chat): boolean {
    for (let member of chat.members) {
      if (member.id === userId) return true;
    }
    return false;
  }
}
