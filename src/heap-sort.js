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
 * @param {bool}
 *            desc - When true then sort the array in descendent order, otherwise in ascendent order
 * @see https://en.wikipedia.org/wiki/Heapsort
 * @see
 */
Array.prototype.heapsort = function(desc) {
    desc = desc || false;

    var result = [], fn = desc ? "push" : "unshift";
    
    var heap = new BinaryHeap(this);

    while (heap.heap.length) {
        result[fn].call(result, heap.remove(0));
    }

    return result;
};