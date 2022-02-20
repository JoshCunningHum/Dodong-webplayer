class Global { 
    constructor(){
        this.users = [];
    }
    addUser(user) {
        this.users.push(user);
        return user;
    }
    getUsers() {
        return this.users;
    }
}

let global = new Global();
module.exports = global;