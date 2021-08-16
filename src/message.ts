/*
MsgInfo [{user,msg,to,action}]
forAll: user,msg,all,X
other: user,msg,other,username
*/
export interface MsgInfo {
    user: string;
    msg: string;
    to: string;
    action?: string;
}

export default class message{
    setMessage(msg: MsgInfo[], msgs:Array<MsgInfo[]>) {
        msgs.push(msg);
        //return msgs.length;
    }

    checkMessage(msg: MsgInfo[]){
        if(Object.keys(msg[0]).length > 4) return false;
        if (msg[0].to!=='all'&& msg[0].to !== 'other') return false;
        return true;
    }
}