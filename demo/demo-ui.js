/**
 * Script for sorting algorithms demo application
 * 
 * @version 1.0
 * @author Eugen Mihailescu
 */
(function() {
    var dec_sep = Number(1.1).toLocaleString().substring(1, 2);
    var precision = 5; // truncate the number of decimals to 5

    var algorithms = [ [ "sort", "Array.sort" ], [ "insertionsort", "Insertion" ], [ "bubblesort", "Bubble" ],
            [ "quicksort", "Quick" ], [ "mergesort", "Merge" ] ];

    var supportsWorker = "function" === typeof window.Worker;

    var itemcount = document.getElementById("itemcount");
    var runinthread = document.getElementById("runinthread");
    var runinui = document.getElementById("runinpage");
    var jobs = document.getElementById("jobs");
    var jobsmax = algorithms.length;
    var best = new Array(9e9, ""), worst = new Array(0, ""), exectimes = [];

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
     * Set the class of a DOM element
     * 
     * @param {string|Object}
     *            selector - The CSS selector or the DOM element
     * @param {string}
     *            className - The class name to set
     */
    function setClass(selector, className) {
        var el = "object" == typeof selector ? selector : document.querySelector(selector);
        el.className += " " + className;
    }

    /**
     * Remove the class of a DOM element
     * 
     * @param {string|Object}
     *            selector - The CSS selector or the DOM element
     * @param {string|array}
     *            className - The class name or an array of class names to remove
     */
    function delClass(selector, classNames) {
        if ("string" == typeof classNames)
            classNames = [ classNames ];

        var el = "object" == typeof selector ? selector : document.querySelector(selector), r;

        for (var i = 0; i < classNames.length; i += 1) {
            r = new RegExp("\s?\\b" + classNames[i] + "\\b", "g");
            el.className = el.className.replace(r, "");
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
        var uc = "unBlockUI", nc;
        if (unblock) {
            setClass(el, uc);
        } else {
            delClass(el, uc);
        }
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
    }

    /**
     * Launch the sorting process
     */
    function onSortClick() {
        initAlgoUI();
        setClass("#btnChart", "hidden");

        blockUI();

        // setTimeout allows the UI to sync while running on the main UI thread
        setTimeout(function() {
            sort(runinthread.checked, parseInt(jobs.value), unBlockUI);
        }, 100);
    }

    /**
     * Hide the chart, show the algo list
     */
    function onBackClick() {
        delClass(".algorithms", "hidden");
        setClass(".chart-wrapper", "hidden");
    }

    /**
     * Hide the algo list, show the chart
     */
    function onChartClick() {
        setClass(".algorithms", "hidden");
        delClass(".chart-wrapper", "hidden");
        delClass("#btnChart", "hidden");
    }

    /**
     * Returns the algorithm element by its name
     * 
     * @param {string}
     *            name - The algorithm name
     * @returns {array}
     */
    function getAlgorithmByName(name) {
        var result = false;
        for (var i = 0; i < algorithms.length; i += 1) {
            if (name == algorithms[i][0]) {
                result = algorithms[i];
                break;
            }
        }

        return result;
    }
    /**
     * Initialize the algorithms UI
     */
    function initAlgoUI() {
        for (var i = 0; i < algorithms.length; i += 1) {
            var el = document.querySelector(".algorithm." + algorithms[i][0] + " td:last-child");
            el.innerText = "";
            delClass(".algorithm." + algorithms[i][0], [ "worst", "best" ]);
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
     * Get the formatted representation of a number
     * 
     * @param {number}
     *            time - The number to format
     * @param {string}
     *            suffix - The suffix to add after the time string (default "ms")
     * @returns {string}
     */
    function getTimeFormat(time, suffix) {
        if ("undefined" == typeof suffix) {
            suffix = " ms";
        }
        var r = new RegExp("(\\d+\\" + dec_sep + "\\d{" + precision + "}).*", "g"), p = new RegExp("(\\" + dec_sep
                + "\\d+?)0*$", "g")
        return String(time).replace(r, "$1").replace(p, "$1") + suffix;
    }

    /**
     * Draw the chart
     */
    function drawChart() {
        var rows = [ [ 'Algorithm', 'Time', {
            role : 'style',
        }, {
            role : 'annotation'
        } ] ];

        var wrapper = document.querySelector(".chart-wrapper");

        var colors = [ "#98FB98", "#7FFFD4", "#6495ED", "#1E90FF", "#FFD700", "#FF6347", "#ADFF2F", "#00BFFF", "#FF1493",
                "#90EE90", "#00FF7F", "#4169E1", "#FF4500", "#48D1CC", "#8A2BE2", "#FF8C00" ];

        var chartClass = google.visualization.BarChart;
        var algo, cix = Math.floor(colors.length * Math.random()), color, annotation;
        for (i in exectimes) {
            if (exectimes.hasOwnProperty(i)) {
                algo = getAlgorithmByName(i);
                if (cix >= colors.length) {
                    cix = 0;
                }
                color = colors[cix++];

                annotation = best[1] == i ? "fastest" : (worst[1] == i ? "slowest" : getTimeFormat(Math.round(exectimes[i])));
                rows.push([ algo[1], exectimes[i], 'fill-color:' + color, annotation ]);
            }
        }

        var data = new google.visualization.arrayToDataTable(rows);

        var options = {
            legend : "none",
            title : 'Benchmark results (smaller=best)',
            hAxis : {
                title : 'Execution time (ms)'
            },
            vAxis : {
                title : 'Algorithm'
            },
            height : wrapper.clientHeight + "px",
            width : wrapper.clientWidth + "px"
        };

        if (window.innerWidth < window.innerHeight) {
            chartClass = google.visualization.ColumnChart;
            var tmp = options.hAxis;
            options.hAxis = options.vAxis;
            options.vAxis = tmp;
        }

        var chart = new chartClass(document.getElementById('chart_div'));

        chart.draw(data, options);
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

                exectimes[e.data.algo] = e.data.time;

                // set the best|worst time
                setExecTime(best, e.data.time, e.data.algo, false);
                setExecTime(worst, e.data.time, e.data.algo, true);

                // update the result
                el.innerText = getTimeFormat(e.data.time);

                setClass(el, "done");
                delClass(row, "processing");

                threadDone(e.data.algo);
            } else {
                el.innerText = "processing...";

                setClass(row, "processing");
            }
        };

        for (var i = 0; i < algorithms.length; i += 1) {
            var algo = algorithms[i][0];
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

        /**
         * Waits until all threads are done and do a clean-up
         */
        var loop = setInterval(function() {

            if (allThreadsDone()) {
                // highlight the best|worst algorithm
                for (var i = 0; i < algorithms.length; i += 1) {
                    var algo = algorithms[i][0];
                    var el = document.querySelector(".algorithm." + algo);
                    if (algo == best[1]) {
                        setClass(el, "best");
                    }
                    if (algo == worst[1] && algo != best[1]) {
                        setClass(el, "worst");
                    }

                    if (runAsWorker) {
                        var j = getThread(algo);
                        if (j > -1) {
                            threads[j][2].terminate();
                        }
                    }
                }
                clearInterval(loop);

                onChartClick();

                google.charts.setOnLoadCallback(drawChart());

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
    addEventListener(document.getElementById("btnBack"), "click", onBackClick);
    addEventListener(document.getElementById("btnChart"), "click", onChartClick);

    // init the UI events
    dispatchEvent(runinui, "input");
    dispatchEvent(itemcount, "input");
})();