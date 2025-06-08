Array.prototype.myFilter = function(callbackFn){
    const filteredArr =[]
    const len = this.length;
    for (let i=0;i<len;i++){
        if (i in this){
            if (callbackFn.call(this,this[i], i)){

            }
        }
    }
    return filteredArr
}

Array.prototype.myMap = function(callbackFn){
    const mappedArr = []
    const len = this.length
    for (let i=0; i<len; i++){
        if (i in this){
            if (callbackFn.call(this,this[i],i)){
                mappedArr.push(callbackFn.call(this,this[i],i))
            }
        }
    }
    return mappedArr
}

Array.prototype.mySplice = function(start,end){
    let splicedArr = []
    const len = this.length
    if (start && end) {
        if (-len <= end && end < 0) {
            for (let i = start; i <end+len ;i++) {
                if (i in this) {
                    splicedArr.push(this[i])
                }}}
        else{
            for (let i = start; i < end; i++) {
                if (i in this) {
                    splicedArr.push(this[i])
                }}}
        return splicedArr
    }
    else if (end) {
        if (end>0){
            for (let i = 0; i < end; i++) {
                if (i in this) {
                    splicedArr.push(this[i])
                }}}
        else if (-len <= end && end < 0) {
            for (let i = end+len; i <len ;i++) {
                if (i in this) {
                    splicedArr.push(this[i])
                }}}
        return splicedArr
    }
    else if (start) {
        if (-len <= start && start < 0) {
            for (let i = start+len; i <len ;i++) {
                if (i in this) {
                    splicedArr.push(this[i])
                }}}
        else{
            for (let i = start; i < len; i++) {
                if (i in this) {
                    splicedArr.push(this[i])
                }}}
        return splicedArr
    }

    else {
        for (let i = 0; i < len; i++) {
            if (i in this) {
                splicedArr.push(this[i])
            }}}
    return splicedArr
}
Array.prototype.myAt= function(index){
    if (index < 0) {
        index = this.length + index;
    }
    if (index >= 0 && index < this.length) {
        return this[index];
    } else {
        return undefined;
    }
};

Array.prototype.myConcat = function(...args) {
    const newArray = [...this];
    for (let i = 0; i < args.length; i++) {
        if (Array.isArray(args[i])) {
            for (let j = 0; j < args[i].length; j++) {
                newArray.push(args[i][j]);
            }
        } else {
            newArray.push(args[i]);
        }
    }
    return newArray;
};


Array.prototype.myCopyWithin=function(target,start,end){
    len=this.length
    target = Math.max(0,Math.min(target<0 ? target+len :target,len))
    start = Math.max(0,Math.min(start<0 ? start+len :start,len))

    if (!end){

        end=len
        const copyArr=[]
        for (let i=start;i<end;i++){
            copyArr.push(this[i])
        }
        let j=0
        for (let i=target;i<len;i++){
            if (j >= copyArr.length) {

                break;

            }
            this[i]=copyArr[j]
            j++

        }
    }
    else{
        end = Math.max(0,Math.min(end<0 ? end+len :end,len))
        const copyArr=[]
        for (let i=start;i<end;i++){
            copyArr.push(this[i])
        }
        let j=0
        for (let i=target;i<len;i++){
            if (j >= copyArr.length) {

                break;

            }
            this[i]=copyArr[j]
            j++

        }
    }
    return this
}

/*
const array2 = ["a", "b", "c", "d", "e"];
console.log(array2.myCopyWithin(0, 3, 4));
console.log(array2.myCopyWithin(1,3))
console.log([1, 2, 3, 4, 5].myCopyWithin(0, 3));
console.log([1, 2, 3, 4, 5].myCopyWithin(0, 3, 4));
console.log([1, 2, 3, 4, 5].myCopyWithin(-2, -3, -1));
*/

