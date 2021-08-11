import user from '../src/user';
import message from '../src/message';
const assert = require("chai").assert;
const expect = require("chai").expect;

describe('test backend', function() {
    it("test set/get username function", () => {
        let arr: string[]=[];
        const users = new user();

        let exist = users.isUser('user1', arr);
        assert.isFalse(exist);

        let ret = users.setUser('user1', arr);
        exist = users.isUser('user1', arr);
        assert.isTrue(ret);
        assert.isTrue(exist);

        ret = users.setUser('user1', arr);
        assert.isFalse(ret);

        users.setUser('user2', arr);
        expect(arr).to.deep.equal(['user1','user2']);
    });

    it("test set/reply message function", () => {
        const messages: Array<string[]> = [];
        const msg = new message();
        
        let ret = msg.checkMessage(['Alice','hello?']);
        assert.isTrue(ret);

        ret = msg.checkMessage(['Alice']);
        assert.isFalse(ret);

        msg.setMessage(['Alice','hello?'], messages);
        expect(messages).to.deep.equal([['Alice','hello?']]);
        msg.setMessage(['Bob','hi'], messages);
        expect(messages).to.deep.equal([['Alice','hello?'],['Bob','hi']]);

        const reply = msg.broadcastMessage(['Bob','hi']);
        assert.equal(reply, 'Bob say: hi');
    });
  });