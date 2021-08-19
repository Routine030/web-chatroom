import { Socket } from 'socket.io';

abstract class ARepository<T, U, V> {
    abstract saveMessage(entity: T): Promise<void>;
    abstract findMessage(id: MsgID): Promise<MsgInfo>;
    abstract findAllUser(): Promise<U[]>;
    abstract saveUser(entity: U): Promise<void>;
    abstract existUser(id: UserID): Promise<boolean>;
    abstract findUser(id: UserID): Promise<U>;
    abstract deleteUser(id: UserID): Promise<void>;
    abstract saveSocket(entity: V): Promise<void>;
    abstract findSocket(id: SocketID): Promise<V>;
    abstract findSocketID(socket: Socket): Promise<string>;
    abstract deleteSocket(id: SocketID): Promise<void>;
  }

export type MsgID = string;
export type UserID = string;
export type SocketID = string;

export interface MsgInfo {
    id: MsgID;
    user: string;
    msg: string;
    to: string; // forall|other
    action?: string; //other username
}

export interface UserInfo {
    user: UserID;
}

export interface SocketInfo{
    id: SocketID;
    socket: Socket;
}

export abstract class ChatRepository extends ARepository<MsgInfo, UserInfo, SocketInfo> {}

export class InMemoryChatRepository extends ChatRepository {
    private readonly msgs: Map<MsgID , MsgInfo> = new Map();
    private readonly users: Map<UserID , UserInfo> = new Map();
    private readonly sockets: Map<SocketID , SocketInfo> = new Map();

    saveMessage(entity: MsgInfo): Promise<void> {
        this.msgs.set(entity.id, entity);

        return Promise.resolve();
    }

    findMessage(id: MsgID): Promise<MsgInfo> {
        if (this.msgs.has(id)) {
            return Promise.resolve(this.msgs.get(id)!);
        } else {
            return Promise.reject();
        }
    }

    findAllUser(): Promise<UserInfo[]> {
        const users = Array.from(this.users.values());

        return Promise.resolve(users);
    }

    saveUser(entity: UserInfo): Promise<void> {
        this.users.set(entity.user, entity);

        return Promise.resolve();
    }

    existUser(id: UserID): Promise<boolean> {
        if (this.users.has(id)) {
            return Promise.resolve(true);
        } else {
            return Promise.resolve(false);
        }
    }

    findUser(id: UserID): Promise<UserInfo> {
        if (this.users.has(id)) {
            return Promise.resolve(this.users.get(id)!);
        } else {
            return Promise.reject();
        }        
    }

    deleteUser(id: UserID): Promise<void> {
        const deleted = this.users.delete(id);
        if (deleted) {
            return Promise.resolve();
        } else {
            return Promise.reject();
        }
    }

    saveSocket(entity: SocketInfo): Promise<void> {
        this.sockets.set(entity.id, entity);

        return Promise.resolve();
    }

    findSocket(key: SocketID): Promise<SocketInfo> {
        if (this.sockets.has(key)) {
            return Promise.resolve(this.sockets.get(key)!);
        } else {
            return Promise.reject();
        }
    }

    findSocketID(socket: Socket): Promise<string> {
        const existSocket = [...this.sockets.values()].filter(value => value.socket == socket);

        if(existSocket.length){
            return Promise.resolve(existSocket[0].id);
        } else {
            return Promise.reject();            
        }
    }

    deleteSocket(id: SocketID): Promise<void> {
        const deleted = this.sockets.delete(id);

        if (deleted) {
            return Promise.resolve();
        } else {
            return Promise.reject();
        }
    }
}