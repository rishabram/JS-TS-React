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
//Leetcode 28. Find the Index of the First Occurrence in a String
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

/** Leetcode 35. Search Insert Position
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 Input: nums = [1,3,5,6], target = 7
Output: 4
Solved using binary search and also passes requirement that its faster than O(logN)
 */
 var searchInsert = function(nums, target) {
        let left =0
        let right = nums.length-1


            while (left <= right) {
                let mid = Math.floor((left+right)/2)
                if (nums[mid]==target){
                    return mid;
                }
                else if(nums[mid]<target){
                    left = mid+1;
                }
                else right = mid-1;

               }return left
    }

