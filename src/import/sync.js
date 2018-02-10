class Server {
    constructor() {

    }

    static notifyAllTabs(message, callback) {
        chrome.tabs.query({}, function(tabs){
            for(let i = 0; i < tabs.length;i++) {
                chrome.tabs.sendMessage(tabs[i].id, message, callback);  
            }
        });
    }
}

class Client {
    constructor() {

    }
}

export {
    Server,
    Client
}