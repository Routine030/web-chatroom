import { Repository } from "./app";
import { MsgInfo, UserInfo, UserID, MsgID } from "./chat_repository";
import { v4 as uuid } from "uuid";
import { Response } from "./event";
import { Socket, Server } from "socket.io";

export default function (repository: Repository, socket: Socket, io: Server){
    const { chatRepository } = repository;

    return{
        createUser: async function(
            payload: UserInfo,
            callback: (res: Response<UserID>) => void
        ) {
            const existUser = await chatRepository.existUser(payload.user);
            if (existUser) {
                socket.emit("setFail", false);
                callback({
                    data: 'user already exist',
                });
            } else {
                await chatRepository.saveUser(payload);
                await chatRepository.saveSocket({id: payload.user,socket: socket}); //save u_socket
                socket.emit("setSuccess", true);
                // notify new user for existed user
                socket.broadcast.emit("updateUser", payload.user);
                callback({
                    data: payload.user,
                });
            }
        },

        getAllUser: async function(callback: (res: Response<UserInfo[]>) => void) {
            const ret = await chatRepository.findAllUser();
            if(ret) {
                callback({data: ret});
                socket.emit("getUserList", ret);
            }
        },

        postMsg: async function(
            payload: Omit<MsgInfo, "id">,
            callback: (res: Response<MsgID>) => void
        ) {
            const validate = true; //todo

            if (validate) {
                const { user, to, action, msg} = payload;
                const randomId = uuid();
                const saveMsg: MsgInfo = {...payload, id: randomId};
                //set to DB
                await chatRepository.saveMessage(saveMsg);
                callback({data: randomId});

                //parse for reply
                if (to == 'other' && action) {
                    const DestSocket = await chatRepository.findSocket(action);
                    if (DestSocket){
                        DestSocket.socket.emit('privateTo', {user, msg, action});
                        socket.emit('privateTo', {user, msg, action});
                    }
                } else {
                    io.emit('all', {user, msg});
                }
            }
        },

        deleteUserSocket: async function(
            id: UserID,
        ) {
            const existUser = await chatRepository.existUser(id);

            if (existUser) {
                // delete user info in userPool, userSockets
                await chatRepository.deleteUser(id);
                await chatRepository.deleteSocket(id);
                // notify client
                io.emit('someoneLeave',id);
                io.emit('all',[{user: id,msg: '我已經離線'}]);
            }
        },
    };
}