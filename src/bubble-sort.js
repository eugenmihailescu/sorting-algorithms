"use strict";
/**
 * Sort the array elements by bubble sort method.
 * 
 * Time complexity: between O(n-1) and O(n(n-1)/2)
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
 * @see https://en.wikipedia.org/wiki/Bubble_sort
 */
Array.prototype.bubblesort = function(compare) {
    if ("function" != typeof compare) {
        var desc = compare || false;
        compare = function(a, b) {
            return desc ? a < b : a > b;
        }
    }

    var that = this;
    var max = that.length;

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
     * Sort the current array
     * 
     * @since 1.0
     * @param {int}
     *            max - Sort only the first max elements
     * @returns {bool} - Returns true if at least item was swapped, false otherwise
     * 
     */
    function sort(max) {
        var sorted = false;

        for (var i = 1; i <= max; i += 1) {
            if (compare(that[i - 1], that[i])) {
                swap(i - 1, i);
                sorted = true;
            }
        }
        return sorted;
    }

    // sort cyclically the current array until it's sorted
    while (sort(max -= 1))
        ;

    return this;

};