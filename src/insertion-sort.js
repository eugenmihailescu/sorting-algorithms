/**
 * Sort the array elements by insertion sort method.
 * 
 * Time complexity: between O(n) and O(n^2)
 * 
 * @version 1.0
 * @param {bool}
 *            desc - When true then sort the array in descendent order, otherwise in ascendent order
 * 
 * @author Eugen Mihailescu
 * @see https://en.wikipedia.org/wiki/Insertion_sort
 */
Array.prototype.insertionsort = function(desc) {
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

    // sort the array
    for (var i = 1; i < this.length; i += 1) {
        var j = i;
        while (j > 0 && ((desc && this[j - 1] < this[j]) || (!desc && this[j - 1] > this[j]))) {
            swap(j - 1, j);
            j -= 1;
        }
    }

    return this;
}