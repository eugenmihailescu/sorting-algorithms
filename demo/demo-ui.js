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

    this.algorithms = [ [ "sort", "Array.sort" ], [ "insertionsort", "Insertion" ], [ "bubblesort", "Bubble" ],
            [ "quicksort", "Quick" ], [ "mergesort", "Merge" ], [ "heapsort", "Heap" ], [ "selectionsort", "Selection" ] ];

    this.supportsWorker = "function" === typeof window.Worker;

    var itemcount = $("input#itemcount");
    var samplecount = $("input#samplecount");
    var runinthread = $("#runinthread");
    var runinui = $("#runinpage");
    var jobs = $("#jobs");
    var jobsmax = this.algorithms.length;
    this.exectimes;

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
     * 
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
     * 
     */
    function onRunMethodChange() {
        $(jobs).prop("disabled", !that.supportsWorker || $(runinui).prop("checked"));
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
                onChartClick();
                var c = new ChartUI($);
                c.sender = that;

                google.charts.setOnLoadCallback(c.drawChart());
                unBlockUI();
            };

            var s = new SortUI($);
            s.runAsWorker = $(runinthread).prop("checked") && that.supportsWorker;
            s.workerCount = parseInt($(jobs).val());
            s.sample = parseInt($(samplecount).val());
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
        $("span#status").addClass("hidden");
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

    // if browser provides # of CPU cores
    if (navigator.hardwareConcurrency) {
        jobsmax = Math.min(navigator.hardwareConcurrency, this.algorithms.length);
    }
    $(jobs).prop("max", jobsmax);
    $(jobs).val(jobsmax);

    $(runinthread).prop("disabled", !this.supportsWorker);
    $(runinthread).prop("checked", this.supportsWorker);

    // handle the UI events
    $(itemcount).on("input", onRangeChange);
    $(samplecount).on("input", onRangeChange);
    $(runinthread).on("input", onRunMethodChange);
    $(runinui).on("input", onRunMethodChange);
    $("#btnSort").on("click", onSortClick);
    $("#btnBack").on("click", onBackClick);
    $("#btnChart").on("click", onChartClick);

    // init the UI events
    $(runinui).trigger("input");
    $(itemcount).trigger("input");
    $(samplecount).trigger("input");

}

var ui = new DemoUI(jQuery);