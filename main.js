// Load the ASCII→Braille mapping
let brailleMap = {};
fetch('braille-ascii-map.json')
    .then(response => response.json())
    .then(data => {
        brailleMap = data;
    })
    .catch(err => console.error('Error loading Braille map:', err));

const guessInput = document.getElementById('guess-input');
const submitButton = document.getElementById('submit-guess');
const correctGuessesList = document.getElementById('correct-guesses-list');
const statusContainer = document.getElementById('status-container');

let correctGuesses = [];
let secretWord = 'hello'; // Placeholder; ideally this is randomized or pulled from a word list

function asciiToBraille(asciiStr) {
    return asciiStr.split('').map(ch => brailleMap[ch] || '?').join('');
}

function displayStatus(message) {
    statusContainer.textContent = message;
}

function addCorrectGuess(guess) {
    const li = document.createElement('li');
    li.textContent = asciiToBraille(guess);
    correctGuessesList.appendChild(li);
}

function handleGuess() {
    const guess = guessInput.value.trim().toLowerCase();
    if (!guess) {
        displayStatus('Please enter a guess.');
        return;
    }

    if (guess.length !== secretWord.length) {
        displayStatus(`Guess must be ${secretWord.length} letters.`);
        return;
    }

    if (guess === secretWord) {
        displayStatus('🎉 Correct! You guessed the word!');
        addCorrectGuess(guess);
    } else {
        displayStatus('Incorrect guess. Try again!');
    }

    guessInput.value = '';
    guessInput.focus();
}

submitButton.addEventListener('click', handleGuess);
guessInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleGuess();
});
