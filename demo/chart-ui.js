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
     * Get the columns for the chart type
     * 
     * @param {string}type -
     *            The chart's type
     * @return {array}
     */
    function getColumns(type) {
        var result = [], algo;
        if ('line' == type) {
            result.push([ 'number', 'time' ]);
            if (that.sender.exectimes.length) {
                for ( var i in that.sender.exectimes[0]) {
                    if (that.sender.exectimes[0].hasOwnProperty(i)) {
                        result.push([ 'number', getAlgorithmByName(i) ]);
                    }
                }
            }
        } else {
            for (var i = 0; i < that.sender.exectimes.length; i += 1) {
                result.push('sample' + i);
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

        if ('line' == type) {
            data = new google.visualization.DataTable();

            for (var i = 0; i < columns.length; i += 1) {
                data.addColumn(columns[i][0], columns[i][1]);
            }

            var series = [];
            for (var j = 0; j < that.sender.exectimes.length; j += 1) {
                var sample = [ j ];

                for ( var i in that.sender.exectimes[j]) {
                    if (that.sender.exectimes[j].hasOwnProperty(i)) {
                        sample.push(that.sender.exectimes[j][i]);
                    }
                }
                series.push(sample);
            }
            data.addRows(series);
        } else {
            var rows = [], colors = [ "#3366CC", "#DC3912", "#FF9900", "#109618", "#990099", "#0099C6", "#DD4477" ], c = 0;

            for (var j = 0; j < that.sender.exectimes.length; j += 1) {
                for ( var i in that.sender.exectimes[j]) {
                    if (that.sender.exectimes[j].hasOwnProperty(i)) {
                        rows.push([ getAlgorithmByName(i), that.sender.exectimes[j][i], colors[c++] ]);
                    }
                }
            }
            if (that.sender.exectimes.length > 1) {
                rows = mergeRows2Cols(rows, 0);
            }
            rows.unshift(columns.slice(0, rows[0].length));

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

        var options = {
            title : 'Benchmark results (smaller=best)',
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
            isStacked : true
        };

        if (1 == that.sender.exectimes.length || that.sender.exectimes.length > maxBarSeries) {
            var tmp = options.hAxis;
            options.hAxis = options.vAxis;
            options.vAxis = tmp;
            if (1 == that.sender.exectimes.length) {
                options.legend = 'none';
            } else {
                options.hAxis.title = "Series";
            }
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
     * Draw the chart
     */
    this.drawChart = function() {
        var chartClass = getChartClass();

        var chart = new chartClass(document.getElementById('chart_div'));

        var data = getData(that.sender.exectimes.length > maxBarSeries ? 'line' : 'bar');

        chart.draw(data, getOptions());
    };
}