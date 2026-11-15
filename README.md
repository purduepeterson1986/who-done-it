# Who Done It?

A mystery guessing game for 2 players. One suspect did it. Read the clue, then guess who, or pass the clue to your friend.

It runs in any modern browser on a computer, tablet or phone. There is nothing to install.

## How to play

1. Pick **1 Player** (practice on your own) or **2 Players**, a difficulty, and a mystery (or **Surprise me**). Type your names if you like, and press **Start game**.
2. A clue appears. In a 2-player game, it is the turn of the player shown at the top.
3. Either:
   - **Guess.** Tap the suspect you think did it, then press **Guess**. Right, and you win the game. Wrong, and that suspect is flipped down. In a 2-player game you also lose your turn; in a 1-player game the next clue appears.
   - **Pass.** The other player gets the next clue (in a 1-player game, you just get the next clue).
4. Every clue rules out some suspects. The last clue leaves only one, so the game always has a winner.

## Flipping suspects

Tap the little badge in a suspect's corner to flip them down, and tap it again to flip them back up.

The game does not cross suspects off for you. Use the badges to keep track of who is still in the running.

## Difficulty

| Level | Suspects | Traits | Clues |
|---|---|---|---|
| Level 1 | 6 | 3 | One trait at a time, such as "is a Fox" or "is NOT wearing a hat" |
| Level 2 | 9 | 4 | Adds AND clues, such as "has a striped shirt AND is NOT wearing sunglasses" |
| Level 3 | 12 | 5 | Adds OR clues ("has glasses OR a striped shirt, but NOT both") and where the suspect stands ("is in the top row") |

## Mysteries

- The Missing Birthday Cake
- The Secret Gift Giver
- The Runaway Pet
- The Circus Balloon

Every game makes a new set of suspects and a new clue order, so the same mystery rarely comes up twice.

## Running it yourself

No installation or build step is needed. Download the files into one folder and open `index.html` in a browser. Sound effects are made by the browser, so there are no sound files.

## Files

| File | Purpose |
|---|---|
| `index.html` | The page |
| `styles.css` | Appearance and animations |
| `mystery.js` | Makes the suspects and the clues, and checks that exactly one suspect fits the last clue |
| `art.js` | Draws the suspects |
| `game.js` | Turns, guesses, sounds and screens |
| `manifest.json`, `icon-192.png`, `icon-512.png` | Lets the game be installed as an app |

When `styles.css`, `mystery.js`, `art.js` or `game.js` changes, change the `?v=` tag on all four lines in `index.html` so browsers fetch the new copies.
