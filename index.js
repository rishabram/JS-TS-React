
let years=[];
console.log(years["2"] !== years["02"]);

let number1 = "Rishab";
number1=1;
console.log(typeof number1)
let dog=null;
console.log(typeof dog)
let person ={
    name: 'Rishab',
    age: 19
}

console.log(person)

person.name ='Timmy'
let selection ='name'
person[selection]='bob'
console.log(person);

const array1 = [1,2,3,4,5,6];
console.log(array1[-1]);
console.log(array1.at(-2));
array1.push(7);
array1.push("Rishab")
console.log(array1.at(-2));
console.log(array1.at(-1));
console.log(typeof array1);



const res = array1.filter((word)=>word < 5)
console.log(res)

const res1 = array1.map((x)=>x*3)
console.log(res1)

Array.prototype.myFilter = function(callbackFn){
    const filteredArr =[]
    const len = this.length;
    for (let i=0;i<len;i++){
        if (i in this){
           if (callbackFn.call(this,this[i], i)){
                filteredArr.push(this[i])
            }
        }
    }
    return filteredArr
}
const res2 = array1.myFilter((x)=> x%2 === 1)
    console.log(res2);
let digits =[1,2,3,4,5]
/**
 * @param {number[]} digits
 * @return {number[]}
 */

var plusOne = function(digits) {
    let str = digits.join("")
    let sum = parseInt(str);
    sum+=1
    str = sum.toString()
    let digArr= str.split('')
    let arr = digArr.map((str)=>parseInt(str, 10))

    return arr
};
res4 = plusOne(digits);
console.log(res4)

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
console.log(digits.myMap((x)=>x*3))

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
const animals = ["ant", "bison", "camel", "duck", "elephant"];

console.log(animals.mySplice(2));
// Expected output: Array ["camel", "duck", "elephant"]

console.log(animals.mySplice(2, 4));
// Expected output: Array ["camel", "duck"]

console.log(animals.mySplice(1, 5));
// Expected output: Array ["bison", "camel", "duck", "elephant"]

console.log(animals.mySplice(-2));
// Expected output: Array ["duck", "elephant"]

console.log(animals.mySplice(2, -1));
// Expected output: Array ["camel", "duck"]

console.log(animals.mySplice());
// Expected output: Array ["ant", "bison", "camel", "duck", "elephant"]
const myPromise = new Promise((resolve,reject)=>{
    const success = true
    if (success){
        resolve('Promise sucessfully resolved!')
    }
    else{
        reject('Promise rejected :(')
    }
});
myPromise.then((res)=>{console.log(res)})
    .catch((error)=>{console.log(error)});

const fetchData=()=>{
    return new Promise((resolve)=>setTimeout(()=>{resolve("Data Successfully fetched!");},200));
}

fetchData().then((data)=>{console.log(data)});

const arrayReducer= [5,3,3,8]
const init = 20
 const reducerRes = arrayReducer.reduce((acc,curr)=>acc+curr,init)
console.log(reducerRes)

const reducerRight = arrayReducer.reduceRight((acc,curr)=>acc-curr,init)
console.log(reducerRight)
//Create a JavaScript Promise that, after a delay of 2 seconds, either resolves with the message “Hello World” or rejects with the error message “Error occurred”.
// The outcome (resolve or reject) should be determined by a random condition, ensuring a 50/50 chance of either occurring each time the code runs.
const randomPromise = new Promise((Resolve,Reject)=>setTimeout(()=>{
    let rng = Math.floor((Math.random()*100))%2
    if (rng === 1){
         Resolve("Hello World")
    }
    else if (rng === 0){
        Reject("Error Occurred")}
    },2000
),)
randomPromise
    .then((message) => {
        console.log(message);
    })
    .catch((error) => {
        console.error(error);
    });
//Input a number, double it, increase it by 10, and then multiply by 3.
// Each operation should be in a separate Promise and then chained together.
const value = 5;
const double=(value) => new Promise((resolve)=>{resolve(value*2)
})
const addTen = (value)=> new Promise((resolve)=>{resolve(value+10)})
const multiplyByThree = (value) => new Promise((resolve)=>{resolve(value*3)})

double(value)
    .then(addTen)
    .then(multiplyByThree)
    .then((result) => {
        console.log(result);
    });


let years=[];
console.log(years["2"] !== years["02"]);

let number1 = "Rishab";
number1=1;
console.log(typeof number1)
let dog=null;
console.log(typeof dog)
let person ={
    name: 'Rishab',
    age: 19
}

console.log(person)

person.name ='Timmy'
let selection ='name'
person[selection]='bob'
console.log(person);

const array1 = [1,2,3,4,5,6];
console.log(array1[-1]);
console.log(array1.at(-2));
array1.push(7);
array1.push("Rishab")
console.log(array1.at(-2));
console.log(array1.at(-1));
console.log(typeof array1);



const res = array1.filter((word)=>word < 5)
console.log(res)

