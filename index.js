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





