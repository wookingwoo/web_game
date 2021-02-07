var num1 = Math.ceil(Math.random() * 9);
var num2 = Math.ceil(Math.random() * 9);
var result = num1 * num2;

var word = document.createElement('div');
word.textContent = String(num1) + ' X ' + String(num2) + ' = ';
document.body.append(word);
var form = document.createElement('form');
document.body.append(form);
var input_answer = document.createElement('input');
input_answer.type = 'number';
form.append(input_answer);
var button = document.createElement('button');
button.textContent = '입력!';
form.append(button);
var result_div = document.createElement('div');
document.body.append(result_div);

form.addEventListener('submit', function 콜백함수(e) {
    e.preventDefault();
    if (result === Number(input_answer.value)) {
        result_div.textContent = '딩동댕';
        num1 = Math.ceil(Math.random() * 9);
        num2 = Math.ceil(Math.random() * 9);
        result = num1 * num2;
        word.textContent = String(num1) + ' X ' + String(num2) + ' = ';
        input_answer.value = '';
        input_answer.focus();
    } else {
        result_div.textContent = '땡';
        input_answer.value = '';
        input_answer.focus();
    }
});

// while (true) {
//   var num1 = Math.ceil(Math.random() * 9);
//   var num2 = Math.ceil(Math.random() * 9);
//   var result = num1 * num2;
//   var switch = true;
//   while (switch) {
//     var answer = prompt(String(num1) + '곱하기' + String(num2) + '는?');
//     if (result === Number(answer)) {
//       alert('딩동댕');
//       switch = false;
//     } else {
//       alert('땡');
//     }
//   }
// }