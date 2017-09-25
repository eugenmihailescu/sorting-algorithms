"use strict";
/**
 * Sort the array elements by pigeonhole sort method.
 * 
 * Time complexity: between O(N+k)
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

    var i, j = 0, holeindex, range, holes = [];
    var min = this.length ? this[0] : null;
    var max = min;

    for (i = 1; i < this.length; i += 1) {
        if (compare(min, this[i])) {
            min = this[i];
        }
        if (compare(this[i], max)) {
            max = this[i];
        }
    }
    range = max - min + 1;

    while (holes.push([]) < range)
        ;

    for (i = 0; i < this.length; i += 1) {
        holeindex = this[i] - min;
        holes[holeindex].push(this[i]);
    }

    for (i = 0; i < range; i += 1) {
        while (holes[i].length) {
            this[j++] = holes[i].pop();
        }
    }
}