/*
 * Lunachat - sattelite chat based on NuCypher
 * Copyright (c) 2020. Mikhail Lazarev
 */

export interface BasicRepositoryI<T> {

    insert(newItem: T) : Promise<string | undefined>
    findOne(id : string) : Promise<T | undefined>
    list() : Promise<T[] | undefined>
    save(item: T) : Promise<T>
}
