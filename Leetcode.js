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
 It seems kinda simple just using the sort function but when passing a function to it and comparing the values its important to understand how the sort function uses the compare function fna - fnb to sort so if its negative then a is before 0 ,0 means its in the right place and if it positive then b is smaller than a and should come before
 */

var sortBy = function(arr, fn) {
   
    return arr.sort((a,b)=>fn(a)-fn(b))
  
};


/** Leetcode 2726. Calculator with Method Chaining
 * @param {Array} arr
 * @param {Function} fn
 * @return {Array}
 Was able to figure it out with instance variables
 */
class Calculator {
        /**
         * @param {number} value
         */
        constructor(value) {
            this.result = value;
        }

        /**
         * @param {number} value
         * @return {Calculator}
         */
        add(value){
            this.result+=value
            return this


        }

        /**
         * @param {number} value
         * @return {Calculator}
         */
        subtract(value){
             this.result -= value
            return this
        }

        /**
         * @param {number} value
         * @return {Calculator}
         */
        multiply(value) {
             this.result *= value
            return this

        }

        /**
         * @param {number} value
         * @return {Calculator}
         */
        divide(value) {
            if (value===0){
                throw new Error("Division by zero is not allowed");   
            }
            else{ this.result /= value
            return this}
        }
        /**
         * @param {number} value
         * @return {Calculator}
         */
        power(value) {
             this.result = Math.pow(this.result,value)
            return this

        }

        /**
         * @return {number}
         */
        getResult() {
            return this.result
        }
    }

/** Leetcode 2727. Is Object Empty
 * @param {Object|Array} obj
 * @return {boolean}
 I read up about and revised over the Object.keys method but was initially stuck but realized i need to use .length for arrays too
 */
var isEmpty = function(obj) {
    if (Object.keys(obj).length === 0){
        return true;
    }
    else return false;
    
};
/** Leetcode 2627 
 * @param {Function} fn
 * @param {number} t milliseconds
 * @return {Function}
 I was able to figure it out it was simialr to the implmenation i used in my note book app but i didnt need to use useRef bc it didnt need to save between render but it is essentially the same function
 */
var debounce = function(fn, t) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(()=>{fn(...args)},t)
    }
};

/** Leetcode 27 remove elements
 * const log = debounce(console.log, 100);
 * log('Hello'); // cancelled
 * log('Hello'); // cancelled
 * log('Hello'); // Logged at t=100ms
 Its not too complicated all you have to do is essentially have 2 pointers where it one has the current elemnt and k has the last element that isnt val and it moves all the elements that arent the value to the front and in place and returns the number of non-val elements
 */

/**
 * @param {number[]} nums
 * @param {number} val
 * @return {number}
 */
var removeElement = function(nums, val) {
    let k =0 
    for (let i =0;i<nums.length;i++){
        if (nums[i]!==val){
            nums[k]=nums[i]
            k++
        }}

return k
};
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var deleteDuplicates = function(head) {
    let res=head;
  
   while (head && head.next){
    if (head.val === head.next.val){
        head.next=head.next.next
    } 
    else{
        head=head.next
    }
   }
    return res
};
/** Leetcode 88. Merge Sorted Array
 * @param {number[]} nums1
 * @param {number} m
 * @param {number[]} nums2
 * @param {number} n
 * @return {void} Do not return anything, modify nums1 in-place instead.
 */
var merge = function(nums1, m, nums2, n) {
        p1=m-1
        p2=n-1
        p=m+n-1
            while (p1>=0&&p2>=0){
                if (nums1[p1]>nums2[p2]){
                    nums1[p]=nums1[p1]
                    p1--
                }
        else{
            nums1[p]=nums2[p2]
            p2--
              }
            p--
            }
        while (p2>=0){
        nums1[p]=nums2[p2]
            p2--
             p--
              }};

/** Leetcode 121. Best Time to Buy and Sell Stock
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function(prices) {
    let maxProfit=0;
    let maxPrice=0;
    for (let i=prices.length-1;i>=0;i--){
       if (prices[i]>maxPrice){
        maxPrice=prices[i];
       }
       
      if (maxPrice-prices[i]>maxProfit){
        maxProfit=maxPrice-prices[i]
      }
    }
    return maxProfit
    
};
/** Leetcode 94. Binary Tree Inorder Traversal
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[]}
 */
var inorderTraversal = function(root) {
    const res=[]
    function inorder(node){
        if (!node){
            return
        }
        inorder(node.left)
        res.push(node.val)
        inorder(node.right)

    }
    inorder(root)
    return res
    
};
/** Leetcode 100 isSameTree
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} p
 * @param {TreeNode} q
 * @return {boolean}
 */
var isSameTree = function(p, q) {
    if (!p && !q){
        return true
    }
    if ((!p || !q) || p.val!==q.val){
        return false
    }
    return (isSameTree(p.left,q.left)&&isSameTree(p.right,q.right))
    
};
/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {boolean}
 */
