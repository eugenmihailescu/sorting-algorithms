var input = document.querySelector("input#itemcount");

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
function sort() {
    var a = randomArray(input.value, document.getElementById("itemtype").value), algorithms = [ "sort", "insertionsort",
            "bubblesort", "quicksort", "mergesort" ], elapsed;
    var best = new Array(9e9, ""), worst = new Array(0, "");

    for (var i = 0; i < algorithms.length; i += 1) {
        var algo = algorithms[i];
        var el = document.querySelector(".algorithm." + algo + " td:last-child");
        var row = document.querySelector(".algorithm." + algo);
        row.setAttribute("class", row.getAttribute("class").replace("worst", "").replace("best", ""));

        if (!document.getElementById(algo).checked) {
            el.innerText = "n/a";
            continue;
        }

        // clone the randomly created array
        var array = a.slice();

        // call sorting function
        var start = now();
        array[algo].call(array, "sort" == algo ? compare : false);
        elapsed = now() - start;

        // set the best|worst time
        setExecTime(best, elapsed, algo, false);
        setExecTime(worst, elapsed, algo, true);

        // update the result
        el.innerText = String(elapsed).substr(0, String(elapsed).indexOf('.') + 5) + " "
                + ("undefined" == typeof performance ? "m" : "u") + "s";

    }

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
    }
}

// init UI events
input.addEventListener("change", onItemCountChange);
input.addEventListener("input", onItemCountChange);
document.getElementById("btnSort").addEventListener("click", sort);
document.querySelector(".wrapper").style.marginBottom = document.querySelector(".footer").clientHeight + "px";
onItemCountChange.call(input);