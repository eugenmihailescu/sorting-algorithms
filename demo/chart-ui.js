"use strict";
/**
 * Generates the benchmark performance chart by Google Chart API
 * 
 * @author Eugen Mihailescu <eugenmihailescux@gmail.com>
 * @license {@link https://www.gnu.org/licenses/gpl-3.0.txt|GPLv3}
 * @version 1.0
 * 
 * @class
 * @param {object} $ -
 *            A reference to jQuery
 */
function ChartUI($) {
    var that = this;

    var maxBarSeries = 5;

    this.sender = null;
    this.minSample = $("input#minsample").val();
    this.maxSample = $("input#maxsample").val();

    this.exclude = [];

    /**
     * Create the option box on the right of the graph
     * 
     * @returns {object} Returns the DOM element, false on error
     */
    function createOptionBox() {
        var updateExclude = function() {
            var algo = $(this).data("algo");
            var index = that.exclude.indexOf(algo);

            if ($(this).is(':checked')) {
                if (index > -1) {
                    that.exclude.splice(index, 1);
                }
            } else if (index < 0) {
                that.exclude.push(algo);
            }
        };
        var onChecked = function() {
            updateExclude.call(this);

            that.minSample = $("input#minsample").val();
            that.maxSample = $("input#maxsample").val();

            that.drawChart();
        };

        if (that.sender.exectimes.length) {
            var div = $("#chart_div_algo");
            var table = div.find("table");
            var chk_sel = 'input[type=checkbox]';

            for ( var i in that.sender.exectimes[0]) {
                if (that.sender.exectimes[0].hasOwnProperty(i)) {
                    if (!table.find(chk_sel + '[data-algo=' + i + ']').length) {
                        var id = "show_" + i;
                        var tr = $("<tr></tr>").appendTo(table);
                        var td = $("<td></td>").appendTo(tr);
                        $('<input id="' + id + '" type="checkbox" checked="checked" data-algo="' + i + '">').appendTo(td)
                                .off("change").on("change", onChecked);
                        td = $("<td></td>").appendTo(tr);
                        $('<label for="' + id + '"></label>').appendTo(td).text(getAlgorithmByName(i));
                    }
                }
            }

            $.each(table.find(chk_sel), function(key, el) {
                updateExclude.call(el);
            });

            return div;
        }

        return false;
    }

    /**
     * Check if a specific algoritm should be excluded
     * 
     * @param {string}
     *            algo - The algorithm name
     * @returns {bool} - Returns true is excluded, false otherwise
     */
    function algoExcluded(algo) {
        return that.exclude.indexOf(algo) > -1;
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
        for (var i = 0; i < that.sender.algorithms.length; i += 1) {
            if (name == that.sender.algorithms[i][0]) {
                result = that.sender.algorithms[i][1];
                break;
            }
        }

        return result;
    }

    /**
     * Get the algorithm's colors
     * 
     * @param {string}
     *            name - A specific algoritm name. When specified returns only its color.
     * @returns {string|array} - When name is specified then return the algorithm's color. When not specified or false then
     *          returns the colors of all algorithms.
     */
    function getAlgoritmColor(name) {
        name = name || false;
        var result = [];

        if (that.sender.exectimes.length) {
            for ( var i in that.sender.exectimes[0])
                if (that.sender.exectimes[0].hasOwnProperty(i)) {
                    if (!name) {
                        if (!algoExcluded(i)) {
                            result.push(getAlgoritmColor(i));
                        }
                    } else if (name == i) {
                        for (var j = 0; j < that.sender.algorithms.length; j += 1) {
                            if (i == that.sender.algorithms[j][0]) {
                                return that.sender.algorithms[j][2];
                            }
                        }

                        return false;
                    }
                }
        }

        return result;
    }

    /**
     * Check if value is within the sample range
     * 
     * @param {int}
     *            value - The value
     * @returns {bool} - Returns true if value in range, false otherwise
     */
    function inRange(value) {
        return value >= that.minSample && value <= that.maxSample;
    }

    /**
     * Get the column names in the same order as given by the first data sample series.
     * 
     * @return {object} - Returns an object with the key=column name and value=the column order
     */
    function getColumnsOrder() {
        var result = {}, c = 0;
        if (that.sender.exectimes.length) {
            // the exectimes samples are not in a specific order since the key is the algo name and not an numerical index
            // so we are going to use a fixed columns order given by the first sample, ie. exectimes[0]
            for ( var i in that.sender.exectimes[0]) {
                if (that.sender.exectimes[0].hasOwnProperty(i) && !algoExcluded(i)) {
                    result[i] = c++;
                }
            }
        }

        return result;
    }

    /**
     * Get the columns for the chart type
     * 
     * @param {string}
     *            type - The chart's type
     * @return {array}
     */
    function getColumns(type) {
        var result = [], algo;
        if ('line' == type) {
            result.push([ 'number', 'time' ]);
            if (that.sender.exectimes.length) {
                for ( var i in that.sender.exectimes[0]) {
                    if (that.sender.exectimes[0].hasOwnProperty(i) && !algoExcluded(i)) {
                        result.push([ 'number', getAlgorithmByName(i) ]);
                    }
                }
            }
        } else {
            for (var i = 0; i < that.sender.exectimes.length; i += 1) {
                if (inRange(i)) {
                    result.push('sample' + i);
                }
            }
            result.unshift('Algorithm');
            result.push({
                role : 'style'
            });

        }

        return result;
    }

    /**
     * Merge array rows into columns
     * 
     * @param {array}
     *            array
     * @param {int}
     *            colId - the index of the pivot column
     * @returns {array} -Returns the merged array
     */
    function mergeRows2Cols(array, colId) {
        var result = [], tmp = [];
        for (var i = 0; i < array.length; i += 1) {
            var key = array[i][colId];
            if (!tmp.hasOwnProperty(key)) {
                tmp[key] = [ key ];
            }
            tmp[key].push(array[i][1]);
        }
        for ( var i in tmp) {
            if (tmp.hasOwnProperty(i)) {
                result.push(tmp[i]);
            }
        }
        return result;
    }

    /**
     * Get the data for the chart by type
     * 
     * @param {string}type -
     *            The chart's type
     * @return {array}
     */
    function getData(type) {

        var rows = [], data;

        var columns = getColumns(type);

        var colOrder = getColumnsOrder();

        for (var j = 0; j < that.sender.exectimes.length; j += 1) {

        }

        if ('line' == type) {
            data = new google.visualization.DataTable();

            for (var i = 0; i < columns.length; i += 1) {
                data.addColumn(columns[i][0], columns[i][1]);
            }

            var series = [];
            for (var j = 0; j < that.sender.exectimes.length; j += 1) {
                if (!inRange(j)) {
                    continue;
                }

                var sample = [];

                for ( var i in that.sender.exectimes[j]) {
                    if (that.sender.exectimes[j].hasOwnProperty(i) && !algoExcluded(i)) {
                        sample[colOrder[i]] = that.sender.exectimes[j][i];
                    }
                }
                if (sample.length) {
                    sample.unshift(j);
                    series.push(sample);
                }
            }
            data.addRows(series);
        } else {
            var rows = [];

            for (var j = 0; j < that.sender.exectimes.length; j += 1) {
                if (!inRange(j)) {
                    continue;
                }

                for ( var i in that.sender.exectimes[j]) {
                    if (that.sender.exectimes[j].hasOwnProperty(i) && !algoExcluded(i)) {
                        rows.push([ getAlgorithmByName(i), that.sender.exectimes[j][i], getAlgoritmColor(i) ]);
                    }
                }
            }
            if (that.sender.exectimes.length > 1) {
                rows = mergeRows2Cols(rows, 0);
            }
            if (rows.length) {
                rows.unshift(columns.slice(0, rows[0].length));
            }

            data = google.visualization.arrayToDataTable(rows);
        }

        return data;
    }

    /**
     * Get the chart options
     * 
     * @returns {object}
     */
    function getOptions() {
        var wrapper = document.querySelector(".chart-wrapper");

        var swapAxis = function(options) {
            var tmp = options.hAxis;
            options.hAxis = options.vAxis;
            options.vAxis = tmp;

            return options;
        };

        var options = {
            title : 'Benchmark results (smaller = better)',
            hAxis : {
                title : 'Execution time (ms)'
            },
            vAxis : {
                title : 'Algorithm'
            },
            curveType : 'function',
            height : wrapper.clientHeight + "px",
            width : wrapper.clientWidth + "px",
            explorer : {
                actions : [ 'dragToZoom', 'rightClickToReset' ]
            },
            isStacked : true,
            colors : getAlgoritmColor()
        };

        if (1 == that.sender.exectimes.length || that.sender.exectimes.length > maxBarSeries) {
            options = swapAxis(options);

            if (1 == that.sender.exectimes.length) {
                options.legend = 'none';
            } else {
                options.hAxis.title = "Samples";
            }
        }

        if (that.sender.exectimes.length > 1 && that.sender.exectimes.length <= maxBarSeries
                && window.innerWidth > window.innerHeight) {
            options = swapAxis(options);
        }

        return options;
    }

    /**
     * Get the chart class name
     * 
     * @returns {string}
     */
    function getChartClass() {
        var chartClass = "LineChart";

        if (that.sender.exectimes.length <= maxBarSeries) {
            if (1 == that.sender.exectimes.length || window.innerWidth > window.innerHeight) {
                chartClass = "ColumnChart";
            } else {
                chartClass = "BarChart";
            }
        }

        return google.visualization[chartClass];
    }

    /**
     * Save the current SVG to file
     * 
     * @param {object}
     *            svg - The SVG element
     * @param {string=}
     *            format - The image format (svg|png). Default to `svg`.
     * @param {string=}
     *            filename - The name of the local saved file
     */
    this.saveChart = function(svg, format, filename) {
        var ce = new ChartExport(svg, $);
        ce.sender = that.sender;
        ce.exportChart(format, filename);
    };

    /**
     * Draw the graph
     */
    this.drawChart = function() {
        var chartClass = getChartClass();

        var optionBox = createOptionBox();

        optionBox.css("display", "inline-block");

        var chart_div = $('#chart_div');

        var width = window.innerWidth - optionBox.get(0).clientWidth - 20;

        chart_div.css("width", width);

        var chart = new chartClass(chart_div.get(0));

        var data = getData(that.sender.exectimes.length > maxBarSeries ? 'line' : 'bar');

        chart.draw(data, getOptions());

        $(".range-sample").css("width", $("#chart_div").css("width"));

        optionBox.css("left", width).css("display", "inline");
    };

}