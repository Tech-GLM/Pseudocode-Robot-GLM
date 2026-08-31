# GLM Robot Pseudocode Lab — GitHub Pages Edition

Version **2.0.0**

A browser-based pseudocode learning environment for Grade 7 students. Students program an animated service robot through progressively harder mazes while learning:

1. sequence and output;
2. `INPUT` and stored sensor values;
3. `IF / ELSE` decisions;
4. counted `REPEAT` loops;
5. variables and state changes;
6. condition-controlled `WHILE` loops;
7. task sensors and conditionals inside loops;
8. multiple sensor inputs and nested logic;
9. functions and calls;
10. an integrated capstone algorithm.

No server, database, build tool, package manager, or API key is required. Student code and unlocked missions are stored in `localStorage` in the current browser.

## What changed in v2.0

### GitHub-native project

The old Apps Script wrapper is no longer required. The application is a static site:

```text
glm-robot-pseudocode/
├── index.html
├── styles.css
├── src/
│   ├── levels.js
│   └── app.js
├── .nojekyll
└── README.md
```

This makes it suitable for GitHub Pages, a normal web server, or local use.

### Clean custom code blocks

Custom toolbar blocks are now defined as **arrays of real lines**:

```js
["IF / ELSE", [
  "IF condition THEN",
  "  // instructions when TRUE",
  "ELSE",
  "  // instructions when FALSE",
  "END IF"
]]
```

The insertion function uses `lines.join("\n")` internally. Students see a normal multiline block in the editor; they never see escape text such as `\n`.

### Clearer INPUT teaching

Mission 2 explicitly demonstrates the idea that `INPUT`:

1. reads a sensor at one moment;
2. stores the result in a variable;
3. does **not** automatically update the variable after movement or turning;
4. must be run again to refresh the stored value.

Example:

```text
INPUT FRONT_IS_CLEAR INTO pathOpen
OUTPUT pathOpen

TURN RIGHT

INPUT FRONT_IS_CLEAR INTO pathOpen
OUTPUT pathOpen
```

### Clearer conditional teaching

Mission 3 separates the two jobs:

```text
INPUT FRONT_IS_CLEAR INTO pathOpen

IF pathOpen THEN
  MOVE
ELSE
  TURN RIGHT
END IF
```

`INPUT` gets the evidence. `IF` uses that evidence to select exactly one branch.

Later missions progressively introduce `CURRENT_TASK`, multiple sensor variables, nested decisions, and task-aware loops.

## Core language

```text
START
END

MOVE
TURN LEFT
TURN RIGHT
CLEAN
DANCE
RAISE HAND

OUTPUT "text"
OUTPUT variable

INPUT FRONT_IS_CLEAR INTO pathOpen
INPUT CURRENT_TASK INTO task

SET steps TO 0
INCREASE steps BY 1

IF condition THEN
  ...
ELSE
  ...
END IF

REPEAT 4 TIMES
  ...
END REPEAT

WHILE condition DO
  ...
END WHILE

FUNCTION celebrate()
  ...
END FUNCTION

CALL celebrate()
```

### Sensors

Navigation:

- `FRONT_IS_CLEAR`
- `LEFT_IS_CLEAR`
- `RIGHT_IS_CLEAR`
- `FRONT_IS_BLOCKED`
- `ON_GOAL`

Task sensors:

- `CURRENT_TASK`
- `ON_TASK_SPOT`
- `ON_CLEAN_SPOT`
- `ON_DANCE_SPOT`
- `ON_SPEAK_SPOT`
- `ON_HAND_SPOT`

Conditions support `NOT`, `AND`, `OR`, `=`, `!=`, `<`, `>`, `<=`, and `>=`.

## Required task tiles

Reaching `G` is not enough. Matching actions must be performed **while the robot is standing on the required tile**:

- `C` → `CLEAN`
- `D` → `DANCE`
- `T` → `OUTPUT`
- `H` → `RAISE HAND`

## Run locally

Because this project uses only browser files, you can open `index.html` directly. For the most consistent browser behavior, run a tiny local server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish with GitHub Pages

1. Create a GitHub repository, for example `glm-robot-pseudocode`.
2. Upload the contents of this project to the repository root.
3. Commit and push to the `main` branch.
4. Open **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select branch `main` and folder `/ (root)`.
7. Save.
8. GitHub will publish the site at the Pages URL shown in that section.

## Classroom design preserved

- ten progressively unlocked missions;
- required action spots rather than decorative spots;
- animated `CLEAN`, `DANCE`, `OUTPUT`, and `RAISE HAND`;
- an output speech bubble over the robot;
- Step trace and Run program modes;
- browser window stays on the robot while only the execution trace scrolls internally;
- PSeInt-inspired flowchart display and SVG download;
- local persistence of mission code and progress;
- mobile-responsive layout.

## Teacher note

The starter code intentionally does not contain full mission solutions. Missions 1–4 are especially suitable for the progression:

**Predict → Step trace → Run → Explain**

For Mission 4, a useful controlled modification is to change only the `REPEAT` count and compare the final stopping point.
