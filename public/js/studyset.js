// eslint-disable-next-line no-unused-vars
const [id, _, studySetId] = window.location.pathname.split("/").slice(-3);

const KIMM_SWATCH = ["#34577A", "#39A2A5", "#57CC98", "#80EA98"];
let qBank = [],
  showingCard = true,
  currentQuestion = 0;

getStudyset().then((studySet) => {
  const { name, description, flashcards } = studySet;
  flashcards.forEach((flashcard) => {
    qBank.push({
      question: flashcard.term,
      answer: flashcard.definition,
      interchangeable: flashcard.interchangeable,
    });
  });

  beginActivity();

  function beginActivity() {
    document.getElementById('activity-title').innerHTML = name;
    document.getElementById('studyset-description').innerHTML = description;
    let firstColor =
      KIMM_SWATCH[Math.floor(Math.random() * KIMM_SWATCH.length)];
    const cardArea = document.getElementById("card-area");
    cardArea.style.backgroundColor = firstColor;
    cardArea.innerHTML = `<div class="card">${qBank[currentQuestion].question}</div>`;
    cardArea.addEventListener("click", () => {
      if (showingCard) {
        cardArea.innerHTML = `<div class="card">${qBank[currentQuestion].answer}</div>`;
        showingCard = false;
      } else {
        cardArea.innerHTML = `<div class="card">${qBank[currentQuestion].question}</div>`;
        cardArea.style.backgroundColor = firstColor;
        showingCard = true;
      }
    });
    
    let nextButton = document.createElement("button");
    nextButton.innerText = "Next";
    nextButton.addEventListener("click", () => {
      currentQuestion++;
      if (currentQuestion >= qBank.length) {
        displayFinalMessage();
      }
      cardArea.innerHTML = `<div class="card">${qBank[currentQuestion].question}</div>`;
      cardArea.style.backgroundColor = firstColor;
      showingCard = true;
    });
    document.getElementById('button-area').appendChild(nextButton);

    function displayFinalMessage() {
      let buttonArea = document.getElementById('button-area');
      while (buttonArea.hasChildNodes()) {
        buttonArea.removeChild(buttonArea.lastChild);
    }
      document.getElementById('card-area').innerHTML = "";
      let finalMessage = document.createElement("div");
      finalMessage.id = "final-message";
      finalMessage.innerHTML = "You have completed the study set!";
      document.getElementById('card-area').appendChild(finalMessage);
    }


    // cardArea.append('<div id="card1" class="card">' + qBank[currentQuestion].question + '</div>')
    // cardArea.append('<div id="card2" class="card">' + qBank[currentQuestion].answer + '</div>')
  }
});

async function getStudyset() {
  let studysetRaw = await fetch(
    `/api/studyset?id=${id}&studySetId=${studySetId}`
  );
  let { studySet } = await studysetRaw.json();

  return studySet;
}
