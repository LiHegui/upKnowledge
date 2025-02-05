class Set {
    constructor() {
        this.data = [];
    }

    add(value) {
        if (!this.has(value)) {
            this.data.push(value);
        }
    }

    delete(value) {
        const index = this.data.indexOf(value);
        if (index !== -1) {
            this.data.splice(index, 1);
        }
    }

    has(value) {
        return this.data.indexOf(value) !== -1;
    }

    clear() {
        this.data = [];
    }

    size() {
        return this.data.length;
    }

    values() {
        return this.data;
    }

    forEach(callback) {
        for (let i = 0; i < this.data.length; i++) {
            callback(this.data[i], this.data[i], this);
        }
    }
}