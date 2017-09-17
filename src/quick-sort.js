/**
 * Sort the array elements by quick sort method.
 * 
 * Time complexity: between O(n*log(n)) and O(n^2)
 * 
 * @version 1.0
 * @param {bool}
 *            desc - When true then sort the array in descendent order, otherwise in ascendent order
 * 
 * @author Eugen Mihailescu
 * @see https://en.wikipedia.org/wiki/Quicksort
 */
Array.prototype.quicksort = function(desc) {
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

        var pivot = that[Math.floor((right + left) / 2)], i = left, j = right;

        while (i <= j) {

            while ((desc && that[i] > pivot) || (!desc && that[i] < pivot)) {
                i++;
            }

            while ((desc && that[j] < pivot) || (!desc && that[j] > pivot)) {
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