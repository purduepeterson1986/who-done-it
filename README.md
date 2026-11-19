# Who Done It?

A mystery guessing game for 2 players. One suspect did it. Read the clue, then guess who, or pass the clue to your friend.

It runs in any modern browser on a computer, tablet or phone. There is nothing to install.

## How to play

1. Pick **1 Player** (practice on your own) or **2 Players**, a difficulty, whether to **keep score** (and if so, a match of **1**, **3** or **5 mysteries**), and a mystery (or **Surprise me**). Type your names if you like, and press **Start game**.
2. A clue appears. In a 2-player game, it is the turn of the player shown at the top. The players take turns going first: whoever went second in one mystery goes first in the next.
3. Either:
   - **Guess.** Tap the suspect you think did it, then press **Guess**. Right, and you solve the mystery. Wrong, and that suspect is flipped down. If you keep score, solving earns **3 points, minus 1 for each wrong guess you made on that mystery** (never less than 0). The **+3** next to your score shows what solving is worth right now. Points you already won are never taken away. In a 2-player game the other player then gets the next **two** clues: they can guess on the first one, or pass and keep the turn for one more clue. In a 1-player game the next clue appears, and the end screen shows how many wrong guesses you made.
   - **Pass.** The other player gets the next clue (in a 1-player game, you just get the next clue).
4. Earlier clues stay on the card under **Clues so far**, because you need all of them together.
5. Every clue rules out some suspects. Together, the clues leave only one, so every mystery gets solved.
6. With **Keep score** on, points add up over the match, and the scores show above the clue. After the last mystery, the player with the most points wins the match (or it is a tie).

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

Some clues are facts about the characters instead of what they are wearing:

- **Animals** (cake, gift and pet mysteries): lives in a house, lives in the woods, has an underground den or burrow, is awake at night, can be a pet, has pointy ears.
- **Clowns**: has curly hair (or spiky), is wearing a bow tie, has stars painted on its cheeks. These show in the picture, and each clown color always has the same ones.

Every game makes a new set of suspects and a new clue order, so the same mystery rarely comes up twice.

## Saved games

The game in progress is saved in the browser after every move. If the page is refreshed or closed, it opens straight back into the same game. Going to **Settings** or finishing the match clears it.

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
