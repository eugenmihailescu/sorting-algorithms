"use strict";
/**
 * Sort the array elements by selection sort method.
 * 
 * Time complexity: O(n^2)
 * 
 * @author Eugen Mihailescu <eugenmihailescux@gmail.com>
 * @license {@link https://www.gnu.org/licenses/gpl-3.0.txt|GPLv3}
 * @version 1.0
 * 
 * @class
 * @param {function|boolean=}
 *            compare - When a function is provided then it is used for comparing the items. When a boolean `true` is provided
 *            the array is sorted descendently. Otherwise (default) ascedent order is assumed.
 * 
 * @see https://en.wikipedia.org/wiki/Selection_sort
 */
Array.prototype.selectionsort = function(compare) {
    if ("function" != typeof compare) {
        var desc = compare || false;
        compare = function(a, b) {
            return desc ? a < b : a > b;
        }
    }

    var that = this;
    /**
     * Swap two elements by the given index within the current array
     * 
     * @since 1.0
     * @param {int}
     *            i - The first item's index
     * @param {int}
     *            j - The second item's index
     * 
     */
    function swap(i, j) {
        var temp = that[i];
        that[i] = that[j];
        that[j] = temp;
    }

    /**
     * Get the position of the minimum|maximum value starting with a given element
     * 
     * @since 1.0
     * @param {int}
     *            start - The start index
     * @returns {int}
     */
    function minmax(start) {
        var m = that[start], p = start;
        for (var i = start + 1; i < that.length; i += 1) {
            if (compare(m, that[i])) {
                m = that[i];
                p = i;
            }
        }
        return p;
    }

    // sort the array
    for (var i = 0; i < that.length; i += 1) {
        swap(i, minmax(i));
    }

    return this;
};