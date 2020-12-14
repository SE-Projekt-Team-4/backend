
var o_semaphores = {};


async function f_blockConcurrencyGroupedByKey(obj) {
    if (o_semaphores[obj] === undefined) {
        o_semaphores[obj] = new Semaphore(1);
    }
    o_semaphores[obj].take();

    return function () {
        o_semaphores[obj].leave();
        if (o_semaphores[obj].isEmpty()) {
            delete o_semaphores[obj];
        }
    }
}


class CallbackQueue {

    constructor() {
        this._callbacks = [];
    }

    wait() {
        return new Promise((resolve, reject) => {
            const f_callback = function () {
                resolve();
            }
            this._callbacks.push(f_callback);
        });
    }

    next() {
        if (!this.isEmpty()) {
            this._callbacks.shift()();
            return true;
        }
        else {
            return false;
        }
    }

    isEmpty() {
        return this._callbacks.length === 0;
    }

}

class Semaphore {

    constructor(maxConcurrent) {
        this._queue = new CallbackQueue();
        this._maxConcurrent = maxConcurrent;
        this._concurrent = 0;
    }

    take() {
        if (this._concurrent < this._maxConcurrent) {
            this._concurrent += 1
            return;
        }
        else {
            return this._queue.wait();
        }
    }

    leave() {
        if (this._queue.isEmpty()) {
            this._concurrent -= 1;
        }
        else {
            this._queue.next();
        }
    }

    isEmpty() {
        return this._concurrent === 0;
    }

}

module.exports.f_blockConcurrencyGroupedByKey = f_blockConcurrencyGroupedByKey