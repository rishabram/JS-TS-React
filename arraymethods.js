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

const array1 = ["a", "b", "c", "d", "e"];
console.log(array1.myCopyWithin(0, 3, 4));
console.log(array1.myCopyWithin(1,3))
console.log([1, 2, 3, 4, 5].myCopyWithin(0, 3));
console.log([1, 2, 3, 4, 5].myCopyWithin(0, 3, 4));
console.log([1, 2, 3, 4, 5].myCopyWithin(-2, -3, -1));


