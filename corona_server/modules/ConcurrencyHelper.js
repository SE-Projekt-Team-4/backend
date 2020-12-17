/**
 * @module concurrencyHelper
 */

var o_semaphores = {};

/**
 * Used to block concurrency of asynchronous code with the same key.
 * When the function is called, all other calls to this function with the same key will be blocked until the block is lifted, using the handler returned by the function.
 * If the function is already called for the key, the function will wait till all other previous callers have used the handler to release the block.
 * @param {obj} key - A key describing the 
 * @return {function} A function that takes no parameters and releases the block for the next call of this function with the same key
 */
async function f_blockConcurrencyGroupedByKey(key) {
    if (o_semaphores[key] === undefined) {
        o_semaphores[key] = new Semaphore(1);
    }
    o_semaphores[key].take();

    return function () {
        o_semaphores[key].leave();
        if (o_semaphores[key].isEmpty()) {
            delete o_semaphores[key];
        }
    }
}

/**
 * Represents a queue that allows to wait for callbacks using promises and executes one callback after another when next is called.
 */
class CallbackQueue {
    constructor() {
        this._callbacks = [];
    }
    /**
     * Create a Promise that resolves when its callback in the queue is called.
     * @returns {Promise<undefined>} - Returns as soon as the callback is called by next.
     */
    wait() {
        return new Promise((resolve, reject) => {
            const f_callback = function () {
                resolve();
            }
            this._callbacks.push(f_callback);
        });
    }
    /**
     * Calls the first callback in the queue causing the corresponding Promise (created by (CallbackQueue.wait())) to resolve.
     * @returns {boolean} - Returns true if a callback is called, returns false if the queue is empty
     */
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

/** Represents a Semaphore */
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

module.exports.blockConcurrencyGroupedByKey = f_blockConcurrencyGroupedByKey