# sorting-algorithms
Classes for sorting algorithms (bubble|insertion|quick|merge)

This repository features a lightweight JavaScript implementation of the most common sorting algorithms. For convenience they extend the standard JavaScript Array prototype by adding the following functions:

- insertionsort (bool desc)
- bubblesort (bool desc)
- quicksort (bool desc)
- mergesort (bool desc)
- heapsort (bool desc)
- selectionsort (bool desc)

where the optional paramter `desc` specifies the sorting direction (when true descendent, default ascendent).

The algorithms time complexity:

| Algorithm | Best case | Worst case |Simplicity|
|-----------|-----------|------------|----------|
|Insertion  |n          |n^2         |simple    |
|BubbleSort |n-1        |n(n-1)/2    |simple    |
|QuickSort  |n*log(n)   |n^2         |complex   |
|MergeSort  |n*log(n)   |n*log(n)    |moderate  |
|HeapSort   |n*log(n)   |n*log(n)    |complx    |
|Selection  |n^2        |n*^2        |simple    |

A benchmark demo application is included. It allows comparing the performances of the sorting algorithms by displaying the results in a graph ([via Google Chart API](https://developers.google.com/chart/)).
Features:
- testing aginst randomly generated arrays (string|integer)
- allows running against various array's sizes
- allows multiple re-runs using different sample data
- allows running in parallel threads by using [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers).