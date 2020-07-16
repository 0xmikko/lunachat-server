/*
 * Lunachat - sattelite chat based on NuCypher
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {User, UserRepositoryI} from '../core/user';
import {injectable} from 'inversify';
import {TypeORMRepository} from "./typeORMRepository";

@injectable()
export class UserRepository extends TypeORMRepository<User> implements UserRepositoryI {

  constructor() {
    super(User);
  }

  async findOneFull(id: string): Promise<User | undefined> {
    let user = await this.repository.findOne(id, {relations: []});
    if (user === undefined) throw 'User not found!';

    return user;
  }



}
