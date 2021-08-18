import { Server as HttpServer } from "http";
import { Server as SocketServer, ServerOptions, Socket } from "socket.io";
import { ChatRepository } from "./chat_repository";
import createChatHandlers from "./chat_handler";
import { ClientEvents, ServerEvents } from "./event";

export interface Repository {
    chatRepository: ChatRepository;
}

export function createWebChatroom(
    httpServer: HttpServer,
    repository: Repository,
    serverOptions: Partial<ServerOptions> = {}
): SocketServer<ClientEvents, ServerEvents> {
    const io = new SocketServer(httpServer, serverOptions);

    io.on("connection", (socket: Socket) => {
        const {
            createUser,
            getAllUser,
            postMsg,
            deleteUserSocket,
        } = createChatHandlers(repository, socket, io);

        socket.on("setUsername", createUser);
        socket.on("getAllUser", getAllUser);
        socket.on("postMessage", postMsg);
        socket.on("disconnect", deleteUserSocket);
    });

    return io;
}