# GLM Robot Pseudocode Lab

**Version 1.3.0 – GitHub Edition**

GLM Robot Pseudocode Lab is a complete, student-facing web application for seventh-grade computer science. Students write Pseudocode, run it one instruction at a time, and guide an animated robot through ten progressively more challenging mazes. The lab teaches sequence, sensors, input and output, variables, conditionals, counted and condition-controlled loops, functions, tracing, debugging, and flowchart interpretation.

The project is a static website built with semantic HTML, vanilla CSS, and vanilla JavaScript. It has no framework, package manager, build step, database, external API, or paid dependency. After the files load, every feature works offline in the browser.

## Live site

After GitHub Pages is enabled, the site URL follows this format:

```text
https://USERNAME.github.io/GLM-Robot-Pseudocode-Lab/
```

Replace `USERNAME` with the GitHub account or organization that owns the repository.

## Screenshot

To add a screenshot to this README:

1. Open the published lab on a Chromebook-sized browser window.
2. Select a mission that shows the maze, robot, editor, and live sensors.
3. Save the image as `assets/glm-robot-lab-screenshot.png`.
4. Add the following Markdown below this list:

```markdown
![GLM Robot Pseudocode Lab interface](assets/glm-robot-lab-screenshot.png)
```

## Learning objectives

Students learn to:

- design precise algorithms and ordered sequences;
- read navigation and task sensors;
- store input values in variables;
- generate robot outputs;
- trace and debug conditional structures;
- use counted and condition-controlled loops;
- define and call reusable functions;
- connect Pseudocode structures to conventional flowchart symbols; and
- judge a program by what it actually executes, not only by the keywords it contains.

## Ten-mission progression

| Mission | Title | Main concept |
| --- | --- | --- |
| 1 | The Welcome Route | Sequence and robot output |
| 2 | Read, Store, Act | Sensor inputs stored in variables |
| 3 | Decision at the Wall | Conditional decisions |
| 4 | Dance by Counting | Counted loops |
| 5 | Variable-Length Turns | Variables and repeated patterns |
| 6 | Until the Corridor Ends | Condition-controlled loops |
| 7 | Navigator Loop | `IF/ELSE` inside a loop |
| 8 | Action-Spot Inspector | Sensor inputs and nested logic |
| 9 | Call the Celebration | Functions and function calls |
| 10 | Capstone Rescue Route | Integrated capstone algorithm |

Future missions remain locked until the previous mission is completed. Code, completed missions, unlocked missions, the selected mission, execution speed, and reduced-motion preference are saved locally in the browser.

## Pseudocode syntax

Every program begins with `START` and finishes with `END`.

```text
START
  OUTPUT "Mission started"

  INPUT FRONT_IS_CLEAR INTO frontOpen
  INPUT CURRENT_TASK INTO task

  IF frontOpen THEN
    MOVE FORWARD
  ELSE
    TURN RIGHT
  END IF

  REPEAT 3 TIMES
    MOVE FORWARD
  END REPEAT

  WHILE FRONT_IS_CLEAR DO
    MOVE FORWARD
  END WHILE

  FUNCTION celebrate()
    OUTPUT "Goal reached"
    DANCE
  END FUNCTION

  CALL celebrate()
END
```

Variables can also be created directly:

```text
SET steps TO 4

REPEAT steps TIMES
  MOVE FORWARD
END REPEAT
```

Conditions support `NOT`, `AND`, `OR`, `=`, `!=`, `<`, `>`, `<=`, and `>=`, including parentheses.

## Robot commands

```text
MOVE FORWARD
TURN LEFT
TURN RIGHT
CLEAN
DANCE
RAISE HAND
OUTPUT "message"
```

Forward movement is always written as `MOVE FORWARD` throughout the application, examples, trace, parser, validation, documentation, and generated flowcharts.

## Sensors

Navigation sensors:

```text
FRONT_IS_CLEAR
LEFT_IS_CLEAR
RIGHT_IS_CLEAR
FRONT_IS_BLOCKED
ON_GOAL
```

Task sensors:

```text
CURRENT_TASK
ON_TASK_SPOT
ON_CLEAN_SPOT
ON_DANCE_SPOT
ON_SPEAK_SPOT
ON_HAND_SPOT
```

## Action spots

Some squares require an action. Reaching the goal is not enough: all unfinished spots must be completed.

| Marker | Required instruction |
| --- | --- |
| `C` | `CLEAN` |
| `D` | `DANCE` |
| `T` | `OUTPUT "message"` or another valid output value |
| `H` | `RAISE HAND` |

Mission validation uses the execution record. A disconnected or always-true decision does not satisfy a task-conditional requirement. The relevant condition must actually be evaluated while the robot is standing on an unfinished action spot.

## Interpreter and validation

The browser application contains a line tokenizer, structured parser, expression evaluator, asynchronous interpreter, and mission validator. It reports syntax and runtime errors with the relevant source line. The interpreter stops programs that exceed 750 execution steps to protect students from infinite loops.

A mission passes only when:

