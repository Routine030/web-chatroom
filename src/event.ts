import { MsgInfo, UserInfo, UserID, MsgID } from "./chat_repository";

interface Error {
    error: string;
    errorDetails?: string[];
}

interface Success<T> {
    data: T;
}

export type Response<T> = Error | Success<T>;

export interface ServerEvents {
    "setFail": (ret: Boolean) => void;
    "setSuccess": (ret: Boolean) => void;
    "updateUser": (user: Pick<UserInfo, "user">) => void;
    "someoneLeave": (id: UserID) => void;
    "all": (msg: Pick<MsgInfo, "user"|"msg">) => void;
    "privateTo": (msg: Pick<MsgInfo, "user"|"msg"|"action">) => void;
    "getUserList": (users:UserInfo[]) => void;
}

export interface ClientEvents {
    "setUsername": (
        payload: UserInfo,
        callback: (res: Response<UserID>) => void 
    ) => void;

    "postMessage": (
        payload: Omit<MsgInfo,"id">,
        callback: (res: Response<MsgID>) => void
    ) => void;

    "getAllUser": (callback: (res: Response<UserInfo[]>) => void) => void;

    "disconnect": (id: UserID) => void;  
}