Array.prototype.myEntries=function() {
    let currIndex = 0
    const arr = this
    return {
        [Symbol.iterator]() {
            return this;
        },
        next() {
            if (currIndex < arr.length) {
                return {value: [currIndex, arr[currIndex++]],done:false}
            } else {
                return {value: undefined,done:true}
            }

        }
    }
}

Array.prototype.myEntriesYield=function*() {
    for (let i=0;i<this.length;i++){
        yield[i,this[i]]
    }
}
/*
const array1 = ["a", "b", "c"];

const iterator1 = array1.myEntriesYield();

console.log(iterator1.next().value);
console.log(iterator1.next().value);
const a = ["a", "b", "c"];

for (const [index, element] of a.myEntriesYield()) {
    console.log(index, element);
}
const array = ["a", "b", "c"];
const arrayEntries = array.myEntries();

for (const element of arrayEntries) {
    console.log(element);
}for (const element of [, "a"].myEntries()) {
    console.log(element);
}*/
Array.prototype.myEvery=function(fn){
    for (let i= 0;i<this.length;i++){
        if (i in this){

            if(!fn.call(this,this[i],i)){

            return false}
        }

    }
    return true
}/*
const isBelowThreshold = (currentValue) => currentValue < 40;

const array1 = [1, 30, 40, 29, 10, 13];
console.log(array1.myEvery(isBelowThreshold));
function isBigEnough(element, index, array) {
    return element >= 10;
}
console.log([12, 5, 8, 130, 44].myEvery(isBigEnough));
console.log([12, 15, 18, 130, 44].myEvery(isBigEnough));
const isSubset = (array1, array2) =>
    array2.myEvery((element) => array1.includes(element));
console.log(isSubset([1, 2, 3, 4, 5, 6, 7], [5, 7, 6]));
console.log(isSubset([1, 2, 3, 4, 5, 6, 7], [5, 8, 7]));
console.log([1, , 3].myEvery((x) => x !== undefined));
console.log([1, , 3].myEvery((x) => x !== undefined));
const arrayLike = {
    length: 3,
    0: "a",
    1: "b",
    2: "c",
    3: 345,
};
console.log(
    Array.prototype.every.call(arrayLike, (x) => typeof x === "string"),
);
*/
Array.prototype.myFill=function(value,start,end){
    len=this.length

        if (!end && start  &&  (typeof end !== 'number' && isNaN(end))){
        start = Math.max(0,Math.min(start<0 ? start+len :start,len))

        end=this.length
        for (let i=start;i<end;i++){
            this[i]=value
        }
    }

    else if(!end  && !start && (typeof start !== 'number' && isNaN(start)) || (typeof end !== 'number' && isNaN(end))){
        for (let i=0;i<len;i++){
            this[i]=value
        }
    }
    else if (end && start){

        start = Math.max(0,Math.min(start<0 ? start+len :start,len))
        end = Math.max(0,Math.min(end<0 ? end+len :end,len))
        for (let i=start;i<end;i++){
            this[i]=value
        }
    }

    return this
}
/*
const array1 = [1, 2, 3, 4];
console.log(array1.myFill(0, 2, 4));

console.log(array1.myFill(5, 1));
console.log(array1.myFill(6));
console.log([1, 2, 3].myFill(4)); // [4, 4, 4]
console.log([1, 2, 3].myFill(4, 1)); // [1, 4, 4]
console.log([1, 2, 3].myFill(4, 1, 2)); // [1, 4, 3]
console.log([1, 2, 3].myFill(4, 1, 1)); // [1, 2, 3]
console.log([1, 2, 3].myFill(4, 3, 3)); // [1, 2, 3]
console.log([1, 2, 3].myFill(4, -3, -2)); // [4, 2, 3]
console.log([1, 2, 3].myFill(4, NaN, NaN)); // [1, 2, 3]
console.log([1, 2, 3].myFill(4, 3, 5)); // [1, 2, 3]
console.log(Array(3).myFill(4)); // [4, 4, 4]
const arr = new Array(3);
for (let i = 0; i < arr.length; i++) {
    arr[i] = new Array(4).fill(1); // Creating an array of size 4 and filled of 1
}
arr[0][0] = 10;
console.log(arr[0][0]); // 10
console.log(arr[1][0]); // 1
console.log(arr[2][0]); // 1
*/