var isSymmetric = function(root) {

    function mirror(n1,n2){
        if (!n1 && !n2){
            return true
        }
        if (!n1 || !n2){
            return false
        }
        return (mirror(n1.left,n2.right) && mirror(n1.right,n2.left)&&(n2.val===n1.val))
    }
    return mirror(root.right,root.left)
};
/** Leetcode Max Depth
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number}
 */
var maxDepth = function(root) {
    if (root===null){
        return 0
    }
    else{
        return 1 + Math.max(maxDepth(root.left),maxDepth(root.right))
    }
};
/** Leetcode 217. Contains Duplicate
 * @param {number[]} nums
 * @return {boolean}
 */
var containsDuplicate = function(nums) {
    const numSet = new Set(nums);
    return nums.length !== numSet.size ? true : false
};
/** Leetcode 242. Valid Anagram
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
var isAnagram = function(s, t) {
return s.split('').sort().join('')===t.split('').sort().join('')
};

/** Leetcode 167. Two Sum II - Input Array Is Sorted
 * @param {number[]} numbers
 * @param {number} target
 * @return {number[]}
 */var twoSum = function(numbers, target) {
    let left=0
    let right= numbers.length - 1;
    let sum = 0;

    while(left<right){
        sum=numbers[left] + numbers[right]
        if (sum===target){
            return [left+1,right+1]
        }
        if(sum<target){
            left++
        }
        else {
            right--
        }}}
// Leetcode 1 Two Sum
var twoSum = function(nums, target) {
    elements= new Map();
    for (let i=0;i<nums.length;i++){
        let needed= target-nums[i]
        if (elements.has(needed)){
            return [i,elements.get(needed)]
        }
        elements.set(nums[i],i)

    }
};
/**
 * @param {string} s
 * @return {boolean}
 */
 var isValid = function(s) {
    opening=["(","[","{"]
    const map= [["}","{"],
        ["]","["],
        [")","("]]
    const match=new Map(map);
    let stack=[]
    for(let i=0;i<s.length;i++){
        if (opening.includes(s.at(i))){
            stack.push(s.at(i))
        }
        else{
            if (match.get(s.at(i))===stack[stack.length-1]){
                stack.pop()
            }
            else{return false}
        }
    }
    return true
};
/** Reversing a linked list
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function(head) {
   let node =null
    while(head){
       let temp=head.next
        head.next = node
        node=head   
        head=temp
    }
    return node

    
};
 /**
 * @param {number[]} arr
 * @return {number}
 */

var numOfSubarrays = function(arr) {
    let odd=0;let even=1;
    let mod=1000000007
    let totalSubArray=0;
    let currentSum=0

    for (const num of arr){
        currentSum+=num
        if (currentSum%2===0){
            totalSubArray+=odd
            even++
        }
        else{
            totalSubArray+=even
            odd++
        }
    }
return totalSubArray%mod
};
/**
 * @param {string} s
 * @return {string}
 */
var reverseWords = function(s) {
    const reverseWords = s.split(" ");
    const res = []
    for (let i=reverseWords.length-1;i>=0;i--){
        if (reverseWords[i]){
        res.push(reverseWords[i])}
    }
    return res.join(" ")
};

///Leetcode 200 Number of Islands 
/**
 * @param {character[][]} grid
 * @return {number}
 */
