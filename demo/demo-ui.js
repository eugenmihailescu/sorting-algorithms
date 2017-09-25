"use strict";
/**
 * Script for sorting algorithms demo application
 * 
 * @author Eugen Mihailescu <eugenmihailescux@gmail.com>
 * @license {@link https://www.gnu.org/licenses/gpl-3.0.txt|GPLv3}
 * @version 1.0
 * 
 * @class
 * @param {object} $ -
 *            A reference to jQuery
 */
function DemoUI($) {
    var that = this;
    var dec_sep = Number(1.1).toLocaleString().substring(1, 2);
    var precision = 5; // truncate the number of decimals to 5

    var arraySortURL = "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort";
    this.jsLibURL = "https://github.com/eugenmihailescu/sorting-algorithms";

    this.algorithms = [ [ "sort", "Array.sort", "#3366CC" ], [ "insertionsort", "Insertion", "#DC3912" ],
            [ "bubblesort", "Bubble", "#FF9900" ], [ "quicksort", "Quick", "#109618" ], [ "mergesort", "Merge", "#990099" ],
            [ "heapsort", "Heap", "#00BFFF" ], [ "selectionsort", "Selection", "#DD4477" ],
            [ "pigeonholesort", "Pigeonhole", "#6A5ACD" ], [ "bucketsort", "Bucket", "#9ACD32" ] ];

    this.supportsWorker = "function" === typeof window.Worker;

    var itemcount = $("input#itemcount");
    var samplecount = $("input#samplecount");
    var minsample = $("input#minsample");
    var maxsample = $("input#maxsample");
    var runinthread = $("#runinthread");
    var runinui = $("#runinpage");
    var jobs = $("#jobs");
    var jobsmax = this.algorithms.length;
    var canChart = true;

    var header = $(".header");
    var header_toggle = $(".header-toggle");

    /**
     * Toggle the page header
     * 
     * @param {int}
     *            direction - When -1 then toggle OFF, when 1 then ON
     * @param {int}
     *            vOffset - The vertical offset of the header. Usually its top position.
     * @param {int}
     *            maxOffset - How much can the header diverge from its offset. Usually the header height.
     * @param {int}
     *            tOffset - The offset of the toggle. Usually its top position.
     */
    var toggle_header = function(direction, vOffset, maxOffset, tOffset) {
        var tt = that.stripPixel(header_toggle.css("position-top"));
        var tStep = -direction * 33 / (maxOffset - vOffset);
        var i = setInterval(function() {
            if (vOffset > maxOffset) {
                clearInterval(i);
            }

            vOffset += 5;
            tOffset += tStep * 5;
            header.css("margin-top", direction * vOffset);

            header_toggle.css("margin-top", tOffset);

        }, 20);
    };

    /**
     * Block the UI while on progress
     * 
     * @param {bool}
     *            unblock - When true unblocks the UI, otherwise blocks it
     */
    function blockUI(unblock) {
        var el = ".blockUI", uc = "unBlockUI";
        if (unblock) {
            $(el).addClass(uc);
        } else {
            $(el).removeClass(uc);
        }
    }

    /**
     * Removes the BlockUI layer
     */
    function unBlockUI() {
        blockUI(true);
    }

    /**
     * Update item# on range input change
     */
    function onRangeChange() {
        var el = $("span#" + this.id), color;
        $(el).text(this.value);

        if (this.value < 2e4) {
            color = "#1E90FF";
        } else if (this.value < 4e4) {
            color = "#FFA500";
        } else {
            color = "#DC143C";
        }

        $(el).css("color", color);
    }

    /**
     * Enable/disable UI options on run method change
     */
    function onRunMethodChange() {
        jobs.prop("disabled", !that.supportsWorker || runinui.prop("checked"));
    }

    /**
     * Draw a graph based on the results of the tested algorithms.
     */
    function drawChart() {

        if (!that.exectimes || !canChart) {
            return;
        }

        var c = new ChartUI($);
        c.sender = that;
        c.minSample = minsample.val();
        c.maxSample = maxsample.val();
        c.itemsCount = itemcount.val();
        c.itemsType = $("#itemtype").val();
        c.workerCount = $("#runinpage").prop("checked") ? 0 : jobs.val();

        var saveChartAs = $("#saveChartAs");

        if ("undefined" == typeof URL) {
            $("#btnSave").prop("disabled", true).attr("title", "Not supported");
        } else {
            $("#btnSave").off("click").on("click", function() {
                saveChartAs.toggleClass("hidden");
                saveChartAs.focus();
            });

            var onSelectKeyUp = function(e) {
                if ("keyup" == e.originalEvent.type && 13 != e.originalEvent.keyCode) {
                    e.preventDefault();
                    return false;
                }
                $(this).toggleClass("hidden");
                c.saveChart(document.querySelector("#chart_div svg"), this.value);
            };

            // only on non-touchable devices
            if (!('ontouchstart' in document.documentElement)) {
                saveChartAs.off("click keyup").on("click keyup", onSelectKeyUp);

                saveChartAs.attr("multiple", "multiple");

                saveChartAs.off("mouseenter").on("mouseenter", function(e) {
                    saveChartAs.prop("selectedIndex", -1);
                }).off("mouseleave").on("mouseleave", function(e) {
                    $(this).toggleClass("hidden");
                }).off("mouseover").on("mouseover", function(e) {
                    saveChartAs.prop("selectedIndex", e.target.index);
                });
            } else {
                saveChartAs.off("change input").on("change input", onSelectKeyUp);
            }
        }

        google.charts.setOnLoadCallback(c.drawChart());
    }

    /**
     * Launch the sorting process
     */
    function onSortClick() {
        initAlgoUI();
        that.exectimes = [];

        $("#btnChart").addClass("hidden");
        $("span#status").text("0%").removeClass("hidden");
        $("div.blockUI-caption").css("background", "#fff");

        blockUI();

        // setTimeout allows the UI to sync while running on the main UI thread
        setTimeout(function() {
            var callback = function() {
                var total = that.getExecTime(), suffix = total > 1000 ? "s" : "";

                $("span#status").text("~" + that.getTimeFormat(Math.round(total / (total > 1000 ? 1000 : 1)), suffix));
                onChartClick();

                canChart = true;
                drawChart();

                unBlockUI();
            };

            var s = new SortUI($);
            s.runAsWorker = runinthread.prop("checked") && that.supportsWorker;
            s.workerCount = parseInt(jobs.val());
            s.sample = parseInt(samplecount.val());
            s.sender = that;

            s.sort(callback);
        }, 100);
    }

    /**
     * Hide the chart, show the algo list
     */
    function onBackClick() {
        $(".algorithms").removeClass("hidden");
        $(".chart-wrapper").addClass("hidden");
    }

    /**
     * Hide the algo list, show the chart
     */
    function onChartClick() {
        $(".algorithms").addClass("hidden");
        $(".chart-wrapper").removeClass("hidden");
        $("#btnChart").removeClass("hidden");
        // $("span#status").addClass("hidden");
    }

    /**
     * Initialize the algorithms UI
     */
    function initAlgoUI() {
        for (var i = 0; i < that.algorithms.length; i += 1) {
            $(".algorithm." + that.algorithms[i][0] + " td:last-child").text("");
            $(".algorithm." + that.algorithms[i][0]).removeClass("worst best");
        }
        var max = $('.algorithm input[type="checkbox"]:checked').length - 1;
        $("#execratingfilter").attr("min", 0).attr("max", max).attr("value", max >> 1);
    }

    /**
     * Check whether the given input type is supported by browser
     * 
     * @param {string}
     *            type - The input type (eg. `range`)
     * @returns {bool} - Returns true if the browser supports the input type, false otherwise.
     */
    function hasInputType(type) {
        var el = document.createElement("input");
        el.setAttribute("type", type);
        return el.type == type;
    }

    /**
     * Get the total execution time grouped by sorting algorithm
     * 
     * @param {bool=}
     *            desc - When true sort the result in descendent order. Default ascendent order.
     * @returns {array}
     */
    this.groupExecTime = function(desc) {
        desc = desc || false;
        var array = [];

        for ( var i in that.exectimes[0]) {
            if (that.exectimes[0].hasOwnProperty(i)) {
                array.push({
                    name : i,
                    time : that.getExecTime(i)
                });
            }
        }

        array.sort(function(a, b) {
            return desc ? a.time < b.time : a.time > b.time;
        });

        return array;
    };
    /**
     * Get the formatted representation of a number
     * 
     * @param {number}
     *            time - The number to format
     * @param {string}
     *            suffix - The suffix to add after the time string (default "ms")
     * @returns {string}
     */
    this.getTimeFormat = function(time, suffix) {
        suffix = suffix || " ms";

        var r = new RegExp("(\\d+\\" + dec_sep + "\\d{" + precision + "}).*", "g"), p = new RegExp("(\\" + dec_sep
                + "\\d+?)0*$", "g")
        return String(time).replace(r, "$1").replace(p, "$1") + " " + suffix;
    };

    /**
     * Get the total cumulated execution time
     * 
     * @param {string}
     *            algo - When specified then filter the result for that algorithm only. Default all.
     * @returns {float} - Returns the execution time
     */
    this.getExecTime = function(algo) {
        algo = algo || false;

        var total = 0;
        for ( var i in that.exectimes) {
            if (that.exectimes.hasOwnProperty(i)) {
                for ( var j in that.exectimes[i]) {
                    if ((!algo || j == algo) && that.exectimes[i].hasOwnProperty(j)) {
                        total += that.exectimes[i][j];
                    }
                }
            }
        }

        return total;
    };

    /**
     * Get the algorithm's name which scored the best|worst time
     * 
     * @returns {object}
     */
    this.execTimeRating = function() {
        var ratings = that.groupExecTime();

        return {
            best : ratings[0].name,
            worst : ratings[ratings.length - 1].name
        };
    };

    this.stripPixel = function(str) {
        str = str || "";
        return parseInt(str.replace("px", ""));
    }

    /**
     * Stores the individual execution time
     * 
     * @type {array} An multidimensional array [sample][algorithm]
     */
    this.exectimes;

    // if browser provides # of CPU cores
    if (navigator.hardwareConcurrency) {
        jobsmax = Math.min(navigator.hardwareConcurrency, this.algorithms.length);
    }
    jobs.prop("max", jobsmax);
    jobs.val(jobsmax);

    runinthread.prop("disabled", !this.supportsWorker);
    runinthread.prop("checked", this.supportsWorker);

    // sets dinamically the HREF that points to the source code
    for (var i = 0; i < this.algorithms.length; i += 1) {
        var url;
        if ("sort" == this.algorithms[i][0]) {
            url = arraySortURL;
        } else {
            url = this.jsLibURL + "/blob/master/src/" + this.algorithms[i][0].replace("sort", "-sort") + ".js";
        }
        $(".algorithm." + this.algorithms[i][0] + " a").attr("href", url);
    }
    $(".footer a.source").attr("href", this.jsLibURL).text(this.jsLibURL);

    // handle the UI events
    itemcount.off("input").on("input", onRangeChange);
    samplecount.off("input").on("input", function() {
        canChart = false;
        onRangeChange.call(this);
        var val = $(this).val() - 1, middle = Math.floor(val / 2);
        minsample.prop("max", middle + 1).val(0).trigger("input");
        maxsample.prop("min", middle + 1).prop("max", val).val(val).trigger("input");
        $("#middlesample").text(middle + 1);

        if (val < 1) {
            $(".range-sample").addClass("hidden");
        } else {
            $(".range-sample").removeClass("hidden");
        }
    });

    var inputRange = $(".input-range");
    if (!hasInputType("range")) {
        $(".input-range-caption").addClass("hidden");
        if (hasInputType("number")) {
            inputRange.attr("type", "number");
        } else {
            inputRange.attr("type", "text").attr({
                min : "",
                max : "",
                step : ""
            });
        }
    }

    $("input#minsample,input#maxsample").off("input mousedown mouseup").on("input", function() {
        onRangeChange.call(this);
        drawChart();
    }).on("mousedown", function() {
        canChart = false;
    }).on("mouseup", function() {
        canChart = true;
        drawChart();
    });

    runinthread.off("input").on("input", onRunMethodChange);
    runinui.off("input").on("input", onRunMethodChange);
    $("#btnSort").off("click").on("click", onSortClick);
    $("#btnBack").off("click").on("click", onBackClick);
    $("#btnChart").off("click").on("click", onChartClick);

    $("#itemtype").off("change").on("change", function() {
        $("#pigeonholesort").prop("checked", "numeric" == this.value);
        $("#pigeonholesort").prop("disabled", "numeric" != this.value);
        
        $("#bucketsort").prop("checked", "numeric" == this.value);
        $("#bucketsort").prop("disabled", "numeric" != this.value);
    });

    // init the UI events
    runinui.trigger("input");
    itemcount.trigger("input");
    samplecount.trigger("input");
    $("input#minsample,input#maxsample").trigger("input");
    $("#itemtype").trigger("change");

    $(".close-header").off("click").on("click", function() {
        toggle_header(-1, 0, header.get(0).clientHeight + 15, -33);
    });
    header_toggle.off("click").on("click", function() {
        toggle_header(1, that.stripPixel(header.css("margin-top")), 0, -8);
    });
}

var ui = new DemoUI(jQuery);