Array.prototype.myFind=function(fn){
    const len=this.length
    for (let i=0;i<len;i++){
        if (i in this){

            if(fn.call(this,this[i],i,this)){

                return this[i];
            }

        }
    }
    return undefined
}/*
const array1 = [5, 12, 8, 130, 44];

const found = array1.myFind((element) => element > 10);
console.log(found);
const inventory = [
    { name: "apples", quantity: 2 },
    { name: "bananas", quantity: 0 },
    { name: "cherries", quantity: 5 },
];

function isCherries(fruit) {
    return fruit.name === "cherries";
}

console.log(inventory.myFind(isCherries));
function isPrime(element, index, array) {
    let start = 2;
    while (start <= Math.sqrt(element)) {
        if (element % start++ < 1) {
            return false;
        }
    }
    return element > 1;
}

console.log([4, 6, 8, 12].myFind(isPrime)); // undefined, not found
console.log([4, 5, 8, 12].myFind(isPrime)); // 5
*/

Array.prototype.myFindIndex=function(fn){
    const len=this.length
    for (let i=0;i<len;i++){
        if (i in this){

            if(fn.call(this,this[i],i,this)){

                return i
            }

        }
    }
    return -1
}/*
const array1 = [5, 12, 8, 130, 44];

const isLargeNumber = (element) => element > 13;

console.log(array1.myFindIndex(isLargeNumber));
function isPrime(element) {
    if (element % 2 === 0 || element < 2) {
        return false;
    }
    for (let factor = 3; factor <= Math.sqrt(element); factor += 2) {
        if (element % factor === 0) {
            return false;
        }
    }
    return true;
}

console.log([4, 6, 8, 9, 12].myFindIndex(isPrime)); // -1, not found
console.log([4, 6, 7, 9, 12].myFindIndex(isPrime)); // 2 (array[2] is 7)*/
Array.prototype.myFindLast=function(fn){
    const len=this.length
    for (let i=len-1;i>=0;i--){
        if (i in this){

            if(fn.call(this,this[i],i,this)){

                return this[i];
            }

        }
    }
    return undefined
}/*
const array1 = [5, 12, 50, 130, 44];
const found = array1.findLast((element) => element > 45);
console.log(found);
const inventory = [
    { name: "apples", quantity: 2 },
    { name: "bananas", quantity: 0 },
    { name: "fish", quantity: 1 },
    { name: "cherries", quantity: 5 },
];
const result = inventory.findLast(({ quantity }) => quantity < 2);
console.log(result);
// { name: "fish", quantity: 1 }
function isPrime(element) {
    if (element % 2 === 0 || element < 2) {
        return false;}
    for (let factor = 3; factor <= Math.sqrt(element); factor += 2) {
        if (element % factor === 0) {
            return false;
        }
    }
    return true;}
console.log([4, 6, 8, 12].findLast(isPrime)); // undefined, not found
console.log([4, 5, 7, 8, 9, 11, 12].findLast(isPrime)); // 11*/
Array.prototype.myFindLastIndex=function(fn){
    const len=this.length
    for (let i=len-1;i>=0;i--){
        if (i in this){

            if(fn.call(this,this[i],i,this)){

                return i;
            }

        }
    }
    return -1;
}
/*
const array1 = [5, 12, 50, 130, 44];
const isLargeNumber = (element) => element > 45;
console.log(array1.myFindLastIndex(isLargeNumber));
function isPrime(element) {
    if (element % 2 === 0 || element < 2) {
        return false;}
    for (let factor = 3; factor <= Math.sqrt(element); factor += 2) {
        if (element % factor === 0) {
            return false;}}
    return true;}
console.log([4, 6, 8, 12].myFindLastIndex(isPrime)); // -1, not found
console.log([4, 5, 7, 8, 9, 11, 12].myFindLastIndex(isPrime)); // 5
const numbers = [3, -1, 1, 4, 1, 5, 9, 2, 6];
const lastTrough = numbers
    .filter((num) => num > 0)
    .myFindLastIndex((num, idx, arr) => {
        // Without the arr argument, there's no way to easily access the
        // intermediate array without saving it to a variable.
        if (idx > 0 && num >= arr[idx - 1]) return false;
        if (idx < arr.length - 1 && num >= arr[idx + 1]) return false;
        return true;
    });
console.log(lastTrough); // 6*/

