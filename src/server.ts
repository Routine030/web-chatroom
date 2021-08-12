import { Socket } from "dgram";
import {Application, Request, Response} from "express";
import user from './user';
import message from './message';
const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app: Application = express();

const server = http.createServer(app);
server.listen(3000);

//use socket
const io = socketio(server,{ 
    cors: {
        origins: ['http://localhost:3000']
    }
});

console.log("server socket 3000");
const userPool: string[] = [];
const messagePool: Array<string[]> = [];

io.on('connection', (socket: Socket) => {
//     console.log("user connected")
    socket.on("setUsername", (name: string) => {
        const users = new user();
        const ret = users.setUser(name,userPool);
        if(ret) {
            socket.emit('setSuccess', name);
        } else {
            socket.emit('setFail', name);
        }
    })

    socket.on("postMessage", (msg: string[]) => {
        const messages = new message();
        const check = messages.checkMessage(msg);
        if(check) {
            messages.setMessage(msg,messagePool);
            const reply = messages.broadcastMessage(msg);
            io.emit('forAll',reply)
        }
    })

    socket.on("sayHi", (msg: string) => {
        console.log(msg)
        io.emit('toUser','hello')
    })
});