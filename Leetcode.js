// Leetcode 26. Remove Duplicates from Sorted Array
/**
 * @param {number[]} nums
 * @return {number}
 Input: nums = [0,0,1,1,1,2,2,3,3,4]
Output: 5, nums = [0,1,2,3,4,_,_,_,_,_]
Explanation: Your function should return k = 5, with the first five elements of nums being 0, 1, 2, 3, and 4 respectively.
It does not matter what you leave beyond the returned k (hence they are underscores).
Solved using the set function from javascript which doesnt allow repetions of elements and using splice to populate the unique letter array
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
Finished leetcode 28 by learning how to use Javascripts built in string function "indexOf' which returns the first occurrence of an index of a term from the documentation

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
/** Leetcode 58. Length of Last Word
 * @param {string} s
 * @return {number}
 Input: s = "luffy is still joyboy"
Output: 6
Explanation: The last word is "joyboy" with length 6.
Solved using Javascripts builtin string split function which allows you to split a string based on a chosen seperator value and also using the trim function which cuts off whitespace off both ends of a string as well as using thge .at function from array which solves the issue of not being able to use arr[-1] as its considered a string literal in the square brackets
 */
 var lengthOfLastWord = function(s) {
        const t = s.trim()
        const res = t.split(" ");
        const len = res.at(-1).length;
        return len

    };
/** Leetcode 66. Plus One
 * @param {number[]} digits
 * @return {number[]}
 Input: digits = [4,3,2,1]
Output: [4,3,2,2]
Explanation: The array represents the integer 4321.
Incrementing by one gives 4321 + 1 = 4322.
Thus, the result should be [4,3,2,2].
I was able to solve it by first using the .join array method which combined the result into a string the you convert that to an int add one to it and them using Javascripts splice method and map methods to return it as an array +1 
 */
var plusOne = function(digits) {
   let str = digits.join("")
    let sum = parseInt(str);
   sum+=1
    str = sum.toString()
    let digArr= str.split('').map(Number)
 //Playing around with it I also figured you could do the last part with the following instead of directly mapping it by Number
 // let digArr= str.split('')
 // let arr = digArr.map((str)=>parseInt(str, 10))
    return digArr
};

/** Leetcode 2619. Array Prototype Last
 * @return {null|boolean|number|string|Array|Object}
 Input: nums = [null, {}, 3]
Output: 3
Explanation: Calling nums.last() should return the last element: 3.
Solved just using the .at function from arrays because you can't use [-1] because its considered a string literal in there
 */
Array.prototype.last = function() {
    if (this.length > 0){
        return this.at(-1);
    }
   else return -1;
};
/** Leetcode 2620. Counter
 * @param {number} n
 * @return {Function} counter
 Input: 
n = 10 
["call","call","call"]
Output: [10,11,12]
Explanation: 
counter() = 10 // The first time counter() is called, it returns n.
counter() = 11 // Returns 1 more than the previous time.
counter() = 12 // Returns 1 more than the previous time.
Solved using a closer which uses an outer and inner function where the inner function uses a varibale from the outer function but still need more practice with it
 */
var createCounter = function(n) {
    let count = n
    return function() {
        return count++
        
    };
};
/** Leetcode 2621. Sleep
 * @param {number} millis
 * @return {Promise}
 Input: millis = 100
Output: 100
Explanation: It should return a promise that resolves after 100ms.
let t = Date.now();
sleep(100).then(() => {
  console.log(Date.now() - t); // 100
});
Solved using setTimeout using new Promise constructor
 */
async function sleep(millis) {
    return new Promise((resolve)=>{setTimeout(resolve,millis);})
    
}
/** Leetcode 2626. Array Reduce Transformation
 * @param {number[]} nums
 * @param {Function} fn
 * @param {number} init
 * @return {number}
 Input: 
nums = [1,2,3,4]
fn = function sum(accum, curr) { return accum + curr; }
init = 0
Output: 10
Explanation:
initially, the value is init=0.
(0) + nums[0] = 1
(1) + nums[1] = 3
(3) + nums[2] = 6
(6) + nums[3] = 10
The final answer is 10.
Solved using a reducer function and using fn param passed through
 */
var reduce = function(nums, fn, init) {
    let total = init
    for (let i=0;i<nums.length;i++){
        total = fn(total,nums[i])
    }
    return total
};
/** Leetcode 2629. Function Composition
 * @param {Function[]} functions
 * @return {Function}
 Input: functions = [x => x + 1, x => x * x, x => 2 * x], x = 4
Output: 65
Explanation:
Evaluating from right to left ...
Starting with x = 4.
2 * (4) = 8
(8) * (8) = 64
(64) + 1 = 65
Solved using the reducerRight() function 
 */
var compose = function(functions) {
    if (functions.length === 0){return function(x) {
       return x
    }}
    return functions.reduceRight(function(prevFn,nextFn) {
        return function(x) {
            return nextFn(prevFn(x))
        }
    })
};
/**
 * const fn = compose([x => x + 1, x => 2 * x])
 * fn(4) // 9
 */
/** Leetcode - 2634. Filter Elements from Array
 * @param {number[]} arr
 * @param {Function} fn
 * @return {number[]}
 */
var filter = function(arr, fn) {
    filteredArr= []
    len = arr.length
    for (let i=0;i<len;i++){
        if (i in arr){
           if (fn.call(arr,arr[i],i)){
            filteredArr.push(arr[i])
           }
        }
    }
    return filteredArr
    
};