Array.prototype.myFlat=function(depth){
    if (!depth){
        currDepth=1
    }
    else{
    currDepth=depth }
    if (depth<=0){
        currDepth=0
    }
    const flatArr=[]
    const len=this.length
    for (let i=0;i<len;i++){
        element=this[i]
        if (i in this){
            if (Array.isArray(element) && currDepth>0){
                currDepth-=1
                const flattened=element.myFlat(currDepth);

            for (let j = 0; j < flattened.length; j++) {

                flatArr.push(flattened[j]);}

            }
            else{

                flatArr.push(element)}

            }
        }
    return flatArr}/*
const arr5 = [1, 2, , 4, 5];
console.log(arr5.myFlat()); // [1, 2, 4, 5]
const array = [1, , 3, ["a", , "c"]];
console.log(array.myFlat()); // [ 1, 3, "a", "c" ]
console.log([1, [2]].myFlat());
console.log([1, [2, [3]]].myFlat(1))
console.log([1, [2, [3]]].myFlat(2))
const arr4 = [1, 2, [3, 4, [5, 6, [7, 8, [9, 10]]]]];
console.log(arr4.myFlat(Infinity));
// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const array2 = [1, , 3, undefined, ["a", , ["d", , "e"]], null];
console.log(array2.myFlat()); // [ 1, 3, undefined, "a", ["d", empty, "e"], null ]
console.log(array2.myFlat(2)); // [ 1, 3, undefined, "a", "d", "e", null ]
const arrayLike = {
    length: 3,
    0: [1, 2],
    // Array-like objects aren't flattened
    1: { length: 2, 0: 3, 1: 4 },
    2: 5,
    3: 3, // ignored by flat() since length is 3
};
console.log(Array.prototype.myFlat.call(arrayLike));
// [ 1, 2, { '0': 3, '1': 4, length: 2 }, 5 ]
*/
Array.prototype.myFlatMap = function(callbackFn){
    const mappedArr = []
    let currDepth=1
    const len = this.length
    for (let i=0; i<len; i++){
        if (i in this){
            if (callbackFn.call(this,this[i],i)){
                mappedArr.push(callbackFn.call(this,this[i],i))
            }
        }
    }
    const flatArr = [];

    for (let i = 0; i < mappedArr.length; i++) {

        const element = mappedArr[i];

        if (Array.isArray(element)) {

            const innerLen = element.length;

            for (let j = 0; j < innerLen; j++) {
                flatArr.push(element[j])
            }
        }
        else flatArr.push(element)
    }
    return flatArr
}
/*

const arr1 = [1, 2, 1];

const result = arr1.myFlatMap((num) => (num === 2 ? [2, 2] : 1));
console.log(result);
console.log([1, 2].myFlatMap(n => [n, n]));
console.log([1, , 3].myFlatMap(n => [n]));
console.log([1, 2].myFlatMap(n => n < 2 ? [] : [n]));
const arr = [1, 2, 3, 4];

console.log(arr.myFlatMap((x) => [x, x * 2]));*/

