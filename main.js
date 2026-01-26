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
let gameOver = false;

let asciiToMask = new Map();   // 'a' → 0b100000
let maskToAscii = new Map();   // 0b100000 → 'a'

// accumulatorHistory[n] reflects guesses 0..n-1
let accumulatorHistory = [
  {
    correct: Array(WORD_LENGTH).fill(0),
    wrong: Array(WORD_LENGTH).fill(0)
  }
];

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

function bitsToMask(bits) {
  return parseInt(bits, 2);
}

function renderMask(mask, rowIndex) {
  if (mask === 0) {
    return rowIndex === 0 ? "-" : " ";
  }
  return maskToAscii.get(mask) || " ";
}

// -----------------------------
// Accumulation (DOT-LEVEL)
// -----------------------------

function accumulate(prev, guess) {
  const next = {
    correct: [...prev.correct],
    wrong: [...prev.wrong]
  };

  // Union of all answer dots
  let answerUnion = 0;
  for (let ch of WORD_OF_THE_DAY) {
    answerUnion |= asciiToMask.get(ch);
  }

  for (let i = 0; i < WORD_LENGTH; i++) {
    const guessMask = asciiToMask.get(guess[i]);
    const answerMask = asciiToMask.get(WORD_OF_THE_DAY[i]);

    // Correct dots in correct position
    next.correct[i] |= (guessMask & answerMask);

    // Wrong dots (not present anywhere in answer)
    if ((guessMask & answerUnion) === 0) {
      next.wrong[i] |= guessMask;
    }
  }

  return next;
}

// -----------------------------
// Rendering
// -----------------------------

function renderBoard(focusIndex = null) {
  board.querySelectorAll(".row:not(#header)").forEach(r => r.remove());

  for (let i = 0; i < guessHistory.length; i++) {
    const acc = accumulatorHistory[i];
    const row = document.createElement("div");
    row.className = "row";
    row.tabIndex = -1;

    let correct = "";
    let wrong = "";

    for (let j = 0; j < WORD_LENGTH; j++) {
      correct += renderMask(acc.correct[j], i);
      wrong += renderMask(acc.wrong[j], i);
    }

    row.textContent =
      `#${String.fromCharCode(97 + i)} ` +
      `${correct} ` +
      `${guessHistory[i]} ` +
      `${wrong}`;

    board.appendChild(row);

    if (i === focusIndex) {
      row.focus();
    }
  }

  input.setAttribute("aria-label", guessLabel(guessHistory.length));
}

// -----------------------------
// Validation (Mapping ONLY)
// -----------------------------

function isValidGuess(guess) {
  if (guess.length !== WORD_LENGTH) {
    status.textContent = STATUS.invalidLength;
    return false;
  }

  for (let ch of guess) {
    if (!asciiToMask.has(ch)) {
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

  const prev = accumulatorHistory[accumulatorHistory.length - 1];
  const next = accumulate(prev, guess);

  guessHistory.push(guess);
  accumulatorHistory.push(next);

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
  input.setAttribute("aria-hidden", "true");
  status.textContent += " " + STATUS.locked + " " + STATUS.reload;
  status.focus();
}

// -----------------------------
// Init
// -----------------------------

fetch("braille-ascii-map.json")
  .then(r => r.json())
  .then(map => {
    for (const [ascii, bitString] of Object.entries(map)) {
      const mask = bitsToMask(bitString);
      asciiToMask.set(ascii, mask);
      if (!maskToAscii.has(mask)) {
        maskToAscii.set(mask, ascii);
      }
    }
    renderBoard();
    input.focus();
  });
