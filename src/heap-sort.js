"use strict";
/**
 * Sort the array elements by heap sort method.
 * 
 * Time complexity: O(n*log(n))
 * 
 * @author Eugen Mihailescu <eugenmihailescux@gmail.com>
 * @license {@link https://www.gnu.org/licenses/gpl-3.0.txt|GPLv3}
 * @version 1.0
 * 
 * @class
 * @param {function|boolean=}
 *            compare - When a function is provided then it is used for comparing the items. When a boolean `true` is provided
 *            the array is sorted descendently. Otherwise (default) ascedent order is assumed.
 * @see https://en.wikipedia.org/wiki/Heapsort
 * @see https://github.com/eugenmihailescu/sorting-algorithms/blob/master/src/binary-heap.js
 */
Array.prototype.heapsort = function(compare) {
    var result = [];

    var heap = new BinaryHeap(this, true);

    if ("undefined" != typeof compare) {
        if ("function" != typeof compare) {
            var desc = compare || false;

            compare = function(a, b) {
                if (desc)
                    return a < b;
                else
                    return a > b;
            }
        }
    } else {
        compare = heap.compare;
    }

    heap.compare = compare;
    heap.build();

    while (heap.heap.length) {
        result.unshift(heap.remove(0));
    }

    return result;
};