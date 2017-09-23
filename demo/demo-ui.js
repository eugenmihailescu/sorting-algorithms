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

    this.algorithms = [ [ "sort", "Array.sort", "#3366CC" ], [ "insertionsort", "Insertion", "#DC3912" ],
            [ "bubblesort", "Bubble", "#FF9900" ], [ "quicksort", "Quick", "#109618" ], [ "mergesort", "Merge", "#990099" ],
            [ "heapsort", "Heap", "#0099C6" ], [ "selectionsort", "Selection", "#DD4477" ] ];

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

    function onSaveClick() {
        /**
         * Calculate the text width based on its font size
         */
        var getTextWidth = function(text, font) {
            var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
            var context = canvas.getContext("2d");
            context.font = font;
            var metrics = context.measureText(text);

            return metrics.width;
        };

        /**
         * Append a link element to the SVG
         */
        var addLink = function(svg, url, text, title, target) {
            var scaleFactorX = 4/3, scaleFactorY = 4/3;
            var textSize = getTextWidth("__"+text, "Verdana 1em");
            var textHeight = 12 * scaleFactorY; // 12px divided by 72PPI/96DPI
            var link = $("<a></a>").appendTo(svg);
            url && link.attr("xlink:href", url);
            link.css("fill", "#FA8072");
            link.appendTo(svg);

            var txt = $("<text></text>");

            txt.attr("x", that.stripPixel(svg.attr("width")) - textSize * scaleFactorX);
            txt.attr("y", textHeight*scaleFactorY);
            txt.attr("font-family", "Verdana");
            txt.attr("font-size", "1em");
            title && txt.attr("xlink:title", title);
            target && txt.attr("xlink:show", target);
            text && txt.text(text);

            txt.appendTo(link);

            return link;
        };

        var svg = $("#chart_div svg");

        // xlink namespace is necessary in order to interpret the injected SVG link
        svg.attr("xmlns:xlink", "http://www.w3.org/1999/xlink");

        var url = "https://github.com/eugenmihailescu/sorting-algorithms";
        var link = addLink(svg, url, url, "Source code on Github", "new");

        var svgData = document.querySelector("#chart_div svg").outerHTML;

        var svgBlob = new Blob([ svgData ], {
            type : "image/svg+xml;charset=utf-8"
        });
        svgBlob.lastModified = new Date();
        svgBlob.name = "sort-algo-chart.svg";

        var svgUrl = URL.createObjectURL(svgBlob);
        var downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = svgBlob.name;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // SVG clean-up
        link.remove();
        svg.removeAttr("xmlns:xlink");
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
    }

    /**
     * Get the total execution time grouped by sorting algorithm
     * 
     * @returns {array}
     */
    function groupExecTime() {
        var array = [];

        for ( var i in that.exectimes[0]) {
            if (that.exectimes[0].hasOwnProperty(i)) {
                array[i] = that.getExecTime(i);
            }
        }

        return array;
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
        var result = {
            best : false,
            worst : false
        }, vb = 9e9, vw = 0;

        var array = groupExecTime();

        for ( var i in array) {
            if (array.hasOwnProperty(i)) {
                if (array[i] < vb) {
                    vb = array[i];
                    result.best = i;
                }
                if (array[i] > vw) {
                    vw = array[i];
                    result.worst = i;
                }
            }
        }

        return result;
    };

    this.stripPixel = function(str) {
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
    $("#btnSave").off("click").on("click", onSaveClick);
    $("#btnChart").off("click").on("click", onChartClick);

    // init the UI events
    runinui.trigger("input");
    itemcount.trigger("input");
    samplecount.trigger("input");
    $("input#minsample,input#maxsample").trigger("input");

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

    $(".close-header").off("click").on("click", function() {
        toggle_header(-1, 0, header.get(0).clientHeight + 15, -33);
    });
    header_toggle.off("click").on("click", function() {
        toggle_header(1, stripPixel(header.css("margin-top")), 0, -8);
    });
}

var ui = new DemoUI(jQuery);