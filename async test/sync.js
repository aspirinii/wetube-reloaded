console.log('1. Start');

const asyncOperation = () => {
    setTimeout(() => {
        console.log('2. Inside asynchronous operation');
    }, 3000);
    console.log('3. Inside asynchronous operation');
}

asyncOperation();

console.log('4. End');