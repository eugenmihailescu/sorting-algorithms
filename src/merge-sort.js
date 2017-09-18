/**
 * Sort the array elements by merge sort method.
 * 
 * Time complexity: O(n*log(n))
 * 
 * @version 1.0
 * @param {bool}
 *            desc - When true then sort the array in descendent order, otherwise in ascendent order
 * @author Eugen Mihailescu
 * @see https://en.wikipedia.org/wiki/Merge_sort
 */
Array.prototype.mergesort = function(desc) {
    desc = desc || false;
    var that = this;

    /**
     * Combine two sorted array by merging their elements in a sorted maner
     * 
     * @since 1.0
     * @param {array}
     *            left - The first array
     * @param {array}
     *            right - The second array
     * @returns {array} - Returns an array of the emerged input arrays
     */
    function merge(left, right) {
        var result = [];

        var il = 0, ir = 0;
        var llen = left.length, rlen = right.length;

        // create a new array by inserting the element of the left/right in a sorted maner
        while (il < llen && ir < rlen) {
            if ((!desc && left[il] < right[ir]) || (desc && left[il] > right[ir])) {
                result.push(left[il]);
                il += 1;
            } else {
                result.push(right[ir]);
                ir += 1;
            }
        }

        // append the remaining elements within the sorted left array, if any
        if (il < llen) {
            result = result.concat(left.slice(il));
        }
        // append the remaining elements within the sorted right array, if any
        if (ir < rlen) {
            result = result.concat(right.slice(ir));
        }

        return result;
    }

    /**
     * Sort the given array
     * 
     * @since 1.0
     * @param{array} array - The input array to sort
     * @returns {array} - Return the sorted array
     */
    function sort(array) {
        var max = array.length;

        if (max <= 1) {
            return array;
        }

        var mid = max >> 1;

        // sort the left slice
        var left = sort(array.slice(0, mid));

        // sort the right slice
        var right = sort(array.slice(mid, max));

        // merge the sorted slices
        return merge(left, right);

    }

    return sort(this);
}