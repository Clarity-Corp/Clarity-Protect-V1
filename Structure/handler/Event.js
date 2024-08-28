class Event {
    constructor(opt) {
        this.name = opt.name;
        this.once = opt.once || false;
    }
    async run()  {

    }
}

module.exports = Event;