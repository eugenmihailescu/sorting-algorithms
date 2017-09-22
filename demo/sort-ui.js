"use strict";
/**
 * Sorts a randomly generated array by using a list of sorting algorithms
 * 
 * @author Eugen Mihailescu <eugenmihailescux@gmail.com>
 * @license {@link https://www.gnu.org/licenses/gpl-3.0.txt|GPLv3}
 * @version 1.0
 * 
 * @class
 * @param {object} $ -
 *            A reference to jQuery
 */
function SortUI($) {
    var that = this;

    var watchDogFreq = 50; // process the job queue each 50ms
    var cleanUpFreq = 1000; // check if finalized each 1000ms

    var status = $('span#status'), progressBar = $('div.blockUI-caption');
    var queue = [], workers = [];
    var doneThreads = [ 0 ], maxThreads = 1, sampleAvg = [];

    /**
     * Generate a random array
     * 
     * @param {int}
     *            count - The array size
     * @param {string}
     *            type - When "string" create String items, otherwise numerical
     */
    function randomArray(count, type) {
        var result = [];
        for (var i = 0; i < count; i += 1) {
            if ("string" == type)
                result.push(String.fromCharCode(32 + Math.round(223 * Math.random())));
            else
                result.push(Math.round(count * Math.random()));
        }

        return result;
    }

    /**
     * Set the status and progress for the given elements
     * 
     * @param {int}
     *            perc - The progress percentage
     * @param {object}
     *            status - The status DOM element
     * @param {object}
     *            progressBar- The progress bar DOM element
     */
    function setProgress(perc, status, progressBar) {
        var s = perc + "%";

        if ($(status).text() == s) {
            return;
        }

        $(status).text(s);
        $(progressBar).css("background",
                "linear-gradient(to right, #7FFFD4 " + perc + "%, #fff " + (perc + (perc < 90 ? 10 : (100 - perc))) + "%)");
    }

    /**
     * Get the algorithm name which scored the best time
     * 
     * @returns {string}
     */
    function minAvg() {
        var v = 9e9, a = false;
        for ( var i in sampleAvg) {
            if (sampleAvg.hasOwnProperty(i)) {
                if (sampleAvg[i] < v) {
                    v = sampleAvg[i];
                    a = i;
                }
            }
        }
        return a;
    }

    /**
     * Get the number of running workers for a specified algoritm name
     * 
     * @param {string}
     *            algo - The algoritm
     * @returns {int}
     */
    function getRunningWorkers(algo) {
        algo = algo || false;
        var running = 0;
        for (var i = 0; i < workers.length; i += 1) {
            running += workers[i].running && (!algo || algo == workers[i].algo);
        }
        return running;
    }

    /**
     * Destroys all created workers
     */
    function terminateWorkers() {
        var worker;
        while (workers.length) {
            worker = workers.pop();
            worker.terminate();
        }
    }

    /**
     * The Worker error handler
     * 
     * @param {Event}
     *            e - The error event
     */
    function onError(e) {
        throw e.data;
    }

    /**
     * Callback when a job is done
     * 
     * @param {Event}
     *            e - The event that contains the data object
     */
    function onDone(e) {
        var el = $(".algorithm." + e.data.algo + " td:last-child");
        var row = $(".algorithm." + e.data.algo);

        if (e.data.done) {
            e.currentTarget.running = false;

            if (!that.sender.exectimes.hasOwnProperty(e.data.sample)) {
                that.sender.exectimes[e.data.sample] = [];
            }

            that.sender.exectimes[e.data.sample][e.data.algo] = e.data.time;

            doneThreads[0]++;
            doneThreads[e.data.algo]++;

            var perc = Math.round(100 * doneThreads[0] / maxThreads);
            setProgress(perc, status, progressBar);

            var percAlgo = Math.round(100 * doneThreads[e.data.algo] / that.sample);
            setProgress(percAlgo, el, el);

            if (percAlgo >= 100) {
                // update the result and remove the progress bar
                $(el).text(that.sender.getTimeFormat(that.sender.getExecTime(e.data.algo)));
                $(el).css("background", "");
            }

        } else {
            if (!doneThreads.hasOwnProperty(e.data.algo)) {
                doneThreads[e.data.algo] = 0;
            }
        }
    }

    /**
     * Get the first available idle worker
     */
    function getWorker() {
        var worker = false, i = 0;

        while (!worker && i < workers.length) {
            if (false === workers[i].running) {
                worker = workers[i];
                break;
            }
            i++;
        }

        return worker;
    }

    /**
     * Execute the queue jobs
     */
    function executeJobs() {
        // @see https://developer.mozilla.org/en-US/docs/Web/API/Worker
        var workerClass = that.runAsWorker ? Worker : WorkerUI;

        while (queue.length) {
            var data, worker;

            if (workers.length < that.workerCount) {
                worker = new workerClass("worker.js");

                worker.onmessage = onDone;
                worker.onerror = onError;
                worker.running = false;

                workers.push(worker);
            } else {
                worker = getWorker();
            }

            if (worker) {
                worker.running = true;
                data = queue.pop();
                worker.algo = data.algo;

                worker.postMessage({
                    array : data.array,
                    algo : data.algo,
                    sample : data.sample
                });

            } else {
                break;
            }
        }
    }

    /**
     * Process the job queue (every 50ms)
     */
    var watchDog = setInterval(function() {

        if (getRunningWorkers() < that.workerCount) {
            executeJobs();
        }
        if (!queue.length) {
            clearInterval(watchDog);
        }
    }, watchDogFreq);

    /**
     * Sort a random generated array using the selected sorting algorithms
     * 
     * @param {callable=}
     *            callback - A callback function that is called when all sortings were done
     */
    this.sort = function(callback) {
        maxThreads = $('.algorithm input[type="checkbox"]:checked').length * that.sample;
        var itemCount = $("input#itemcount").val();
        var dataType = $("#itemtype").val();

        // enqueue the sorting jobs
        for (var j = 0; j < that.sample; j += 1) {
            var randArray = randomArray(itemCount, dataType);

            for (var i = 0; i < that.sender.algorithms.length; i += 1) {
                var algo = that.sender.algorithms[i][0];
                var el = $(".algorithm." + algo + " td:last-child");

                if (!document.getElementById(algo).checked) {
                    $(el).text("n/a");
                    continue;
                }

                queue.push({
                    array : randArray,
                    algo : algo,
                    sample : j
                });
            }
        }

        /**
         * Wait all jobs to finish. Post-sorting clean-up.
         */
        var loop = setInterval(function() {

            if (!queue.length && !getRunningWorkers()) {
                terminateWorkers();

                var rating = that.sender.execTimeRating();

                // highlight the best|worst algorithm
                for (var i = 0; i < that.sender.algorithms.length; i += 1) {
                    var algo = that.sender.algorithms[i][0];
                    var el = $(".algorithm." + algo);
                    if (algo == rating.best) {
                        $(el).addClass("best");
                    }
                    if (algo == rating.worst && algo != rating.best) {
                        $(el).addClass("worst");
                    }
                }
                clearInterval(loop);

                if (callback) {
                    callback();
                }

            }
        }, cleanUpFreq);
    };

    /**
     * When true runs the sorting algorithms in a separate Worker thread, otherwise in the UI thread
     */
    this.runAsWorker = false;

    /**
     * When runAsWorker=true limits the number of concurrent Worker threads to use. Default 1.
     */
    this.workerCount = 1;

    /**
     * Re-run the sort a number of sample-times and report the averaged result. Default 1.
     */
    this.sample = 1;

    /**
     * The object that calls this function (we use some of its public properties).
     */
    this.sender = null;

}