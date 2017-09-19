var input = document.querySelector("input#itemcount");

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

function unBlockUI() {
    blockUI(true);
}

/**
 * Update item# on range input change
 */
function onItemCountChange() {
    document.querySelector("span#itemcount").innerText = this.value;
    var color;
    if (this.value < 2e4) {
        color = "#1E90FF";
    } else if (this.value < 4e4) {
        color = "#FFA500";
    } else {
        color = "#DC143C";
    }
    document.querySelector("span#itemcount").style.color = color;
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
 *            array - The new time
 * @param {string}
 *            array - The algorithm name
 * @param {bool}
 *            array - When false then "<", otherwise ">" operator is assumed
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
 */
function sort(runAsWorker, jobs, callback) {

    runAsWorker = runAsWorker && ("function" === typeof window.Worker) || false;
    jobs = jobs || 1;

    var a = randomArray(input.value, document.getElementById("itemtype").value), algorithms = [ "sort", "insertionsort",
            "bubblesort", "quicksort", "mergesort" ], elapsed, threads = [];
    var best = new Array(9e9, ""), worst = new Array(0, "");

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

    var threadDone = function(algo) {
        var i = getThread(algo);
        if (i > -1) {
            threads[i][2] && threads[i][2].runningJobs--;

            threads[i][1] = true;
            threads[i][2] && (threads[i][2].runningJobs || threads[i][2].terminate());
            threads.splice(i, 1);
        }
    };

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

    var init = function() {
        for (var i = 0; i < algorithms.length; i += 1) {
            var el = document.querySelector(".algorithm." + algorithms[i] + " td:last-child");
            el.innerText = "";
            var row = document.querySelector(".algorithm." + algorithms[i]);
            row.setAttribute("class", row.getAttribute("class").replace("worst", "").replace("best", ""));
        }
    };

    init();

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

function onRunMethodChange() {
    document.getElementById("jobs").disabled = !window.Worker || document.getElementById("runinpage").checked;
};

// init UI events
input.addEventListener("change", onItemCountChange);
input.addEventListener("input", onItemCountChange);
document.getElementById("btnSort").addEventListener("click", function() {
    blockUI();
    setTimeout(function() {
        sort(document.getElementById("runinthread").checked, parseInt(document.getElementById("jobs").value), unBlockUI);
    }, 100);

});
document.getElementById("runinthread").disabled = !window.Worker;
document.getElementById("runinthread").checked = !!window.Worker;
document.getElementById("runinthread").onchange = onRunMethodChange;
document.getElementById("runinpage").onchange = onRunMethodChange;
document.getElementById("runinpage").onchange();
if (navigator.hardwareConcurrency) {
    document.getElementById("jobs").value = navigator.hardwareConcurrency;
}
onItemCountChange.call(input);