Array.prototype.myForEach = function(fn){
    const len = this.length
    for (let i=0; i<len; i++){
        if (i in this){
            fn.call(this,this[i],i)
        }}
}
/*
const array1 = ["a", "b", "c"];
array1.myForEach((element) => console.log(element));
const ratings = [5, 4, 5];
let sum = 0;
const sumFunction = async (a, b) => a + b;
ratings.myForEach(async (rating) => {
    sum = await sumFunction(sum, rating);
});

console.log(sum);*/
/** Leetcode - 83. Remove Duplicates from Sorted List
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
Array.prototype.myIncludes= function(element,index){
    len=this.length
    if (index){
        index = Math.max(0,Math.min(index<0 ? index+len :index,len))
        for (let i = index;i<len;i++){
            if (i in this){
                if(isNaN(this[i])&&isNaN(element)){
                    return true;
                }
                if (this[i]===element){
                    return true
                }
            }
        }
    }
    else {
        for (let i = 0; i < len; i++) {
            if (i in this){
                if(isNaN(this[i])&&isNaN(element)){
                    return true;
                }
                if (this[i]===element){
                    return true
                }
            }
        }
    }
    return false
}
   /* console.log([1, 2, 3].myIncludes(4)) // false);
    console.log([1, 2, 3].myIncludes(2)); // true
    console.log([1, 2, 3].myIncludes(3, 3));//false
    console.log(    [1, 2, 3].myIncludes(3, -1)); // true
    console.log([1, 2, NaN].myIncludes(NaN)); // true
    console.log(["1", "2", "3"].myIncludes(3));// false
*/

Array.prototype.myIndexOf= function(element,index){
    len=this.length
    if (index){
        index = Math.max(0,Math.min(index<0 ? index+len :index,len))
        for (let i = index;i<len;i++){
            if (i in this){
                if (this[i]===element){
                    return i
                }
            }
        }
    }
    else {
        for (let i = 0; i < len; i++) {
            if (i in this){
                if (this[i]===element){
                    return i
                }
            }
        }
    }
    return -1
}/*
const array = [2, 9, 9];
 console.log(array.myIndexOf(2))//0
 console.log(array.myIndexOf(7)) // -1);
 console.log(array.myIndexOf(9, 2));//2
console.log(array.myIndexOf(2, -1));//-1
console.log(array.myIndexOf(2, -3));//0
console.log(array.myIndexOf(NaN));
const indices = [];
const array1 = ["a", "b", "a", "c", "a", "d"];
const element = "a";
let idx = array1.myIndexOf(element);
while (idx !== -1) {
    indices.push(idx);
    idx = array1.myIndexOf(element, idx + 1);
}
console.log(indices);
// [0, 2, 4]
function updateVegetablesCollection(veggies, veggie) {
    if (veggies.myIndexOf(veggie) === -1) {
        veggies.push(veggie);
        console.log(`New veggies collection is: ${veggies}`);
    } else {
        console.log(`${veggie} already exists in the veggies collection.`);
    }
}
const veggies = ["potato", "tomato", "chillies", "green-pepper"];
updateVegetablesCollection(veggies, "spinach");
// New veggies collection is: potato,tomato,chillies,green-pepper,spinach
updateVegetablesCollection(veggies, "spinach");
// spinach already exists in the veggies collection.
*/
Array.prototype.myJoin=function(separator){
    let joined ='';
    for (let i =0;i<this.length;i++){
        if(!this[i] || this[i]===undefined){
            joined=joined+""+","
            continue
        }
        if (!separator && separator!==""){
            separator=','
        }
        if (i===0 || separator===""){
            joined=joined+this[i];
        }
        else {
        joined=joined+separator+this[i];
        }

    }
    return joined
}/*
const elements = ["Fire", "Air", "Water"];
console.log(elements.myJoin());
console.log(elements.myJoin(""));// Expected output: "FireAirWater"
console.log(elements.myJoin("-"));// Expected output: "Fire-Air-Water"
const matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
];console.log(matrix.myJoin()); // 1,2,3,4,5,6,7,8,9
console.log(matrix.myJoin(";"));
const arr = [];
arr.push(1, [3, arr, 4], 2);
console.log(arr.myJoin(";")); // 1;3,,4;2
console.log([1, , 3].myJoin()); // '1,,3'
console.log([1, undefined, 3].myJoin()); // '1,,3'
const arrayLike = {
    length: 3,
    0: 2,
    1: 3,
    2: 4,
    3: 5, // ignored by join() since length is 3
};
console.log(Array.prototype.myJoin.call(arrayLike));// 2,3,4
console.log(Array.prototype.myJoin.call(arrayLike, "."));// 2.3.4
*/
Array.prototype.myKey=function*(){
    for (let i=0;i<this.length;i++){
        yield i
    }
}/*
const array1 = ["a", ,"b", "c"];
const iterator = array1.myKey();

for (const key of iterator) {
    console.log(key);
}
const arr = ["a", , "c"];
const denseKeys = [...arr.myKey()];
console.log(denseKeys); // [0, 1, 2]*/

