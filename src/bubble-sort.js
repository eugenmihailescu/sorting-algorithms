/**
 * Sort the array elements by bubble sort method.
 * 
 * Time complexity: between O(n-1) and O(n(n-1)/2)
 * 
 * @version 1.0
 * @param {bool}
 *            desc - When true then sort the array in descendent order, otherwise in ascendent order
 * 
 * @author Eugen Mihailescu
 * @see https://en.wikipedia.org/wiki/Bubble_sort
 */
Array.prototype.bubblesort = function(desc) {
    desc = desc || false;

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
            if ((desc && that[i - 1] < that[i]) || (!desc && that[i - 1] > that[i])) {
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