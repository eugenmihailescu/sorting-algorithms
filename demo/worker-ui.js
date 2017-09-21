function WorkerUI() {
    var that = this;
    /**
     * Returns the number of milliseconds or microseconds of the current date
     */
    function now() {
        if ("undefined" == typeof performance) {
            return new Date();
        }

        return performance.now();
    }

    /**
     * Comparison function for custom sort
     * 
     * @param {Object}
     *            a - first compare item
     * @param {Object}
     *            b - second compare item
     */
    function compare(a, b) {
        return a > b;
    }

    /**
     * Forward the message
     * 
     * @param {object}
     *            e - An object containing the message to send
     */
    function sendMessage(e) {
        that.onmessage({
            data : e,
            currentTarget : that
        });
    }

    /**
     * Process the received message
     * 
     * @param {object}
     *            e - The object received from the sender
     */
    function receiveMessage(e) {
        sendMessage({
            algo : e.data.algo,
            done : false,
            sample : e.data.sample
        });

        var start = now();

        try {
            // we have to clone the array, otherwise its reference is used
            var array = e.data.array.slice();

            e.data.array[e.data.algo].call(array, "sort" == e.data.algo ? compare : false);
        } catch (err) {
            if (that.onerror) {
                that.onerror(err);
            }
        }

        sendMessage({
            algo : e.data.algo,
            done : true,
            time : now() - start,
            sample : e.data.sample
        });
    }

    /**
     * Default constructor initialization
     */
    this.postMessage = function(e) {
        return receiveMessage({
            data : e
        });
    };

    /**
     * Abstract form of Worker.terminate
     */
    this.terminate = function() {
        return true;
    };

    this.onmessage = null;
    this.onerror = null;
    this.running = false;
    this.running = false;
    this.algo = null;
}
