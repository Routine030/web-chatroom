export default class user{
    setUser(name: string, names:Array<string>){
        if (!this.isUser(name,names)) {
            //no user in system, create a user
            names.push(name);
            return true;
        }
        return false;
    }

    isUser(name: string, names:Array<string>){
        if(names.includes(name)){
            return true;
        }
        return false;
    }
}