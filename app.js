var questions, answersResult;

const formStart = document.getElementById("formStart"),
      formQuestions = document.getElementById("formQuestions"),
      formResult = document.getElementById("formResult"),
      selectCategory = document.getElementById("category"),
      selectDifficult = document.getElementById("difficulty");

window.onload = function () {
  apiRequest("api_category.php", categoryCallback);

  formStart.onsubmit = function (event) {
    event.preventDefault();
    formResult.style.display = "none";
    formQuestions.style.display = "none";
    formStart.style.display = "none";
    formQuestions.querySelector("#questionContainer").innerHTML = "";
    formQuestions.querySelector('button[type="submit"]').disabled = false;
    const category = selectCategory.value;
    const difficulty = selectDifficult.value;
    apiRequest(
      `api.php?amount=8&category=${category}&difficulty=${difficulty}`,
      questionsCallback
    );
  };

  formQuestions.onsubmit = function (event) {
    event.preventDefault();
    answersResult = [];

    for (i = 0; i < questions.length; i++) {
      const answers = document.getElementsByName(`answer[${i}]`);
      let checked = false;
      answers.forEach((answer, index) => {
        if (answer.checked === true) {
          checked = true;
          if (answer.value === questions[i].correct_answer) {
            answersResult.push({ index: i, status: true });
          } else {
            answersResult.push({ index: i, status: false });
          }
        }
      });

      if (checked === false) {
        formQuestions
          .getElementsByClassName("question")
          [i].querySelector("h2").className = "warning";
      } else {
        formQuestions
          .getElementsByClassName("question")
          [i].querySelector("h2").className = "";
      }
    }

    if (questions.length === answersResult.length) {
      answersResult.forEach((item) => {
        formQuestions
          .getElementsByClassName("question")
          [item.index].querySelector("h2").className =
          item.status === true ? "correct" : "incorrect";
      });

      formQuestions
        .querySelectorAll('.answers input[type="radio"]')
        .forEach((input) => {
          input.disabled = true;
        });

      formQuestions.querySelector('button[type="submit"]').disabled = true;

      formResult.querySelector("#resultTotal span").innerHTML =
        answersResult.length;

      let correctCount = 0,
        incorrectCount = 0;
      answersResult.forEach((result) => {
        if (result.status === true) {
          correctCount += 1;
        } else {
          incorrectCount += 1;
        }
      });

      formResult.querySelector("#resultCorrect span").innerHTML = correctCount;
      formResult.querySelector(
        "#resultInCorrect span"
      ).innerHTML = incorrectCount;

      formResult.style.display = "block";
    }
  };

  formResult.onsubmit = function (event) {
    event.preventDefault();
    formQuestions.style.display = "none";
    formResult.style.display = "none";
    formStart.style.display = "block";
  };

  function categoryCallback(result) {
    const categories = result.trivia_categories;
    categories.forEach((category) => {
      let option = document.createElement("option");
      option.text = category.name;
      option.value = category.id;
      selectCategory.add(option);
    });
    formStart.querySelector('button[type="submit"]').disabled = false;
  }

  function questionsCallback(result) {
    questions = result.results;

    questions.forEach((question, index) => {
      let divContainer = document.createElement("div");
      divContainer.className = "question";

      let h2 = document.createElement("h2");
      h2.innerHTML = `${index + 1}: ${question.question}`;

      let divAnswers = document.createElement("div");
      divAnswers.className = "answers";

      let answers = question.incorrect_answers;
      answers.push(question.correct_answer);

      answers = shuffle(answers);

      answers.forEach((answer) => {
        let label = document.createElement("label");
        let radio = document.createElement("input");

        radio.type = "radio";
        radio.name = `answer[${index}]`;
        radio.value = answer;

        label.append(radio, answer);
        divAnswers.append(label);
      });

      divContainer.append(h2);
      divContainer.append(divAnswers);

      formQuestions.querySelector("#questionContainer").append(divContainer);
    });

    formQuestions.style.display = "block";
  }

  function apiRequest(url, callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.overrideMimeType("application/json");
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        callback(JSON.parse(this.responseText));
      }
    };
    xhttp.open("GET", `https://opentdb.com/${url}`, true);
    xhttp.send();
  }
};

function shuffle(arr) {
  var ctr = arr.length,
    temp,
    index;
  while (ctr > 0) {
    index = Math.floor(Math.random() * ctr);
    ctr--;
    temp = arr[ctr];
    arr[ctr] = arr[index];
    arr[index] = temp;
  }
  return arr;
};
