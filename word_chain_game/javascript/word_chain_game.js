var body = document.body;

var word = document.createElement('div');
word.textContent = '우킹우';
document.body.append(word);

var form = document.createElement('form');
document.body.append(form);

var input = document.createElement('input');
form.append(input);

var go_button = document.createElement('button');
go_button.textContent = '입력!';
form.append(go_button);

var result = document.createElement('div');
document.body.append(result);

form.addEventListener('submit', function 콜백함수(e) {
    e.preventDefault();
    if (word.textContent[word.textContent.length - 1] === input.value[0]) { // input.value === '우산'
        result.textContent = '딩동댕';
        word.textContent = input.value;
        input.value = '';
        input.focus();
    } else {
        result.textContent = '땡';
        input.value = '';
        input.focus();
    }
});


//
// var word = '우킹우'
//
// while (true) {
//   var answer = prompt(word);
//   if (word[word.length - 1] === answer[0]) {
//     alert('딩동댕');
//     word = answer;
//   } else {
//     alert('땡');
//   }
// }
