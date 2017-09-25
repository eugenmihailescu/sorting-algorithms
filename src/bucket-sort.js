"use strict";
/**
 * Sort the array elements by bucket sort method.
 * 
 * Time complexity: between O(N+k) and O(n^2)
 * 
 * @author Eugen Mihailescu <eugenmihailescux@gmail.com>
 * @license {@link https://www.gnu.org/licenses/gpl-3.0.txt|GPLv3}
 * @version 1.0
 * 
 * @class
 * @param {int=}
 *            size - The number of buckets to use. Default to array length.
 * @param {function|boolean=}
 *            compare - When a function is provided then it is used for comparing the items. When a boolean `true` is provided
 *            the array is sorted descendently. Otherwise (default) ascedent order is assumed.
 * 
 * @see https://en.wikipedia.org/wiki/Bucket_sort
 */
Array.prototype.bucketsort = function(size, compare) {
    if ("function" != typeof compare) {
        var desc = compare || false;
        compare = function(a, b) {
            return desc ? a < b : a > b;
        }
    }

    if ("undefined" != typeof console) {
        var msg = "Array.prototype.insertionsort not defined. Please include insertion-sort.js";
        console.assert("insertionsort" in Array.prototype, msg);
    }

    size = size || this.length >> 4 || 5;

    var i, j, k = 0, bucketindex, range, buckets = [];

    var min = this.length ? this[0] : null;
    var max = min;

    // find the min/max, ie. the buckets' range
    for (i = 1; i < this.length; i += 1) {
        if (compare(min, this[i])) {
            min = this[i];
        }
        if (compare(this[i], max)) {
            max = this[i];
        }
    }
    range = (max - min) / size + 1;

    // create the emtpy buckets
    while (buckets.push([]) < range)
        ;

    // scatter the array's items into buckets
    for (i = 0; i < this.length; i += 1) {
        bucketindex = Math.floor((this[i] - min) / size);
        buckets[bucketindex].push(this[i]);
    }

    // sort the buckets then place them into the array
    for (i = 0; i < range; i += 1) {
        buckets[i].insertionsort(compare);

        for (j = 0; j < buckets[i].length; j += 1) {
            this[k++] = buckets[i][j];
        }
    }

    return this;
}