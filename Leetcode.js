// Leetcode 26. Remove Duplicates from Sorted Array
/**
 * @param {number[]} nums
 * @return {number}
 Input: nums = [0,0,1,1,1,2,2,3,3,4]
Output: 5, nums = [0,1,2,3,4,_,_,_,_,_]
Explanation: Your function should return k = 5, with the first five elements of nums being 0, 1, 2, 3, and 4 respectively.
It does not matter what you leave beyond the returned k (hence they are underscores).
 */
var removeDuplicates = function(nums) {
    const numSet= new Set(nums);
    const unique= [...numSet];
    for (let i=0;i<unique.length;i++){
   nums[i]=unique[i];
       

    }
    for (let i=unique.length;i<nums.length;i++){
       
        nums[i]='_';
    }
    return numSet.size;
   
};
//leetcode 28. Find the Index of the First Occurrence in a String
/**
 * @param {string} haystack
 * @param {string} needle
 * @return {number}
 Input: haystack = "sadbutsad", needle = "sad"
Output: 0
Explanation: "sad" occurs at index 0 and 6.
The first occurrence is at index 0, so we return 0.
 */

   var strStr = function(haystack, needle) {
        if (haystack.includes(needle)){
         return haystack.indexOf(needle);
        }
        else return -1;

    };

