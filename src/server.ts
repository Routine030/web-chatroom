import { createServer } from "http";
import { createWebChatroom } from "./app";
import { InMemoryChatRepository } from "./chat_repository"

const server = createServer();

createWebChatroom(
    server,
    {
        chatRepository: new InMemoryChatRepository(),
    },
    {
        cors: {
            origin: ['http://localhost:1234'],
        },
    }
);

server.listen(3000);