export default class message{
    setMessage(msg: string[], msgs:Array<string[]>) {
        msgs.push(msg);
    }

    broadcastMessage(msg: string[]) {
        const reply = msg[0]+' say: '+msg[1];
        return reply;
    }

    checkMessage(msg: string[]){
        if(msg.length!==2) return false;
        return true;
    }
}