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
 * @param {bool}
 *            desc - When true then sort the array in descendent order, otherwise in ascendent order
 * 
 * @see https://en.wikipedia.org/wiki/Selection_sort
 */
Array.prototype.selectionsort = function(desc) {
    desc = desc || false;

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
     * @params {int} start - The start index
     * @returns {int}
     */
    function minmax(start) {
        var m = that[start], p = start;
        for (var i = start + 1; i < that.length; i += 1) {
            if ((!desc && that[i] < m) || (desc && that[i] > m)) {
                m = that[i];
                p = i;
            }
        }
        return p;
    }

    // sort the array
    for (i = 0; i < that.length; i += 1) {
        swap(i, minmax(i));
    }

    return this;
};