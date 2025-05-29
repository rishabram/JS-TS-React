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
/** 2635. Apply Transform Over Each Element in Array
 * @param {number[]} arr
 * @param {Function} fn
 * @return {number[]}
 */
var map = function(arr, fn) {
    newArr = []
    len = arr.length
    for (let i=0;i<len;i++){
        if (i in arr){
            newArr.push(fn.call(arr,arr[i],i))  
        }
    }
    return newArr
};
/** 2648. Generate Fibonacci Sequence
 * @return {Generator<number>}
 */
var fibGenerator = function*() {
   
  let current = 0; 
  let next = 1;

  while (true) {
    yield current; 

    [current, next] = [next, current + next];
  }
};

/**
 * const gen = fibGenerator();
 * gen.next().value; // 0
 * gen.next().value; // 1
 */

/** Leetcode 2665. Counter II
 * @param {integer} init
 * @return { increment: Function, decrement: Function, reset: Function }\
 I learnt the difference between pre and post incremeneting where pre incrementing uses the new value but post incrementing uses the current value
 */
var createCounter = function(init) {
    let start = init
    return {
    increment:()=>
         ++start,
    
    decrement:()=>
        --start,
    
    reset:()=>
        start = init,
    }

    
};
/** Leetcode 2677 Chunk Array
 * @param {Array} arr
 * @param {number} size
 * @return {Array}
 I was stuck on this for a while because I forgot the end index for splice isnt inclusive so it would work
 */
var chunk = function(arr, size) {
    len = arr.length
    answer=[]
    if (len===0){
        return answer
    }
        arrSize=[size]
        for (let i  =0;i<len;i+=size){
            answer.push(arr.slice(i,i+size))
            
        }   
    return answer
};
/**Leetcode 2695. Array Wrapper
 * @param {number[]} nums
 * @return {void}
 */
var ArrayWrapper = function(nums) {
    this.nums=nums
};

/**
 * @return {number}
 */
ArrayWrapper.prototype.valueOf = function() {
    let total=0
    for (let i = 0;i<this.nums.length;i++){
       total+=this.nums[i]
    }
    return total
}

/**
 * @return {string}
 */
ArrayWrapper.prototype.toString = function() {
   return "["+this.nums.toString()+"]"
    
}

/** Leetcode 2704. To Be Or Not To Be
 * const obj1 = new ArrayWrapper([1,2]);
 * const obj2 = new ArrayWrapper([3,4]);
 * obj1 + obj2; // 10
 * String(obj1); // "[1,2]"
 * String(obj2); // "[3,4]"
 * Solved using a new way i learnt to create objects in a function
 */

/**
 * @param {string} val
 * @return {Object}
 */


var expect = function(val) {
    return({
            toBe: function(value) {
                if (val === value) {
                    return true
                } else throw new Error("Not Equal");
            },
            notToBe: function(value){
                if (val !== value){
                    return true
                }
                else throw new Error("Not Equal");
            }

        }

    )

};



/**Leetcode 2715. Timeout Cancellation
 * expect(5).toBe(5); // true
 * expect(5).notToBe(5); // throws "Equal"
 */
/**
 * @param {Function} fn
 * @param {Array} args
 * @param {number} t
 * @return {Function}
 Learnt about the cancelTimeout function in window and how you need to pass in the timer id to use it but i needed a little help on this one
 */
var cancellable = function(fn, args, t) {

let timer = setTimeout(()=>{
    fn(...args)

    
},t);
return function(){
    clearTimeout(timer);
}
}
/**
 *  const result = [];
 *
 *  const fn = (x) => x * 5;
 *  const args = [2], t = 20, cancelTimeMs = 50;
 *
 *  const start = performance.now();
 *
 *  const log = (...argsArr) => {
 *      const diff = Math.floor(performance.now() - start);
 *      result.push({"time": diff, "returned": fn(...argsArr)});
 *  }
 *       
 *  const cancel = cancellable(log, args, t);
 *
 *  const maxT = Math.max(t, cancelTimeMs);
 *           
 *  setTimeout(cancel, cancelTimeMs);
 *
 *  setTimeout(() => {
 *      console.log(result); // [{"time":20,"returned":10}]
 *  }, maxT + 15)
 */

 /** Leetcode 2723. Add Two Promises
 * @param {Promise} promise1
 * @param {Promise} promise2
 * @return {Promise}
 Solved with promise chaining
 */
 var addTwoPromises = async function(promise1, promise2) {
    let sum = 0
    sum = promise1.then((value1)=>{return promise2.then((value2)=>{return value1+value2;})})
    return sum
};


/** Leetcode 2724. Sort By
 * addTwoPromises(Promise.resolve(2), Promise.resolve(2))
 *   .then(console.log); // 4
 It seems kinda simple just using the sort function but when passing a function to it and comparing the values its important to understand how the sort function uses the compare function fna - fnb to sort so if its negative then a is before 0 ,0 means its in the right place and if it positive then b is smaller than a and should come before
 */

/**
 * @param {Array} arr
 * @param {Function} fn
 * @return {Array}
 */
var sortBy = function(arr, fn) {
   
    return arr.sort((a,b)=>fn(a)-fn(b))
  
};



