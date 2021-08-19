import { createWebChatroom } from '../src/app';
import { createServer, Server } from 'http';
import { InMemoryChatRepository, ChatRepository} from '../src/chat_repository';
import { AddressInfo } from 'net';
import { io, Socket } from 'socket.io-client';
import { ClientEvents, ServerEvents } from '../src/event';
import { expect, assert } from 'chai';

const createPartialDone = (count: number, done: () => void) => {
    let i = 0;

    return () => {
        if (++i === count) {
            done();
        }
    };
};

describe('test server', () => {
    let httpServer: Server,
    socket: Socket<ServerEvents, ClientEvents>,
    otherSocket: Socket<ServerEvents, ClientEvents>,
    chatRepository: ChatRepository;

    beforeEach((done) => {
        const partialDone = createPartialDone(2, done);

        httpServer = createServer();
        chatRepository = new InMemoryChatRepository();

        createWebChatroom(httpServer, {
            chatRepository,
        });

        httpServer.listen(() => {
            const port = (httpServer.address() as AddressInfo).port;
            socket = io(`http://localhost:${port}`);
            socket.on('connect', partialDone);

            otherSocket = io(`http://localhost:${port}`);
            otherSocket.on('connect', partialDone);

        });
    });

    afterEach(() => {
        httpServer.close();
        socket.disconnect();
        otherSocket.disconnect();
    });

    describe('user login', () => {
        it('user not exist, should return ok', (done) => {
            const partialDone = createPartialDone(3, done);
            
            socket.emit('setUsername', { user: 'user1' }, async (res) => {
                if ('error' in res) {
                    return done(new Error('should not happen'));
                }
                const storedUser = await chatRepository.findUser(res.data);
                const storedSocket = await chatRepository.findSocket(res.data);

                assert.equal(res.data, 'user1');
                assert.equal(storedUser.user, 'user1');
                assert.equal(storedSocket.id, 'user1');
                partialDone();
            });

            socket.on('setSuccess', (ret) => {
                assert.isTrue(ret);
                partialDone();
            });

            otherSocket.on('updateUser', (ret) => {
                expect(ret).to.be.a('string');
                partialDone();
            });
        });

        it('user exist, should return fail', (done) => {
            const partialDone = createPartialDone(2, done);

            chatRepository.saveUser({ user: 'user1' });
            socket.emit('setUsername', { user: 'user1' }, async (res) => {
                if ('error' in res) {
                    return done(new Error('should not happen'));
                }
                assert.equal(res.data, 'user already exist');
                partialDone();}
            );

            socket.on('setFail', (ret) => {
                assert.isFalse(ret);
                partialDone();
            });
        });
    });

    describe('get all of users', () => {
        it('should return userlist', (done) => {
            const partialDone = createPartialDone(2, done);

            chatRepository.saveUser({ user: 'user1' });
            chatRepository.saveUser({ user: 'user2' });
    
            socket.emit('getAllUser', (res) => {
                if ('error' in res) {
                    return done(new Error('should not happen'));
                }
                expect(res.data).to.eql([
                    { user: 'user1' },
                    { user: 'user2' },
                ]);
                partialDone();
            });

            socket.on('getUserList', (ret) => {
                expect(ret).to.eql([
                    { user: 'user1' },
                    { user: 'user2' },
                ]);
                partialDone();
            });
        });
    });

    describe('post message', () => {
        it('test post message(public)', (done) => {
            const partialDone = createPartialDone(3, done);

            socket.emit('postMessage', {
                user: 'user1',
                msg: 'test post message',
                to: 'forall',
            }, async (res) => {
                if ('error' in res) {
                    return done(new Error('should not happen'));
                }
                const storedEntity = await chatRepository.findMessage(res.data); 

                expect(res.data).to.be.a('string');
                expect(storedEntity).to.eql({
                    id: res.data,
                    user: 'user1',
                    msg: 'test post message',
                    to: 'forall',
                });
                partialDone();
            });

            socket.on('all', (ret) => {
                assert.equal(ret.user, 'user1');
                assert.equal(ret.msg, 'test post message');
                partialDone();
            });

            otherSocket.on('all', (ret) => {
                assert.equal(ret.user, 'user1');
                assert.equal(ret.msg, 'test post message');
                partialDone();
            });
        })

        it('test post message(private)', (done) => {
            const partialDone = createPartialDone(4, done);
            // mock user2, using async func avoid race condition
            otherSocket.emit('setUsername', { user: 'user2' }, async (res) => {
                socket.emit('postMessage', {
                    user: 'user1',
                    msg: 'private message',
                    to: 'other',
                    action: 'user2'
                }, async (res) => {
                    if ('error' in res) {
                        return done(new Error('should not happen'));
                    }
                    const storedMsg = await chatRepository.findMessage(res.data); 

                    expect(res.data).to.be.a('string');
                    expect(storedMsg).to.eql({
                        id: res.data,
                        user: 'user1',
                        msg: 'private message',
                        to: 'other',
                        action: 'user2'
                    });
                    partialDone();
                });
                partialDone();
            });

            socket.on('privateTo', (ret) => {
                assert.equal(ret.user, 'user1');
                assert.equal(ret.msg, 'private message');
                assert.equal(ret.action, 'user2');
                partialDone();
            });

            otherSocket.on('privateTo', (ret) => {
                assert.equal(ret.user, 'user1');
                assert.equal(ret.msg, 'private message');
                assert.equal(ret.action, 'user2');
                partialDone();
            });
        })
    });

    describe('user disconnection', () =>{
        it('should be ok', async () => {
            // mock user1 disconnect
            await socket.emit('setUsername', { user: 'user1' }, async (res) => {
                socket.emit('disconnect')
    
                await otherSocket.on('someoneLeave', (id) => {
                    assert.equal(id, 'user1');
                })
    
                await otherSocket.on('all', (ret) => {
                    assert.equal(ret.user, 'user1');
                    assert.equal(ret.msg, '我已經離線');
                });
            });
        })
    })
});
