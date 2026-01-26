// -----------------------------
// Configuration
// -----------------------------

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
const WORD_OF_THE_DAY = "a6ect";

// -----------------------------
// Status messages (ASCII)
// -----------------------------

const STATUS = {
  invalidLength: 'guess m/ 2 exactly #e "*s"',
  invalidChars: 'guess 3ta9s 9valid "*s"',
  win: ',,y ,,w96',
  lose: 'sorry game ov]',
  locked: 'game f9i%$ 9put lock$',
  reload: 'reload page to play ag'
};

// -----------------------------
// State
// -----------------------------

let guessHistory = [];
let accumulatorHistory = [
  { correct: "-----", wrong: "-----" }
];

let gameOver = false;
let validCharSet = new Set();

// -----------------------------
// DOM
// -----------------------------

const board = document.getElementById("board");
const form = document.getElementById("guess-form");
const input = document.getElementById("guess-input");
const status = document.getElementById("status");

// -----------------------------
// Utilities
// -----------------------------

function guessLabel(index) {
  if (index === MAX_GUESSES - 1) return "f9al guess";
  return `guess #${String.fromCharCode(97 + index)}`;
}

function accumulate(prev, guess) {
  let correct = prev.correct.split("");
  let wrong = prev.wrong.split("");

  for (let i = 0; i < WORD_LENGTH; i++) {
    const ch = guess[i];
    if (WORD_OF_THE_DAY[i] === ch) {
      correct[i] = ch;
    } else if (!WORD_OF_THE_DAY.includes(ch)) {
      wrong[i] = ch;
    }
  }

  return {
    correct: correct.join(""),
    wrong: wrong.join("")
  };
}

// -----------------------------
// Rendering
// -----------------------------

function renderBoard(focusIndex = null) {
  board.querySelectorAll(".row:not(#header)").forEach(r => r.remove());

  // Render recorded guesses
  for (let i = 0; i < guessHistory.length; i++) {
    const row = document.createElement("div");
    row.className = "row";
    row.tabIndex = -1;

    const acc = accumulatorHistory[i];
    row.textContent =
      `#${String.fromCharCode(97 + i)} ` +
      `${acc.correct} ` +
      `${guessHistory[i]} ` +
      `${acc.wrong}`;

    board.appendChild(row);

    if (i === focusIndex) {
      row.focus();
    }
  }

  // Render next label row only if game not over
  if (!gameOver && guessHistory.length < MAX_GUESSES) {
    const row = document.createElement("div");
    row.className = "row";
    row.textContent = guessLabel(guessHistory.length);
    board.appendChild(row);
  }

  input.setAttribute("aria-label", guessLabel(guessHistory.length));
}

// -----------------------------
// Validation (Mapping-Driven)
// -----------------------------

function isValidGuess(guess) {
  if (guess.length !== WORD_LENGTH) {
    status.textContent = STATUS.invalidLength;
    return false;
  }

  for (const ch of guess) {
    if (!validCharSet.has(ch)) {
      status.textContent = STATUS.invalidChars;
      return false;
    }
  }

  return true;
}

// -----------------------------
// Submission
// -----------------------------

form.addEventListener("submit", e => {
  e.preventDefault();
  if (gameOver) return;

  const guess = input.value.trim();

  if (!isValidGuess(guess)) return;

  const prevAcc = accumulatorHistory[accumulatorHistory.length - 1];
  const nextAcc = accumulate(prevAcc, guess);

  guessHistory.push(guess);
  accumulatorHistory.push(nextAcc);

  input.value = "";
  renderBoard(guessHistory.length - 1);

  if (guess === WORD_OF_THE_DAY) {
    status.textContent = STATUS.win;
    endGame();
  } else if (guessHistory.length === MAX_GUESSES) {
    status.textContent = STATUS.lose;
    endGame();
  }
});

// -----------------------------
// End Game
// -----------------------------

function endGame() {
  gameOver = true;
  input.disabled = true;
  status.textContent += " " + STATUS.locked + " " + STATUS.reload;
  renderBoard();
}

// -----------------------------
// Init
// -----------------------------

fetch("braille-ascii-map.json")
  .then(r => r.json())
  .then(map => {
    Object.keys(map).forEach(ch => validCharSet.add(ch));
    renderBoard();
    input.focus();
  });
