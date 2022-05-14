// eslint-disable-next-line no-unused-vars
const [id, _, studySetId] = window.location.pathname.split('/').slice(-3);

let qBank = [],
    showingCard = true,
    currentQuestion = 0,
    playingSet = true,
    flashcardScoreData = [];

getStudyset().then((studySet) => {
    const { name, description, flashcards } = studySet;
    let shuffledFlashcards = shuffleArray(flashcards);
    shuffledFlashcards.forEach((flashcard) => {
        qBank.push({
            id: flashcard._id,
            question: flashcard.term,
            definition: flashcard.definition,
            interchangeable: flashcard.interchangeable,
        });
    });

    beginActivity({ name, description });
});

// eslint-disable-next-line no-unused-vars
function score({ id, score }) {
    let scoreData = {
        flashcardId: id,
        score,
    };
    flashcardScoreData.push(scoreData);
}

function beginActivity({ name, description }) {
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

    // Set up the buttons: [Again, red], [Hard, yellow], [Good, green], [Easy, blue]
    const buttonArea = document.getElementById('button-area');
    [
        ['again', 'red', 0],
        ['hard', 'orange', 1],
        ['good', 'green', 2],
        ['easy', 'blue', 3],
    ].forEach((button) => {
        const buttonElement = document.createElement('button');
        buttonElement.classList.add('btn');
        buttonElement.style.backgroundColor = button[1];
        buttonElement.innerHTML =
            button[0].charAt(0).toUpperCase() + button[0].slice(1);
        buttonElement.addEventListener('click', () => {
            buttonAction();
            score({ id: qBank[currentQuestion], score: button[2] });
        });
        buttonArea.appendChild(buttonElement);
    });
    const buttonAction = () => {
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
    };

    function displayFinalMessage() {
        let buttonArea = document.getElementById('button-area');
        while (buttonArea.hasChildNodes()) {
            buttonArea.removeChild(buttonArea.lastChild);
        }
        document.getElementById('card-area').innerHTML = '';
        let finalMessage = document.createElement('div');
        finalMessage.id = 'final-message';
        finalMessage.innerHTML = 'You have completed the study set!';
        postStudysetScore();
        document.getElementById('card-area').appendChild(finalMessage);
    }
}

async function getStudyset() {
    let studysetRaw = await fetch(
        `/api/v1/user/${id}/studyset/${studySetId}/study`,
    );
    let { studySet } = await studysetRaw.json();

    return studySet;
}

async function postStudysetScore() {
    fetch(`/api/v1/user/${id}/studyset/${studySetId}/study`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            flashcardScore: {
                studysetId: studySetId,
                flashcardData: flashcardScoreData,
            },
        }),
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => console.log(data));
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
    return [KIMM_SWATCH[0], KIMM_SWATCH[1]];
}
