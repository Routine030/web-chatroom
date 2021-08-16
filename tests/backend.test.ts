import user from '../src/user';
import message,{MsgInfo} from '../src/message';
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
        const messages: Array<MsgInfo[]> = [];
        const msg = new message();
        
        let ret = msg.checkMessage([{user:'Alice',msg:'hello?',to:'all'}]);
        assert.isTrue(ret);

        ret = msg.checkMessage([{user:'Alice',msg:'hello?',to:'error',action:'test'}]);
        assert.isFalse(ret);

        msg.setMessage([{user:'Alice',msg:'hello?',to:'all',action:'say'}], messages);
        expect(messages).to.deep.equal([[{user:'Alice',msg:'hello?',to:'all',action:'say'}]]);
        assert.equal(messages.length, 1);
    
        msg.setMessage([{user:'Bob',msg:'hi',to:'other',action:'Alice'}], messages);
        expect(messages).to.deep.equal([[{user:'Alice',msg:'hello?',to:'all',action:'say'}],[{user:'Bob',msg:'hi',to:'other',action:'Alice'}]]);
        assert.equal(messages.length, 2);
    });
  });