- the robot reaches the goal without a collision;
- every required action spot is completed;
- the required structures are genuinely executed;
- required decisions read meaningful sensors in the correct context;
- a required function is both defined and called; and
- the program finishes within the execution limit.

## Flowchart viewer

Select **Show Flowchart** to parse the current program with the same parser used by the interpreter. The local SVG generator displays:

- rounded terminators for `START` and `END`;
- rectangles for processes and robot actions;
- parallelograms for input and output;
- diamonds for decisions and loops;
- subprocess rectangles for function calls;
- `TRUE`, `FALSE`, loop, exit, and loop-back paths;
- rejoined conditional branches;
- source line numbers; and
- separate sections for function definitions.

Invalid or incomplete code produces a line-specific syntax message instead of an incorrect diagram. The modal supports keyboard focus, the Escape key, backdrop closing, scrolling, and SVG download.

## Student progress and privacy

The lab stores progress only in the current browser using `localStorage`. No student name, email address, code, or result is sent to a server. Clearing site data removes the saved progress. The **Reset saved progress** control requires confirmation before deletion.

## Accessibility

- Semantic HTML and labeled form controls
- Keyboard-accessible buttons, editor, mission selector, and modal
- Visible focus indicators
- Sufficient color contrast and text labels that do not rely only on color
- Live regions for output, feedback, and execution status
- Accessible action-spot legend and maze labels
- Responsive layouts for desktops, Chromebooks, and tablets
- Automatic support for `prefers-reduced-motion`
- A manual **Reduce motion** option saved in the browser
- Scroll-contained output and trace panels so execution does not move the page

## Repository structure

```text
GLM-Robot-Pseudocode-Lab/
├── index.html      # Semantic student interface and flowchart modal
├── styles.css      # Responsive layout, maze, robot, and action animations
├── app.js          # Missions, parser, interpreter, validation, UI, and SVG flowcharts
├── README.md       # Project and deployment documentation
├── LICENSE         # MIT License
└── .nojekyll       # Disables Jekyll processing on GitHub Pages
```

## Run locally

The application can be opened directly by double-clicking `index.html`. A small static server is recommended because it matches GitHub Pages behavior more closely.

With Python 3:

```bash
cd GLM-Robot-Pseudocode-Lab
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

No Node.js, npm, installation, compilation, or build command is required.

## Fork or clone

To fork, select **Fork** on the GitHub repository page and create the fork in the desired account or organization.

To clone:

```bash
git clone https://github.com/USERNAME/GLM-Robot-Pseudocode-Lab.git
cd GLM-Robot-Pseudocode-Lab
```

## Publish with GitHub Pages

1. Create a GitHub repository.
2. Upload or commit all project files.
3. Open the repository’s **Settings**.
4. Select **Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select the `main` branch and `/root` folder.
7. Save the configuration.
8. Wait for GitHub to publish the website.
9. Open the generated GitHub Pages URL.
10. Test all application features from the published URL.

Because every application path is relative and filenames use exact case, the same files work from the repository root on GitHub Pages.

## Edit missions as a teacher

Mission definitions are in the `MISSIONS` array near the beginning of `app.js`. Each mission includes:

- `title`, `concept`, `objective`, `instructions`, and `hint`;
- a list of expected `concepts`;
- incomplete student `starter` code;
- a rectangular character `grid`;
- the starting `direction`; and
- execution-based `requirements`.

Maze characters are:

```text
#  wall
.  open square
S  robot start
G  goal
C  clean spot
D  dance spot
T  speaking spot
H  raise-hand spot
```

Keep every maze row the same length and include exactly one start and one goal. After changing a mission, test the starter for syntax, test at least one valid solution, test one invalid solution, and confirm that future missions still unlock correctly.

## Create a new release

1. Update the version text in `app.js`, `index.html`, and this README.
2. Test all ten missions and the flowchart generator.
3. Confirm that the downloaded SVG contains no `NaN` or `undefined` values.
4. Commit the changes to `main`.
5. Create a Git tag such as `v1.3.0`.
6. Push the tag.
7. Open **Releases** on GitHub and create a release from the tag.
8. Add a concise changelog and attach the repository ZIP if desired.
9. Verify that GitHub Pages serves the new version.

## Version history

### 1.3.0 – GitHub Edition

- Added local PSeInt-style flowchart generation from the interpreter parser.
- Added conventional symbols, labeled decision branches, visible rejoins, loop exits, loop-back arrows, function sections, and source line numbers.
- Added an accessible flowchart modal and SVG download.
- Converted the project to a complete GitHub Pages-ready static repository.
- Strengthened execution-based mission validation and local persistence.

### 1.2.0 – Animation improvements

- Expanded `CLEAN` with sweeping movement, brush motion, and dust effects.
- Expanded `DANCE` with body movement, arm motion, and celebration effects.
- Added readable speech bubbles that display the actual output value.
- Added gradual hand-raising and turning behavior.
- Prevented execution-trace updates from moving the browser page.

## License

Released under the [MIT License](LICENSE).
