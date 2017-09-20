/**
 * Binary Heap class
 * 
 * @author Eugen Mihailescu <eugenmihailescux@gmail.com>
 * @license {@link https://www.gnu.org/licenses/gpl-3.0.txt|GPLv3}
 * @version 1.0
 * 
 * @class
 * @param {array|object=}
 *            list - The initial list to populate the heap
 * @see {@link BinaryHeap.prototype.compare}
 */
function BinaryHeap(list, undefined) {
    // /////////// private /////////////
    var that = this;

    /**
     * Validates the index against the heap
     * 
     * @since 1.0
     * @params {int} index - The node's index
     * @returns {int} If valid index is given then just returns the given index, otherwise -1
     */
    function sanitizeIndex(index) {
        return index > -1 && index < that.heap.length ? index : -1;
    }

    /**
     * Down-top heapify
     * 
     * @since 1.0
     * @params {int} index - The index of the item to heap-up
     * @returns {int} Returns the new position of the index
     */
    function heapUp(index) {
        var value = that.heap[index];
        var parent = that.parentNode(index);

        while (parent >= 0 && that.compare(value, that.heap[parent])) {
            index = that.swap(index, parent);
            var parent = that.parentNode(index);
        }

        return index;
    }

    // /////////// privileged /////////////
    this.heap;

    /**
     * Initialize the heap
     */
    this.init = function() {
        that.heap = [];
    };

    /**
     * Get the parent node's index of the node given by the index
     * 
     * @since 1.0
     * @params {int} index - The node's index
     * @returns {int} Returns the index of the parent node
     */
    this.parentNode = function(index) {
        return Math.floor(index - 1 >> 1);
    };

    /**
     * Get the left child index of a node given by index
     * 
     * @since 1.0
     * @params {int} index - The node's index
     * @returns {int} - If found returns the index of the left child of index, otherwise -1
     */
    this.leftChildIndex = function(index) {
        return sanitizeIndex(1 + (index << 1));
    };

    /**
     * Get the right child index of a node given by index
     * 
     * @since 1.0
     * @params {int} index - The node's index
     * @returns {int} If found returns the index of the right child of index, otherwise -1
     */
    this.rightChildIndex = function(index) {
        return sanitizeIndex(2 + (index << 1));
    };

    /**
     * Get the sibling child index of a node given by index
     * 
     * @since 1.0
     * @params {int} index - The node's index
     * @returns {int} - If found returns the sibling index, otherwise -1
     */
    this.siblingIndex = function(index) {
        return sanitizeIndex(index + (index & 1 ? 1 : -1));
    };

    /**
     * Get the index of the maximum value
     * 
     * @since 1.0
     * @returns {int} - If found returns the max item's index, otherwise -1
     */
    this.maxIndex = function() {
        return sanitizeIndex(0);
    };

    /**
     * Get the value of the maximum value
     * 
     * @since 1.0
     * @returns {object} - If found returns the node's value, otherwise null
     */
    this.maxValue = function() {
        var index = that.maxIndex();

        if (index < 0) {
            return null;
        }

        return that.heap[index];
    };

    /**
     * Swap two nodes of the heap
     * 
     * @since 1.0
     * @params {int} from - The old index
     * @params {int} to - The new index
     * @returns {int} - Returns the new index of the `from` node
     */
    this.swap = function(from, to) {
        var tmp = that.heap[from];
        that.heap[from] = that.heap[to];
        that.heap[to] = tmp;

        return to;
    };

    /**
     * Top-down heapify
     * 
     * @since 1.0
     * @params {int} index - The index of the item to heap-down
     * @returns {int} Returns the new position of the index
     */
    this.heapDown = function(index) {
        var leftChild = that.leftChildIndex(index);

        if (sanitizeIndex(leftChild) < 0)
            return index;

        var rightChild = that.rightChildIndex(index), hasRightChild = sanitizeIndex(rightChild) > -1, newIndex = -1;

        // node given by index is greater than its children
        if (that.compare(that.heap[index], that.heap[leftChild])
                && (!hasRightChild || that.compare(that.heap[index], that.heap[rightChild]))) {
            return index;
        }

        // find the greatest children
        if (!hasRightChild || that.compare(that.heap[leftChild], that.heap[rightChild])) {
            newIndex = leftChild;
        } else if (hasRightChild) {
            newIndex = rightChild;
        }

        if (newIndex < 0) {
            return index;
        }

        that.swap(index, newIndex);

        return that.heapDown(newIndex);
    };

    /**
     * Adds a new item to the head
     * 
     * @since 1.0
     * @params {object} value - The item's value
     * @returns {int} - The index of the newly added item
     */
    this.add = function(value) {
        var index = that.heap.push(value) - 1;

        if (!that.heap.length) {
            return index;
        }

        return heapUp(index);
    };

    /**
     * Removes the node given by index
     * 
     * @since 1.0
     * @params {int} index - The node's index to remove
     * @returns {int} Returns the value of the removed item on success, undefined otherwise.
     */
    this.remove = function(index) {
        var lastIndex = that.heap.length - 1;

        // remove last node
        if (index == lastIndex) {
            return that.heap.pop();
        }

        // remove an arbitrary node
        if (sanitizeIndex(index) > -1) {
            that.swap(index, lastIndex);
            var value = that.remove(lastIndex);
            that.heapDown(index);

            return value;
        }

        return undefined;
    };

    /**
     * Build the heap from the given list
     * 
     * @since 1.0
     * @params {object|array=} list - The list which values will build-up the heap. Null allowed.
     * @returns {array} - Returns the heap array
     */
    this.assign = function(list) {
        list = list || null;
        if (null === list) {
            that.init();
            return;
        }
        if ("object" === typeof list) {
            for ( var i in list) {
                if (list.hasOwnProperty(i)) {
                    that.add(list[i]);
                }
            }
        } else {
            throw "The function expects either an Array or an ObjectX";
        }
    };

    this.init();
    this.assign(list);
}

/**
 * The heap elements compare function. Default compares elements based on their natural order.
 * 
 * @since 1.0
 * @params {object} a - The first element
 * @params {object} b - The second element
 * @returns {bool} - Returns true if a > b, false otherwise
 */
BinaryHeap.prototype.compare = function(a, b) {
    return a > b;
}