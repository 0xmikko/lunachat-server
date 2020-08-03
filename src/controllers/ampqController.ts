/*
 * Lunachat - sattelite chat based on NuCypher
 * Copyright (c) 2020. Mikhail Lazarev
 */

import config from '../config';
import * as Amqp from 'amqp-ts';
import {AmpqUserControllerI, User, UserServiceI} from '../core/user';
import {inject, injectable} from 'inversify';
import {TYPES} from '../types';
import {AmpqChatControllerI, Chat, ChatsServiceI} from '../core/chat';
import {ChatCreateDTO, PostMessageDTO} from '../payloads/chatPayload';
import {ProfileUpdateDTO} from '../payloads/profilePayload';
import axios from 'axios';
import {Message} from "../core/message";
import {CreateDateColumn} from "typeorm/index";

@injectable()
export class AmpqController
  implements AmpqUserControllerI, AmpqChatControllerI {
  private conn: Amqp.Connection;
  private readonly usersExchange: Amqp.Exchange;
  private usersQueue: Amqp.Queue;
  private _userService: UserServiceI;
  private _chatService: ChatsServiceI;
  private _chatExchanges: Map<string, Amqp.Exchange> = new Map<
    string,
    Amqp.Exchange
  >();

  constructor(
    @inject(TYPES.UserService) userService: UserServiceI,
    @inject(TYPES.ChatsService) chatService: ChatsServiceI,
  ) {
    this.conn = new Amqp.Connection(config.ampq_url);
    this.usersExchange = this.conn.declareExchange('LunachatUsers', 'fanout');

    // Setting up queues
    this.usersQueue = this.conn.declareQueue(Date.now().toString());
    this.usersQueue.bind(this.usersExchange);
    if (!this.usersQueue._consumerInitialized) {
      this.usersQueue.activateConsumer(async (message) => {
        console.log('Message received: ' + message.getContent());
        await this.getNewUserInfo(message.getContent());
      });
      console.log('CONNECTED TO USEREXCHANGE!!!');
    }

    // Setting default services
    this._userService = userService;
    this._chatService = chatService;

    // Setting delegates
    userService.ampqControllerDelegate = this;
    chatService.ampqControllerDelegate = this;

    console.log('AMPQ Controller started');
  }

  async sendMessage(user: User, dto: PostMessageDTO): Promise<void> {

    const msg : PostMessageDTO= {
      from: dto.from,
      chatId: dto.chatId,
      msg: {
        id: dto.msg.id,
        text: dto.msg.text,
        createdAt: dto.msg.createdAt,
        //@ts-ignore
        chat: {
          id: dto.chatId
        },
        //@ts-ignore
        user: {
          id: user.id,
        }
      }
    }
    const q = this.addExchange(user.id);



    const reader = JSON.parse(user.reader)

    const responseGr = await axios.post(config.nucypher_url + "/grant", reader)
    console.log(responseGr.data)


    const response = await axios.post(config.nucypher_url + "/encrypt", {"data": msg.msg.text})
    msg.msg.text =  response.data

    let message = new Amqp.Message('MSG_' + JSON.stringify(msg));
    console.log('Sending msg to userId', user.id);
    console.log("READDER", user.reader)
    console.log("Q", q)
    q.send(message);
  }

  public async informNewUser(user: ProfileUpdateDTO) {
    let msg = new Amqp.Message(JSON.stringify(user));
    if (user.id === undefined) throw new Error("No user id on update!")
    console.log('SENDING USER UPADTE!!!@!@');
    this.usersExchange.send(msg);
    const exchangeName = user.id.split("-").join("")
    console.log(exchangeName)

    const chatExchange = this.addExchange(exchangeName);
    const messagesQueue = this.conn.declareQueue("Messages");
    await messagesQueue.bind(chatExchange);

    try {
      await messagesQueue.activateConsumer(async (message) => {
        console.log('Message received: ' + message.getContent());
        try {
          await this.getNewMessage(message.getContent());
        } catch (e) {
          console.log("CONSUMER Error", e)
        }
      });
      console.log("LISTEN", user.id)
    } catch (e) {
      console.log(e)
    }
    chatExchange.send(new Amqp.Message("JIOOO"))
    console.log(chatExchange)

  }

  private async getNewUserInfo(msg: string) {
    const user: ProfileUpdateDTO = JSON.parse(msg);
    console.log('NEW USER INFO', user);
    if (user.id === undefined) throw 'Incorect update';
    await this._userService.updateProfile(user.id, user, false);
  }

  private async getNewMessage(msg: string) {

    const cend = msg.indexOf("_");
    const command = msg.substr(0, cend)
    const json = msg.substr(cend+1)
    switch (command) {
      case 'MSG':
        console.log(json)
        const message: PostMessageDTO = JSON.parse(json);

        const response = await axios.post(config.nucypher_url + "/decrypt", {"data": message.msg.text})
          console.log(response)
        message.msg.text =  response.data

        if (message.from === undefined) {
          throw new Error('Has no sender!');
        }
        await this._chatService.postMessage(message.from, message, false);
        break;
      case 'NEWCHAT':
        const dto: ChatCreateDTO = JSON.parse(json);
        await this._chatService.create(dto.members[0], dto, false);
        break;
    }
  }

  private addExchange(userId: string): Amqp.Exchange {
    userId = userId.split("-").join("")
    const q = this._chatExchanges.get(userId);
    if (q !== undefined) return q;
    const chatExchange = this.conn.declareExchange(userId);
    return chatExchange;
  }

  createChat(receiverId: string, chat: ChatCreateDTO): void {
    const q = this.addExchange(receiverId);

    console.log('Sending chat_create to userId', receiverId, chat);
    let message = new Amqp.Message('NEWCHAT_' + JSON.stringify(chat));
    q.send(message);
  }
}
