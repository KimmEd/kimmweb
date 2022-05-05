// eslint-disable-next-line no-unused-vars
const [id, _, studySetId] = window.location.pathname.split('/').slice(-3);

let qBank = [],
  showingCard = true,
  currentQuestion = 0,
  playingSet = true;

getStudyset().then((studySet) => {
  const { name, description, flashcards } = studySet;
  let shuffledFlashcards = shuffleArray(flashcards);
  shuffledFlashcards.forEach((flashcard) => {
    qBank.push({
      question: flashcard.term,
      definition: flashcard.definition,
      interchangeable: flashcard.interchangeable,
    });
  });

  beginActivity();

  function beginActivity() {
    // Set up the layout
    document.getElementById('activity-title').innerHTML = name;
    document.getElementById('studyset-description').innerHTML = description;

    // Set up rotating color.
    let [colorTerm, colorDefinition] = colorSelector();

    const cardArea = document.getElementById('card-area');
    cardArea.style.backgroundColor = colorTerm;
    cardArea.innerHTML = `<div class="card-text">${qBank[currentQuestion].question}</div>`;
    cardArea.addEventListener('click', () => {
      if (!playingSet) return;
      if (showingCard) {
        cardArea.innerHTML = `<div class="card-text">${qBank[currentQuestion].definition}</div>`;
        cardArea.style.backgroundColor = colorDefinition;
        showingCard = false;
      } else {
        cardArea.innerHTML = `<div class="card-text">${qBank[currentQuestion].question}</div>`;
        cardArea.style.backgroundColor = colorTerm;
        showingCard = true;
      }
    });

    let nextButton = document.createElement('button');
    nextButton.innerText = 'Next';
    nextButton.addEventListener('click', () => {
      currentQuestion++;
      if (currentQuestion >= qBank.length) {
        playingSet = false;
        displayFinalMessage();
      } else {
        cardArea.innerHTML = `<div class="card-text">${qBank[currentQuestion].question}</div>`;
        [colorTerm, colorDefinition] = colorSelector();
        cardArea.style.backgroundColor = colorTerm;
        showingCard = true;
      }
    });
    document.getElementById('button-area').appendChild(nextButton);

    function displayFinalMessage() {
      let buttonArea = document.getElementById('button-area');
      while (buttonArea.hasChildNodes()) {
        buttonArea.removeChild(buttonArea.lastChild);
      }
      document.getElementById('card-area').innerHTML = '';
      let finalMessage = document.createElement('div');
      finalMessage.id = 'final-message';
      finalMessage.innerHTML = 'You have completed the study set!';
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

function shuffleArray(arr) {
  let arrAns = [...arr];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arrAns[i], arrAns[j]] = [arrAns[j], arrAns[i]];
  }
  return arrAns;
}

function colorSelector() {
  const KIMM_SWATCH = ['#39A2A5', '#57CC98', '#80EA98'];
  let colorTerm = KIMM_SWATCH[Math.floor(Math.random() * KIMM_SWATCH.length)],
    colorDefinition =
      KIMM_SWATCH[Math.floor(Math.random() * KIMM_SWATCH.length)];
  while (colorTerm === colorDefinition) {
    colorDefinition =
      KIMM_SWATCH[Math.floor(Math.random() * KIMM_SWATCH.length)];
  }
  return [ colorTerm, colorDefinition ];
}