const res1 = array1.map((x)=>x*3)
console.log(res1)

Array.prototype.myFilter = function(callbackFn){
    const filteredArr =[]
    const len = this.length;
    for (let i=0;i<len;i++){
        if (i in this){
           if (callbackFn.call(this,this[i], i)){
                filteredArr.push(this[i])
            }
        }
    }
    return filteredArr
}
const res2 = array1.myFilter((x)=> x%2 === 1)
    console.log(res2);
let digits =[1,2,3,4,5]
/**
 * @param {number[]} digits
 * @return {number[]}
 */

var plusOne = function(digits) {
    let str = digits.join("")
    let sum = parseInt(str);
    sum+=1
    str = sum.toString()
    let digArr= str.split('')
    let arr = digArr.map((str)=>parseInt(str, 10))

    return arr
};
const res4 = plusOne(digits);
console.log(res4)

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
console.log(digits.myMap((x)=>x*3))

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
const animals = ["ant", "bison", "camel", "duck", "elephant"];

console.log(animals.mySplice(2));
// Expected output: Array ["camel", "duck", "elephant"]

console.log(animals.mySplice(2, 4));
// Expected output: Array ["camel", "duck"]

console.log(animals.mySplice(1, 5));
// Expected output: Array ["bison", "camel", "duck", "elephant"]

console.log(animals.mySplice(-2));
// Expected output: Array ["duck", "elephant"]

console.log(animals.mySplice(2, -1));
// Expected output: Array ["camel", "duck"]

console.log(animals.mySplice());
// Expected output: Array ["ant", "bison", "camel", "duck", "elephant"]


const arrayReducer= [5,3,3,8]
const init = 20
 const reducerRes = arrayReducer.reduce((acc,curr)=>acc+curr,init)
console.log(reducerRes)

const reducerRight = arrayReducer.reduceRight((acc,curr)=>acc-curr,init)
console.log(reducerRight)
const myPromise = new Promise((resolve,reject)=>{
    const success = true
    if (success){
        resolve('Promise sucessfully resolved!')
    }
    else{
        reject('Promise rejected :(')
    }
});
myPromise.then((res)=>{console.log(res)})
    .catch((error)=>{console.log(error)});

const fetchData=()=>{
    return new Promise((resolve)=>setTimeout(()=>{resolve("Data Successfully fetched!");},200));
}

fetchData().then((data)=>{console.log(data)});
//Create a JavaScript Promise that, after a delay of 2 seconds, either resolves with the message “Hello World” or rejects with the error message “Error occurred”.
// The outcome (resolve or reject) should be determined by a random condition, ensuring a 50/50 chance of either occurring each time the code runs.
const randomPromise = new Promise((Resolve,Reject)=>setTimeout(()=>{
    let rng = Math.floor((Math.random()*100))%2
    if (rng === 1){
         Resolve("Hello World")
    }
    else if (rng === 0){
        Reject("Error Occurred")}
    },2000
),)
randomPromise
    .then((message) => {
        console.log(message);
    })
    .catch((error) => {
        console.error(error);
    });

//Input a number, double it, increase it by 10, and then multiply by 3.
// Each operation should be in a separate Promise and then chained together.
const value = 5;
const double=(value) => new Promise((resolve)=>{resolve(value*2)
})
const addTen = (value)=> new Promise((resolve)=>{resolve(value+10)})
const multiplyByThree = (value) => new Promise((resolve)=>{resolve(value*3)})

double(value)
    .then(addTen)
    .then(multiplyByThree)
    .then((result) => {
        console.log(result);
    });


import { useState } from "react";

function App() {
    const URL = "https://akabab.github.io/starwars-api/api/all.json";
    const [roster, setRoster] = useState([]);
    async function handleAdd() {
        const res = await fetch(URL);
        const data = await res.json();

        console.log(data);
        const newChars = data.filter((char) => !roster.includes(char.name));

        const index1 = Math.floor(Math.random() * newChars.length);

        const char = newChars[index1];
        setRoster([...roster, char.name]);
        console.log(roster);
    }
    function handleDelete(index) {
        setRoster(roster.filter((notUsed, i) => i !== index));
    }
    return (
        <div>
            <h1>Star Wars</h1>
            <button onClick={handleAdd}>Click for Random Star Wars Charcter</button>
            <h2>Charcters: </h2>
            {roster.map((char, index) => (
                <li
                    key={index}
                    onClick={() => {
                        handleDelete(index);
                    }}
                >
                    {char}
                </li>
            ))}
        </div>
    );
}
export default App;


// Added .at() method from array handling positive and negative indices and array out of bounds
myAtArr = [59,2]
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
console.log(myAtArr.myAt(0));
console.log(myAtArr.myAt(-1));


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

const array2 = [3, 4];
console.log(array1.myConcat(array2));
console.log(array1.myConcat(3, 4)); 
console.log(array1.myConcat(array2, 5, 6));



























