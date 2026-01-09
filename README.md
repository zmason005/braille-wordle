# Braille Wordle

**Braille Wordle** is an accessibility-first word game inspired by *Wordle*, designed **from the ground up for Braille readers**.

Unlike visual adaptations of Wordle, this game operates entirely on **Braille dot patterns**, using Unicode Braille characters as both input and output. Gameplay logic is based on **dot-level correctness**, not letters or colors.

> Braille dots are the truth.

---

## 🎯 Project Goals

- Create a word game that is **natively usable** with:
  - Screen readers
  - Refreshable Braille displays
  - Keyboard-only input
- Reinforce **Braille literacy** through meaningful interaction
- Avoid visual metaphors (e.g., green/yellow tiles)
- Treat Braille as a **primary representation**, not an accommodation

---

## 🧠 How It Works

- Each puzzle has a fixed-length Braille word (Unicode Braille characters)
- Players submit guesses using Braille input
- For each cell:
  - Correct dots are retained
  - Incorrect dots are removed
- Correct dots **persist across guesses**
- The puzzle is solved when all dots match exactly

All comparisons are done at the **dot (bitmask) level**.

---

## ♿ Accessibility

- No reliance on color, shape, or visual layout
- Fully usable with:
  - Screen readers
  - Refreshable Braille displays
  - Keyboard navigation
- Uses Unicode Braille (`U+2800`–`U+28FF`)
- Live feedback announced via ARIA regions

See [`accessibility.md`](accessibility.md) for details.

---

## 🧪 Project Status

This repository currently contains a **minimal playable prototype** intended to:

- Validate the core Braille-based mechanic
- Support early user testing
- Serve as a reference implementation

This is **not** a finished game.

---

## 🚀 Running the Prototype

No build tools required.

1. Clone or download the repository
2. Open `index.html` in a browser
3. Use a Braille keyboard or Braille display to enter guesses

---

## 📜 License

MIT License — see [`LICENSE`](LICENSE)

---

## 🤝 Contributing

Contributions are welcome, especially from:
- Braille readers
- Accessibility professionals
- Assistive technology users

Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) before submitting changes.
