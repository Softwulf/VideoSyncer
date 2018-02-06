export default class Observable {
    constructor(name, observing) {
        this.name = name;
        this.listeners = [];

        if(observing) {
            // add the observing objects to the prototype
            for(let i = 0; i < observing.length; i++) {
                this[observing[i].name] = observing[i];
            }
        }
    }

    on(event, listener) {
        this.listeners.push({event: event, listener: listener});
    }

    call(event, data) {
        for(let i = 0; i < this.listeners.length; i++) {
            var obj = this.listeners[i];
            if(obj.event == event) {
                obj.listener(data);
            }
        }
    }
}