// console.log('1. Start');

// const asyncOperation = async() => {
//     await setTimeout(() => {
//         console.log('2. Inside asynchronous operation');
//     }, 3000);
//     console.log('3. Inside asynchronous operation');
// }

// asyncOperation();

// console.log('4. End');


// console.log('1. Start');

// const asyncOperation = async() => {
//     await new Promise(resolve => setTimeout(() => {
//         console.log('2. Inside asynchronous operation');
//         resolve();
//     }, 3000));
//     console.log('3. After asynchronous operation');
// }

// asyncOperation();

// console.log('4. End');


console.log('1. Start');
function normalFunction() {
    console.log('2.-----');
    return new Promise((resolve) => {
        console.log('3.-----');
        setTimeout(() => {
            resolve("4. Hello");
        }, 2000); // Wait for 2 seconds before resolving
    });
}
console.log('6.-----');


async function asyncCall() { // await 에 걸리면 다른거 먼저해 그전엔 내가먼저 
      console.log('7.-----'); // await 전이니 내가 먼저 
      const result = await normalFunction(); // await 만났으니 이함수 외 를 먼저해 그다음 이 함수를 실행해
      console.log('8.-----');
      console.log(result); // "Hello" will be logged after a 2-second delay
      console.log('9.-----');
    }
console.log('10.-----');
    
asyncCall();
console.log('11.-----');