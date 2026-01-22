"use strict";

/*
  Security Note:
  This file does not evaluate user input as code.
  All input is length-checked and character-validated.
*/

const WORD_OF_THE_DAY = "a6ect"; // test word (ascii)
const MAX_GUESSES = 6;

let asciiToDots = {};
let dotsToAscii = {};

let currentGuess = 0;
let correctDots = ["000000", "000000", "000000", "000000", "000000"];
let historyDots = ["000000", "000000", "000000", "000000", "000000"];

/* ---------------- Mapping Loader ---------------- */

async function loadMapping() {
  const response = await fetch("braille-ascii-map.json");
  const data = await response.json();

  asciiToDots = data;

  // Build reverse map
  for (const [ascii, dots] of Object.entries(data)) {
    dotsToAscii[dots] = ascii;
  }
}

/* ---------------- Utilities ---------------- */

function asciiStringToDotsArray(str) {
  return [...str].map(ch => asciiToDots[ch] || null);
}

function dotsArrayToAsciiString(arr) {
  return arr.map(d => dotsToAscii[d] || " ").join("");
}

function validateGuess(str) {
  if (str.length !== 5) return false;
  return [...str].every(ch => asciiToDots.hasOwnProperty(ch));
}

/* ---------------- Game Logic ---------------- */

function submitGuess() {
  const input = document.getElementById("guess-input");
  const guess = input.value;

  if (!validateGuess(guess)) {
    alert("Guess must be exactly 5 valid ASCII braille characters.");
    return;
  }

  const guessDots = asciiStringToDotsArray(guess);
  const targetDots = asciiStringToDotsArray(WORD_OF_THE_DAY);

  for (let i = 0; i < 5; i++) {
    const overlap =
      parseInt(guessDots[i], 2) & parseInt(targetDots[i], 2);

    const overlapBits = overlap.toString(2).padStart(6, "0");

    correctDots[i] = (
      parseInt(correctDots[i], 2) | overlap
    ).toString(2).padStart(6, "0");

    historyDots[i] = (
      parseInt(historyDots[i], 2) | parseInt(guessDots[i], 2)
    ).toString(2).padStart(6, "0");
  }

  renderRow(
    dotsArrayToAsciiString(correctDots),
    guess,
    dotsArrayToAsciiString(historyDots)
  );

  currentGuess++;
  input.value = "";

  if (guess === WORD_OF_THE_DAY) {
    alert("You win!");
  } else if (currentGuess >= MAX_GUESSES) {
    alert("Game over.");
  }
}

/* ---------------- Rendering ---------------- */

function renderRow(correct, guess, history) {
  const board = document.getElementById("game-board");

  const row = document.createElement("div");
  row.className = "row";

  row.innerHTML = `
    <div class="cell">${correct}</div>
    <div class="cell">${guess}</div>
    <div class="cell">${history}</div>
  `;

  board.appendChild(row);
}

/* ---------------- Init ---------------- */

document.getElementById("submit-btn").addEventListener("click", submitGuess);

loadMapping();
