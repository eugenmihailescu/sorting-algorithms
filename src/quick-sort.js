"use strict";
/**
 * Sort the array elements by quick sort method.
 * 
 * Time complexity: between O(n*log(n)) and O(n^2)
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
 * @see https://en.wikipedia.org/wiki/Quicksort
 */
Array.prototype.quicksort = function(compare) {
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
     * Sort the array
     * 
     * @since 1.0
     * @param {int}
     *            left - The left boundary of the partition
     * @param {int}
     *            left - The right boundary of the partition
     * @returns {int} Returns the pivot position
     */
    function partition(left, right) {
        var pivot = that[right + left >> 1], i = left, j = right;

        while (i <= j) {

            while (compare(pivot, that[i])) {
                i++;
            }

            while (compare(that[j], pivot)) {
                j--;
            }

            if (i <= j) {
                swap(i, j);
                i++;
                j--;
            }
        }

        return i;
    }

    /**
     * Choose a pivot element then rearange (by swapping) around it the elements smaller/greater than it
     * 
     * @since 1.0
     * @param {int}
     *            left - The left boundary of the partition
     * @param {int}
     *            left - The right boundary of the partition
     * @returns {array} - Return the current sorted array
     */
    function sort(left, right) {
        if (left < right) {
            var pivot = partition(left, right);

            sort(left, pivot - 1);
            sort(pivot, right);
        }
    }

    sort(0, this.length - 1);

    return this;

};