Array.prototype.myLastIndexOf=function(element,index){
    len=this.length
    if (index){
        index = Math.max(0,Math.min(index<0 ? index+len :index,len))
        for (let i = index;  i>=0; i--) {
            if (i in this){
                if (this[i]===element){
                    return i
                }
            }
        }
    }
    else {
        for (let i = len-1;  i>=0; i--) {
            if (i in this){
                if (this[i]===element){
                    return i
                }
            }
        }
    }
    return -1
}
/*
const numbers = [2, 5, 9, 2]
const array = [NaN];
console.log(
numbers.myLastIndexOf(2), // 3
numbers.myLastIndexOf(7), // -1
numbers.myLastIndexOf(2, 3), // 3
numbers.myLastIndexOf(2, 2),// 0
numbers.myLastIndexOf(2, -2), // 0
numbers.myLastIndexOf(2, -1),// 3
array.myLastIndexOf(NaN) // -1
)
const indices = [];
const array1 = ["a", "b", "a", "c", "a", "d"];
const element1 = "a";
let idx = array1.myLastIndexOf(element1);
while (idx !== -1) {
    indices.push(idx);
    idx = idx > 0 ? array1.myLastIndexOf(element1, idx - 1) : -1;
}console.log(indices);// [4, 2, 0]
console.log([1, , 3].myLastIndexOf(undefined)); // -1
*/

Array.prototype.myPop=function(){
    if (!this.length){
        return undefined
    }
    let last=this[this.length-1]
    this.length=this.length-1;
    return last
}/*
/!*const myFish = ["angel", "clown", "mandarin", "sturgeon"];
const popped = myFish.myPop();
console.log(myFish); // ['angel', 'clown', 'mandarin' ]
console.log(popped); // 'sturgeon'
const arrayLike = {
    length: 3,
    unrelated: "foo",
    2: 4,
};
console.log(Array.prototype.myPop.call(arrayLike));// 4
console.log(arrayLike);// { length: 2, unrelated: 'foo' }
const plainObj = {};// There's no length property, so the length is 0
Array.prototype.myPop.call(plainObj);
console.log(plainObj);
const collection = {
    length: 0,
    addElements(...elements) {
        return [].push.call(this, ...elements);},
    removeElement() {
        return [].myPop.call(this);
    },};
collection.addElements(10, 20, 30);
console.log(collection.length); // 3
collection.removeElement();
con*!/sole.log(collection.length); // 2*/
Array.prototype.myPush=function(...elements){
    for (let i=0;i<elements.length;i++){
        this[this.length]=elements[i];
    }
return this.length
}
/*
/!*const sports = ["soccer", "baseball"];
const total = sports.myPush("football", "swimming");
console.log(sports); // ['soccer', 'baseball', 'football', 'swimming']
console.log(total); // 4
const vegetables = ["parsnip", "potato"];
const moreVegs = ["celery", "beetroot"]; // Merge the second array into the first one
vegetables.myPush(...moreVegs);
console.log(*!/vegetables);*/






