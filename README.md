# sorting-algorithms
Classes for sorting algorithms (bubble|insertion|quick|merge)

This repository features a lightweight JavaScript implementation of the most common sorting algorithms. For convenience they extend the standard JavaScript Array prototype by adding the following functions:

- insertionsort (bool desc)
- bubblesort (bool desc)
- quicksort (bool desc)
- mergesort (bool desc)

where the optional paramter `desc` specifies the sorting direction (when true descendent, default ascendent).

The algorithms time complexity:

| Algorithm | Best case | Worst case |Simplicity|
|-----------|-----------|------------|----------|
|Insertion  |n          |n^2         |simple    |
|BubbleSort |n-1        |n(n-1)/2    |simple    |
|QuickSort  |n*log(n)   |n^2         |complex   |
|MergeSort  |n*log(n)   |n*log(n)    |moderate  |
