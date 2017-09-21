"use strict";

importScripts("../src/bubble-sort.js");
importScripts("../src/insertion-sort.js");
importScripts("../src/merge-sort.js");
importScripts("../src/quick-sort.js");
importScripts("../src/binary-heap.js");
importScripts("../src/heap-sort.js");
importScripts("../src/selection-sort.js");

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
 */
function compare(a, b) {
    return a > b;
}

onmessage = function(e) {
    postMessage({
        algo : e.data.algo,
        done : false,
        sample : e.data.sample
    });

    var start = now();

    e.data.array[e.data.algo].call(e.data.array, "sort" == e.data.algo ? compare : false);

    postMessage({
        algo : e.data.algo,
        done : true,
        time : now() - start,
        sample : e.data.sample
    });
}