var algorithms = [ "sort", "insertionsort", "bubblesort", "quicksort", "mergesort" ];
var supportsWorker = "function" === typeof window.Worker;

var itemcount = document.getElementById("itemcount");
var runinthread = document.getElementById("runinthread");
var runinui = document.getElementById("runinpage");
var jobs = document.getElementById("jobs");
var jobsmax = algorithms.length;

/**
 * Polyfill for addEventListener
 */
function addEventListener(element, event, callback) {
    if (element.addEventListener) {
        element.addEventListener(event, callback);
    } else if (element.attachEvent) {
        element.attachEvent("on" + event, callback);
    }
}

/**
 * Polyfill for dispatchEvent
 */
function dispatchEvent(element, event) {
    if (element.dispatchEvent) {
        var e = new Event(event);
        element.dispatchEvent(e);
    } else if (element.fireEvent) {
        var e = new Event("on" + event);
        element.fireEvent(e);
    }
}

/**
 * Block the UI while on progress
 * 
 * @param {bool}
 *            unblock - When true unblocks the UI, otherwise blocks it
 */
function blockUI(unblock) {
    var el = document.querySelector(".blockUI");
    var cl = el.getAttribute("class"), uc = "unBlockUI", nc;
    if (unblock) {
        nc = cl + " " + uc;
    } else {
        nc = cl.replace(uc, "");
    }
    el.setAttribute("class", nc);
}

/**
 * Removes the BlockUI layer
 * 
 */
function unBlockUI() {
    blockUI(true);
}

/**
 * Update item# on range input change
 */
function onItemCountChange() {
    var el = document.querySelector("span#itemcount"), color;
    el.innerText = this.value;

    if (this.value < 2e4) {
        color = "#1E90FF";
    } else if (this.value < 4e4) {
        color = "#FFA500";
    } else {
        color = "#DC143C";
    }

    el.style.color = color;
}

/**
 * Enable/disable UI options on run method change
 * 
 */
function onRunMethodChange() {
    jobs.disabled = !supportsWorker || runinui.checked;
};

/**
 * Launch the sorting process
 */
function onSortClick() {
    initAlgoUI();

    blockUI();

    // setTimeout allows the UI to sync while running on the main UI thread
    setTimeout(function() {
        sort(runinthread.checked, parseInt(jobs.value), unBlockUI);
    }, 100);
}

/**
 * Initialize the algorithms UI
 */
function initAlgoUI() {
    for (var i = 0; i < algorithms.length; i += 1) {
        var el = document.querySelector(".algorithm." + algorithms[i] + " td:last-child");
        el.innerText = "";
        var row = document.querySelector(".algorithm." + algorithms[i]);
        row.setAttribute("class", row.getAttribute("class").replace("worst", "").replace("best", ""));
    }
}

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
 * Set the best|worst execution time
 * 
 * @param {array}
 *            array - The array reference where to store the execution time
 * @param {float}
 *            value - The new time
 * @param {string}
 *            algorithm - The algorithm name
 * @param {bool}
 *            gt - When false then "<", otherwise ">" operator is assumed
 */
function setExecTime(array, value, algorithm, gt) {
    gt = gt || false;
    if ((gt && value > array[0]) || (!gt && value < array[0])) {
        array[0] = value;
        array[1] = algorithm;
    }
}

/**
 * Sort a random generated array using the selected sorting algorithms
 * 
 * @param {bool}
 *            runAsWorker - When true runs the sorting algorithms in a separate Worker thread, otherwise in the UI thread
 * @param {int}
 *            jobs - When runAsWorker=true limits the number of concurrent Worker threads to use
 * @param {callable}
 *            callback - A callback function that is called when all sortings were done
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Worker
 */
/**
 * @param runAsWorker
 * @param jobs
 * @param callback
 * @returns
 */
