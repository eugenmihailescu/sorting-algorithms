"use strict";
/**
 * Sort the array elements by pigeonhole sort method.
 * 
 * Time complexity: O(N+k)
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
 * @see https://en.wikipedia.org/wiki/Pigeonhole_sort
 */
Array.prototype.pigeonholesort = function(compare) {
    if ("function" != typeof compare) {
        var desc = compare || false;
        compare = function(a, b) {
            return desc ? a < b : a > b;
        }
    }

    var i, j, k = 0, holeindex, range, holes = [];
    var min = this.length ? this[0] : null;
    var max = min;

    // find the min/max, ie. the hole's range
    for (i = 1; i < this.length; i += 1) {
        if (compare(min, this[i])) {
            min = this[i];
        }
        if (compare(this[i], max)) {
            max = this[i];
        }
    }
    range = max - min + 1;

    // create the emtpy holes
    while (holes.push([]) < range)
        ;

    // fill the holes with our array's items
    for (i = 0; i < this.length; i += 1) {
        holeindex = this[i] - min;
        holes[holeindex].push(this[i]);
    }

    // copy the holes' content back to array
    for (i = 0; i < range; i += 1) {
        for (j = 0; j < holes[i].length; j += 1) {
            this[k++] = holes[i][j];
        }
    }

    return this;
}