var numIslands = function(grid) {
    
    if(!grid){
        return 0
    }
     let rows= grid.length
    let cols= grid[0].length
    let visited = new Set();
    let islands=0
     function bfs(r,c){
        let q = []
        visited.add(`${r},${c}`)
        q.push([r,c])
         const directions = [
  { dr: 0, dc: 1 }, 
  { dr: 1, dc: 0 }, 
  { dr: 0, dc: -1 },
  { dr: -1, dc: 0 } 
];
    while (q.length>0){
        const [row,col]= q.shift()
    
        for (const dir of directions) {
        let newRow = row+dir.dr;
        let newCol = col+dir.dc;
        if(newRow>= 0 && newRow<rows && newCol >=0 && newCol<cols &&        grid [newRow][newCol]==='1'&& !visited.has(`${newRow},${newCol}`)){
            visited.add(`${newRow},${newCol}`)
            q.push([newRow,newCol])
        } 
    }
  }
    for (let r =0;r<rows;r++){
        for (let c = 0;c<cols;c++){
             if (grid[r][c]==='1' && !visited.has(`${r},${c}`)){
                bfs(r,c)
                islands+=1
             }
             visited.add(`${r},${c}`)
        }
    }
   
    return islands

};

 class NumArray:

    def __init__(self, nums: List[int]):
        self.prefixSum = [0]
        for num in nums:
             self.prefixSum.append(self.prefixSum[-1]+num)
    def sumRange(self, left: int, right: int) -> int:
        return self.prefixSum[right+1]-self.prefixSum[left]

# Your NumArray object will be instantiated and called as such:
# obj = NumArray(nums)
# param_1 = obj.sumRange(left,right)



 
 class Solution:
    def findMaxLength(self, nums: List[int]) -> int:
        prefixSum = {0:-1}
        maxSub=0
        diff=0
        for i in range(len(nums)):
            diff+=1 if nums[i]==1 else -1
            if diff in prefixSum:
                maxSub=max(maxSub,i-prefixSum[diff])
            else:
                prefixSum[diff]=i

        return maxSub

 // Leetcode 15 3sum
 class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        res =[]

        for i, a in enumerate(nums):
            if i>0 and a == nums[i-1]:
                continue
            l=i+1
            r=len(nums)-1
            while l<r:
                sum = a+nums[l]+nums[r]
                if sum>0:
                    r-=1
                elif sum<0:
                    l+=1
                else:
                    res.append([a,nums[l],nums[r]])
                    l+=1
                    while nums[l]==nums[l-1] and l<r:
                        l+=1
        return res
 // Leetcode 643. Maximum Average Subarray I
 class Solution:
    def findMaxAverage(self, nums: List[int], k: int) -> float:
        n=len(nums)
        windowSum=sum(nums[:k])
        max=windowSum
        for i in range(n-k):
            windowSum= windowSum-nums[i]+nums[i+k]
            if max<windowSum:
                max=windowSum
        return max/k
        
        
 //Leetcode 3. Longest Substring Without Repeating Characters
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
    
        seen=set()
        l=0
        longest,currLen= 0,0
        
        for r in range(len(s)):
            if s[r] not in seen:
                currLen+=1
            else:
                while s[r] in seen:
                    seen.remove(s[l])
                    l+=1
                currLen= r-l+1
            longest=max(longest,currLen)
            seen.add(s[r])
        return longest

 // Past Interview Question First Occurence of Unique Character
 def firstUniqueChar(self,s: String)-> char:
        unique={}
        for char in s:
            if char not in unique:
                unique[char]=1
            else:
                unique[char]+=1
        for char in s:
            if unique[char]==1
                return char
        return -1

 // Leetcode 238 Product of Array except itself
class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        length =len(nums)
        res=[1]*length
        prefix= 1
        for i in range(length):
            res[i]=prefix
            prefix*=nums[i]
        postfix=1
        for i in range(length -1,-1,-1):
            res[i]*=postfix
            postfix*=nums[i]
        return res
/*
This solution works because you can use a post and prefix sum to calculate the products before the index and 
the value after and use a loop to calculate them and update them to a res[] array with ones with the first pass through setting the prefix sums 
and then in the second pass multuiplying the value of the res[i] value to the post fix value
*/
//Leetcode 53 Maximum Subarray
 class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        currSum=0
        maxSub=nums[0]

        for num in nums:
            if currSum<0:
                currSum=0
            currSum+=num
            maxSub=max(maxSub,currSum)
                 
        return maxSub
/* 
This solution is solved by using a sliding window concept where you have to add to currSum if its a positive sum. Also make sure to add the
to the currSum with each iteration of num after the if statement checking if its positive or else its set to zero and then adds the iteration of num
and then do the max of a maxSub variable which is initialized to the first value of num and currSum
*/

//Leetcode 191 Bit Manipulation
 class Solution:
    def hammingWeight(self, n: int) -> int:
        res=0
        while n:
            n=n&(n-1)
            res+=1
        return res
/*
With this problem its easier simpliefied and solved by visualizing numbers in their binary form and then using a form of bit manipulation. In the answer above
I used the n=n&(n-1) which if you write it down is essentially just doing the and operation and would cut it down as long as there are ones iwth the and operation.
You can also use a bitwise operator like shift right and mod it before and add the mod to the result to get the number of ones
class Solution:
    def hammingWeight(self, n: int) -> int:
     while n:
       res=0
       res += n%2
       n>>1
     return res
*/

 //Leetcode 217 Contains Duplicate  
 class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        hashset=set()
        for n in nums:
            if n in hashset:
                return True
            hashset.add(n)
        return False
 // I had finished this problem before with javascript but finished it with a smaller python solution

 // Leetcode 242. Valid Anagram
 class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        if len(s)!= len(t):
            return False
        hashS, hashT = {},{}
        for i in range(len(s)):
            hashS[s[i]]=1+hashS.get(s[i],0)
            hashT[t[i]]=1+hashT.get(t[i],0)
        for c in s:
            if hashS[c]!=hashT.get(c,0):
                return False
        return True
 // Similar to the problem above I had solved it in javascript with a sort function and some string functions but I used hashmaps to solve it in python. For this problem you can also solve it using 
 // a Counter dictionary or just sorting it and checking equality but this solution shows the most elegant and acceptable solution
 // return Counter(s) == Counter(t)
 // or 
 // return sorted(s)== sorted(t)


 
 

            
        





            
        
 
 
 


                
            
            

            

            
            
        

           
                
                
        
                    

            
                
                
            


        
         
            

            