function sort(runAsWorker, jobs, callback) {

    runAsWorker = runAsWorker && supportsWorker || false;
    jobs = jobs || 1;

    var a = randomArray(itemcount.value, document.getElementById("itemtype").value), elapsed, threads = [];
    var best = new Array(9e9, ""), worst = new Array(0, "");

    /**
     * Find a thread by the sorting algorithm name
     * 
     * @param {string}
     *            algo - The name of the sorting algorithm
     * @returns {int} - If found returns the index of the thread, otherwise -1
     */
    var getThread = function(algo) {
        var result = -1;
        for (var i = 0; i < threads.length; i += 1) {
            if (threads[i][0] == algo) {
                result = i;
                break;
            }
        }

        return result;
    };

    /**
     * Set a thread as "done" by name
     * 
     * @param {string} -
     *            The name of the sorting algorithm
     */
    var threadDone = function(algo) {
        var i = getThread(algo);
        if (i > -1) {
            threads[i][2] && threads[i][2].runningJobs--;

            threads[i][1] = true;
            threads[i][2] && (threads[i][2].runningJobs || threads[i][2].terminate());
            threads.splice(i, 1);
        }
    };

    /**
     * Check if all threads are done
     * 
     * @return {bool} - Returns true if all threads were marked as done, false otherwise
     */
    var allThreadsDone = function() {
        var done = true;
        for (var i = 0; i < threads.length; i += 1) {
            if (threads[i][1] == false) {
                done = false;
                break;
            }
        }

        return done;
    };

    /**
     * Callback when a job is done
     * 
     * @param {Object}
     *            e - An object that contains info about the job status
     */
    var onDone = function(e) {
        var el = document.querySelector(".algorithm." + e.data.algo + " td:last-child");
        var row = document.querySelector(".algorithm." + e.data.algo);

        if (e.data.done) {

            // set the best|worst time
            setExecTime(best, e.data.time, e.data.algo, false);
            setExecTime(worst, e.data.time, e.data.algo, true);

            // update the result
            el.innerText = String(e.data.time).substr(0, String(e.data.time).indexOf('.') + 5) + " ms";
            el.setAttribute("class", "done");
            row.setAttribute("class", row.getAttribute("class").replace("processing", ""));

            threadDone(e.data.algo);
        } else {
            el.innerText = "processing...";

            row.setAttribute("class", row.getAttribute("class") + " processing");
        }
    };

    for (var i = 0; i < algorithms.length; i += 1) {
        var algo = algorithms[i];
        var el = document.querySelector(".algorithm." + algo + " td:last-child");

        if (!document.getElementById(algo).checked) {
            el.innerText = "n/a";
            continue;
        }

        // clone the randomly created array
        var array = a.slice();

        var thread = [ algo, false ];

        if (runAsWorker) {
            if (threads.length < jobs) {
                thread[2] = new Worker("worker.js");
                thread[2].onmessage = onDone;
                thread[2].onerror = function(event) {
                    throw event.data;
                }
                thread[2].runningJobs = 1;
            } else {
                thread[2] = threads[threads.length - 1][2];
                thread[2].runningJobs++;
            }
        }

        threads.push(thread);

        if (runAsWorker) {
            thread[2].postMessage({
                array : array,
                algo : algo
            });
        } else {
            var data = {
                data : {
                    algo : algo,
                    done : false
                }
            };

            onDone(data);

            var start = now();
            array[algo].call(array, "sort" == algo ? compare : false);
            data.data.time = now() - start;
            data.data.done = true;

            onDone(data);
        }
    }

    var loop = setInterval(function() {

        if (allThreadsDone()) {
            // highlight the best|worst algorithm
            for (var i = 0; i < algorithms.length; i += 1) {
                var algo = algorithms[i];
                var el = document.querySelector(".algorithm." + algo);
                if (algo == best[1]) {
                    el.setAttribute("class", el.getAttribute("class") + " best");
                }
                if (algo == worst[1] && algo != best[1]) {
                    el.setAttribute("class", el.getAttribute("class") + " worst");
                }

                if (runAsWorker) {
                    var j = getThread(algo);
                    if (j > -1) {
                        threads[j][2].terminate();
                    }
                }
            }
            clearInterval(loop);

            if (callback) {
                callback();
            }
        }
    }, 100);
}

// if browser provides # of CPU cores
if (navigator.hardwareConcurrency) {
    jobsmax = Math.max(navigator.hardwareConcurrency, algorithms.length);
}
jobs.max = jobsmax;
jobs.value = jobsmax;

runinthread.disabled = !supportsWorker;
runinthread.checked = supportsWorker;

// handle the UI events
addEventListener(itemcount, "input", onItemCountChange);
addEventListener(runinthread, "input", onRunMethodChange);
addEventListener(runinui, "input", onRunMethodChange);
addEventListener(document.getElementById("btnSort"), "click", onSortClick);

// init the UI events
dispatchEvent(runinui, "input");
dispatchEvent(itemcount, "input");
