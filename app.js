(() => {
  "use strict";

  const APP_VERSION = "1.3.0 – GitHub Edition";
  const STORAGE_KEY = "glmRobotPseudocodeLab.v1";
  const MAX_EXECUTION_STEPS = 750;
  const DIRECTIONS = [
    { name: "NORTH", dr: -1, dc: 0, angle: 0 },
    { name: "EAST", dr: 0, dc: 1, angle: 90 },
    { name: "SOUTH", dr: 1, dc: 0, angle: 180 },
    { name: "WEST", dr: 0, dc: -1, angle: 270 }
  ];

  const SENSOR_NAMES = new Set([
    "FRONT_IS_CLEAR", "LEFT_IS_CLEAR", "RIGHT_IS_CLEAR", "FRONT_IS_BLOCKED", "ON_GOAL",
    "CURRENT_TASK", "ON_TASK_SPOT", "ON_CLEAN_SPOT", "ON_DANCE_SPOT", "ON_SPEAK_SPOT", "ON_HAND_SPOT"
  ]);

  const ACTION_LABELS = {
    C: { name: "Clean", command: "CLEAN", colorClass: "spot-c", color: "#238d68" },
    D: { name: "Dance", command: "DANCE", colorClass: "spot-d", color: "#9453b3" },
    T: { name: "Speak", command: "OUTPUT", colorClass: "spot-t", color: "#cc6b2d" },
    H: { name: "Raise hand", command: "RAISE HAND", colorClass: "spot-h", color: "#1a78a5" }
  };

  const MISSIONS = [
    {
      id: 1,
      title: "The Welcome Route",
      concept: "Sequence and output",
      objective: "Follow an ordered route and make the robot speak on the T spot before reaching the goal.",
      instructions: "Move along the corridor. When the robot stands on T, use an OUTPUT instruction. Reaching the goal without speaking will not complete the mission.",
      hint: "A sequence runs from top to bottom. Count the squares carefully and place the output instruction at the correct moment.",
      concepts: ["Ordered sequence", "Robot movement", "Output"],
      starter: `START
  OUTPUT "Mission started"
  // Add the ordered robot actions here.
END`,
      grid: [
        "#########",
        "#S.T..G##",
        "#########"
      ],
      direction: "EAST",
      requirements: { sequence: true, outputAtTask: true }
    },
    {
      id: 2,
      title: "Read, Store, Act",
      concept: "Inputs and variables",
      objective: "Read a task sensor into a variable on the C spot, use the stored value, clean, and reach the goal.",
      instructions: "Travel to C. While standing there, read CURRENT_TASK into a variable, use OUTPUT to report that variable, then CLEAN the square. Continue to the goal.",
      hint: "INPUT CURRENT_TASK INTO task stores the sensor reading. OUTPUT task proves that the stored value was used.",
      concepts: ["Sensor input", "Variable storage", "Output from a variable"],
      starter: `START
  // Navigate to the cleaning spot.
  INPUT CURRENT_TASK INTO task
  OUTPUT task
  // Complete the task and continue.
END`,
      grid: [
        "#########",
        "#S.C..G##",
        "#########"
      ],
      direction: "EAST",
      requirements: { inputAtTask: true, storedVariableUsed: true }
    },
    {
      id: 3,
      title: "Decision at the Wall",
      concept: "Conditional decisions",
      objective: "Use a navigation sensor in a real decision to turn at the wall and reach the goal.",
      instructions: "The corridor bends. Evaluate a sensor when the robot reaches the blocked path and use an IF structure to choose the needed turn.",
      hint: "A useful condition reads the robot’s surroundings. Try FRONT_IS_BLOCKED or FRONT_IS_CLEAR instead of a condition that is always true.",
      concepts: ["IF structure", "Boolean sensor", "Decision tracing"],
      starter: `START
  // Move to the corner.
  IF FRONT_IS_BLOCKED THEN
    TURN RIGHT
  END IF
  // Finish the route.
END`,
      grid: [
        "#########",
        "#S..#...#",
        "###...G##",
        "#########"
      ],
      direction: "EAST",
      requirements: { sensorConditional: true }
    },
    {
      id: 4,
      title: "Dance by Counting",
      concept: "Counted loops",
      objective: "Use a counted loop for repeated movement, dance on D, and continue to the goal.",
      instructions: "The corridor contains long repeated sections. Use at least one REPEAT … TIMES structure that actually moves the robot more than once.",
      hint: "Count the squares from the start to D, remembering that one instruction moves exactly one square.",
      concepts: ["REPEAT loop", "Counting iterations", "Dance output"],
      starter: `START
  REPEAT 3 TIMES
    // Put a repeated action here.
  END REPEAT
  // Complete the dance spot and route.
END`,
      grid: [
        "###########",
        "#S....D..G#",
        "###########"
      ],
      direction: "EAST",
      requirements: { countedLoop: true }
    },
    {
      id: 5,
      title: "Variable-Length Turns",
      concept: "Variables and patterns",
      objective: "Store a distance in a variable, use it in a repeated movement pattern, raise a hand on H, and reach the goal.",
      instructions: "The route has repeated straight sections. Create a numeric variable with SET, then use that variable as the repeat count at least once.",
      hint: "SET steps TO 4 creates a number variable. REPEAT steps TIMES uses the stored value.",
      concepts: ["Numeric variable", "Variable as loop count", "Repeated path pattern"],
      starter: `START
  SET steps TO 4
  REPEAT steps TIMES
    // Add the repeated movement.
  END REPEAT
  // Navigate the remaining turns.
END`,
      grid: [
        "#########",
        "#S....###",
        "#####.###",
        "#H....###",
        "#.#######",
        "#.....G##",
        "#########"
      ],
      direction: "EAST",
      requirements: { variableLoop: true }
    },
    {
      id: 6,
      title: "Until the Corridor Ends",
      concept: "Condition-controlled loops",
      objective: "Use a WHILE loop that responds to a sensor instead of a fixed count.",
      instructions: "Move while the path in front is clear. After the first corridor ends, turn into the next section and use condition-controlled movement again.",
      hint: "WHILE FRONT_IS_CLEAR DO repeats only while the front sensor is true. The condition is checked before every iteration.",
      concepts: ["WHILE loop", "Repeated sensor checks", "Loop exit"],
      starter: `START
  WHILE FRONT_IS_CLEAR DO
    // Add the action that should repeat.
  END WHILE
  // Turn and continue to the goal.
END`,
      grid: [
        "#########",
        "#S.....##",
        "######.##",
        "#G.....##",
        "#########"
      ],
      direction: "EAST",
      requirements: { whileLoop: true }
    },
    {
      id: 7,
      title: "Navigator Loop",
      concept: "IF/ELSE inside a loop",
      objective: "Place an IF/ELSE decision inside a loop so the robot moves when clear and turns when blocked.",
      instructions: "Use one counted loop as the navigator. On each iteration, test the front sensor: move when it is clear, or turn when it is blocked.",
      hint: "Both branches must really run. The route includes clear squares and walls, so a correctly placed IF/ELSE will produce both TRUE and FALSE results.",
      concepts: ["Nested control structures", "IF/ELSE", "Decision inside loop"],
      starter: `START
  REPEAT 12 TIMES
    IF FRONT_IS_CLEAR THEN
      // Move when possible.
    ELSE
      // Turn at the wall.
    END IF
  END REPEAT
END`,
      grid: [
        "########",
        "#S....##",
        "#####.##",
        "#G....##",
        "########"
      ],
      direction: "EAST",
      requirements: { ifElseInLoop: true }
    },
    {
      id: 8,
      title: "Action-Spot Inspector",
      concept: "Sensor inputs and nested logic",
      objective: "Detect four different unfinished action spots and complete the correct task at each one.",
      instructions: "Use ON_TASK_SPOT to decide when a task is present. On a task spot, read CURRENT_TASK into a variable and use nested decisions to choose CLEAN, DANCE, OUTPUT, or RAISE HAND.",
      hint: "The task condition counts only when it is evaluated while the robot is actually standing on an unfinished spot. An always-true condition will not satisfy the mission.",
      concepts: ["Task sensors", "Nested IF logic", "Input-driven action"],
      starter: `START
  WHILE NOT ON_GOAL DO
    IF ON_TASK_SPOT THEN
      INPUT CURRENT_TASK INTO task
      // Use nested decisions to handle task.
    ELSE
      MOVE FORWARD
    END IF
  END WHILE
END`,
      grid: [
        "################",
        "#S.C.D.T.H...G##",
        "################"
      ],
      direction: "EAST",
      requirements: { taskConditional: true, nestedTaskLogic: true, allTaskKinds: true }
    },
    {
      id: 9,
      title: "Call the Celebration",
      concept: "Functions and calls",
      objective: "Define a reusable function, call it on the D spot, and reach the goal.",
      instructions: "Create a function containing the celebration actions. Navigate to D, call the function there, then continue. A definition that is never called will not pass.",
      hint: "FUNCTION celebrate() defines the steps. CALL celebrate() is what actually executes them.",
      concepts: ["Function definition", "Function call", "Reusable actions"],
      starter: `START
  // Navigate to the dance spot.
  CALL celebrate()
  // Continue to the goal.

  FUNCTION celebrate()
    OUTPUT "Celebrating"
    DANCE
  END FUNCTION
END`,
      grid: [
        "##########",
        "#S...D..G#",
        "##########"
      ],
      direction: "EAST",
      requirements: { calledFunction: true }
    },
    {
      id: 10,
      title: "Capstone Rescue Route",
      concept: "Integrated algorithm",
      objective: "Combine sensors, variables, decisions, loops, actions, and a called function in one reliable maze algorithm.",
      instructions: "Navigate the entire bent corridor, handle C, D, and T with live task sensors, and finish at the goal. The program must use an input, a loop, a sensor-based decision, and a function that is actually called.",
      hint: "Separate the problem: a navigation loop can decide whether to act, move, or turn; a function can read CURRENT_TASK and complete the correct action.",
      concepts: ["Decomposition", "Integrated control structures", "Execution-based validation"],
      starter: `START
  WHILE NOT ON_GOAL DO
    IF ON_TASK_SPOT THEN
      CALL handleTask()
    ELSE
      // Add sensor-based navigation logic.
    END IF
  END WHILE

  FUNCTION handleTask()
    INPUT CURRENT_TASK INTO task
    // Complete the task selected by the input.
  END FUNCTION
END`,
      grid: [
        "#############",
        "#S...C.....##",
        "##########.##",
        "#D.........##",
        "#.###########",
        "#....T...G###",
        "#############"
      ],
      direction: "EAST",
      requirements: { integrated: true }
    }
  ];

  class PseudocodeError extends Error {
    constructor(message, line = null) {
      super(message);
      this.name = "PseudocodeError";
      this.line = line;
    }
  }

  function stripComment(sourceLine) {
    let inString = false;
    let escaped = false;
    for (let i = 0; i < sourceLine.length - 1; i += 1) {
      const char = sourceLine[i];
      if (char === "\\" && inString) { escaped = !escaped; continue; }
      if (char === '"' && !escaped) inString = !inString;
      escaped = false;
      if (!inString && char === "/" && sourceLine[i + 1] === "/") return sourceLine.slice(0, i);
    }
    return sourceLine;
  }

  function tokenizeLine(text, line) {
    const tokens = [];
    let index = 0;
    while (index < text.length) {
      const char = text[index];
      if (/\s/.test(char)) { index += 1; continue; }
      if (char === '"') {
        let value = "";
        let closed = false;
        index += 1;
        while (index < text.length) {
          const current = text[index];
          if (current === "\\" && index + 1 < text.length) {
            const next = text[index + 1];
            value += next === "n" ? "\n" : next === "t" ? "\t" : next;
            index += 2;
          } else if (current === '"') {
            closed = true;
            index += 1;
            break;
          } else {
            value += current;
            index += 1;
          }
        }
        if (!closed) throw new PseudocodeError("This text value needs a closing quotation mark.", line);
        tokens.push({ type: "string", value });
        continue;
      }
      const two = text.slice(index, index + 2);
      if (["<=", ">=", "!="].includes(two)) {
        tokens.push({ type: "operator", value: two });
        index += 2;
        continue;
      }
      if (["=", "<", ">", "(", ")", ","].includes(char)) {
        tokens.push({ type: char === "(" || char === ")" || char === "," ? "punctuation" : "operator", value: char });
        index += 1;
        continue;
      }
      const number = text.slice(index).match(/^\d+(?:\.\d+)?/);
      if (number) {
        tokens.push({ type: "number", value: Number(number[0]) });
        index += number[0].length;
        continue;
      }
      const word = text.slice(index).match(/^[A-Za-z_][A-Za-z0-9_]*/);
      if (word) {
        tokens.push({ type: "word", value: word[0], upper: word[0].toUpperCase() });
        index += word[0].length;
        continue;
      }
      throw new PseudocodeError(`The symbol “${char}” is not recognized.`, line);
    }
    return tokens;
  }

  function meaningfulLines(source) {
    return source.replace(/\r\n?/g, "\n").split("\n").map((raw, index) => {
      const text = stripComment(raw).trim();
      return { raw, text, line: index + 1, tokens: text ? tokenizeLine(text, index + 1) : [] };
    }).filter(item => item.text.length > 0);
  }

  function words(tokens) {
    return tokens.map(token => token.type === "word" ? token.upper : token.type === "string" ? `"${token.value}"` : String(token.value));
  }

  function expressionFrom(tokens, line) {
    let cursor = 0;
    const peek = () => tokens[cursor];
    const take = () => tokens[cursor++];

    function primary() {
      const token = take();
      if (!token) throw new PseudocodeError("A value or condition is missing.", line);
      if (token.type === "number" || token.type === "string") return { type: "literal", value: token.value, line };
      if (token.type === "word") {
        if (token.upper === "TRUE") return { type: "literal", value: true, line };
        if (token.upper === "FALSE") return { type: "literal", value: false, line };
        if (token.upper === "NOT") return { type: "unary", operator: "NOT", value: primary(), line };
        return { type: SENSOR_NAMES.has(token.upper) ? "sensor" : "variable", name: token.upper, originalName: token.value, line };
      }
      if (token.value === "(") {
        const value = orExpression();
        const closing = take();
        if (!closing || closing.value !== ")") throw new PseudocodeError("A closing parenthesis is missing.", line);
        return value;
      }
      throw new PseudocodeError("This condition contains an unexpected item.", line);
    }

    function comparison() {
      let left = primary();
      const token = peek();
      if (token && token.type === "operator") {
        take();
        left = { type: "binary", operator: token.value, left, right: primary(), line };
      }
      return left;
    }

    function andExpression() {
      let left = comparison();
      while (peek() && peek().type === "word" && peek().upper === "AND") {
        take();
        left = { type: "binary", operator: "AND", left, right: comparison(), line };
      }
      return left;
    }

    function orExpression() {
      let left = andExpression();
      while (peek() && peek().type === "word" && peek().upper === "OR") {
        take();
        left = { type: "binary", operator: "OR", left, right: andExpression(), line };
      }
      return left;
    }

    const result = orExpression();
    if (cursor < tokens.length) throw new PseudocodeError("Check the order of values and operators in this condition.", line);
    return result;
  }

  function parseProgram(source) {
    const lines = meaningfulLines(source);
    if (!lines.length) throw new PseudocodeError("The program is empty. Begin with START.", 1);
    let cursor = 0;
    const functions = new Map();
    const current = () => lines[cursor];
    const signature = item => words(item.tokens).join(" ");

    if (signature(current()) !== "START") throw new PseudocodeError("The first instruction must be START.", current().line);
    const startLine = current().line;
    cursor += 1;

    function parseBlock(endSignatures, context = "program") {
      const body = [];
      while (cursor < lines.length) {
        const item = current();
        const sig = signature(item);
        if (endSignatures.includes(sig)) return { body, end: sig, endLine: item.line };
        const tokens = item.tokens;
        const first = tokens[0];
        const upper = first.type === "word" ? first.upper : "";

        if (["ELSE", "END IF", "END REPEAT", "END WHILE", "END FUNCTION"].includes(sig)) {
          throw new PseudocodeError(`“${item.text}” does not match an open structure.`, item.line);
        }
        if (upper === "START") throw new PseudocodeError("START may appear only once at the beginning.", item.line);

        if (upper === "IF") {
          const thenIndex = tokens.findIndex(token => token.type === "word" && token.upper === "THEN");
          if (thenIndex < 2 || thenIndex !== tokens.length - 1) throw new PseudocodeError("Write the decision as IF condition THEN.", item.line);
          const node = { type: "if", condition: expressionFrom(tokens.slice(1, thenIndex), item.line), line: item.line, text: item.text };
          cursor += 1;
          const trueBlock = parseBlock(["ELSE", "END IF"], "IF");
          node.thenBody = trueBlock.body;
          node.elseBody = [];
          if (trueBlock.end === "ELSE") {
            cursor += 1;
            const falseBlock = parseBlock(["END IF"], "IF");
            node.elseBody = falseBlock.body;
          }
          if (cursor >= lines.length || signature(current()) !== "END IF") throw new PseudocodeError("This IF structure needs END IF.", item.line);
          node.endLine = current().line;
          cursor += 1;
          body.push(node);
          continue;
        }

        if (upper === "REPEAT") {
          const timesIndex = tokens.findIndex(token => token.type === "word" && token.upper === "TIMES");
          if (timesIndex < 2 || timesIndex !== tokens.length - 1) throw new PseudocodeError("Write the loop as REPEAT number TIMES.", item.line);
          const node = { type: "repeat", count: expressionFrom(tokens.slice(1, timesIndex), item.line), line: item.line, text: item.text };
          cursor += 1;
          const block = parseBlock(["END REPEAT"], "REPEAT");
          if (cursor >= lines.length) throw new PseudocodeError("This REPEAT loop needs END REPEAT.", item.line);
          node.body = block.body;
          node.endLine = current().line;
          cursor += 1;
          body.push(node);
          continue;
        }

        if (upper === "WHILE") {
          const doIndex = tokens.findIndex(token => token.type === "word" && token.upper === "DO");
          if (doIndex < 2 || doIndex !== tokens.length - 1) throw new PseudocodeError("Write the loop as WHILE condition DO.", item.line);
          const node = { type: "while", condition: expressionFrom(tokens.slice(1, doIndex), item.line), line: item.line, text: item.text };
          cursor += 1;
          const block = parseBlock(["END WHILE"], "WHILE");
          if (cursor >= lines.length) throw new PseudocodeError("This WHILE loop needs END WHILE.", item.line);
          node.body = block.body;
          node.endLine = current().line;
          cursor += 1;
          body.push(node);
          continue;
        }

        if (upper === "FUNCTION") {
          const match = item.text.match(/^FUNCTION\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(\s*\)\s*$/i);
          if (!match) throw new PseudocodeError("Write the definition as FUNCTION name().", item.line);
          const name = match[1].toUpperCase();
          if (functions.has(name)) throw new PseudocodeError(`The function ${match[1]} is defined more than once.`, item.line);
          cursor += 1;
          const block = parseBlock(["END FUNCTION"], "FUNCTION");
          if (cursor >= lines.length) throw new PseudocodeError("This function needs END FUNCTION.", item.line);
          functions.set(name, { type: "function", name, displayName: match[1], body: block.body, line: item.line, endLine: current().line, text: item.text });
          cursor += 1;
          continue;
        }

        if (upper === "CALL") {
          const match = item.text.match(/^CALL\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(\s*\)\s*$/i);
          if (!match) throw new PseudocodeError("Write a function call as CALL name().", item.line);
          body.push({ type: "call", name: match[1].toUpperCase(), displayName: match[1], line: item.line, text: item.text });
          cursor += 1;
          continue;
        }

        if (upper === "INPUT") {
          const intoIndex = tokens.findIndex(token => token.type === "word" && token.upper === "INTO");
          if (tokens.length !== 4 || intoIndex !== 2 || tokens[1].type !== "word" || tokens[3].type !== "word") {
            throw new PseudocodeError("Write sensor input as INPUT SENSOR INTO variable.", item.line);
          }
          const sensor = tokens[1].upper;
          if (!SENSOR_NAMES.has(sensor)) throw new PseudocodeError(`${tokens[1].value} is not an available sensor.`, item.line);
          body.push({ type: "input", sensor, variable: tokens[3].upper, displayVariable: tokens[3].value, line: item.line, text: item.text });
          cursor += 1;
          continue;
        }

        if (upper === "OUTPUT") {
          if (tokens.length < 2) throw new PseudocodeError("OUTPUT needs a message or value.", item.line);
          body.push({ type: "output", value: expressionFrom(tokens.slice(1), item.line), line: item.line, text: item.text });
          cursor += 1;
          continue;
        }

        if (upper === "SET") {
          const toIndex = tokens.findIndex(token => token.type === "word" && token.upper === "TO");
          if (tokens.length < 4 || tokens[1].type !== "word" || toIndex !== 2) throw new PseudocodeError("Create a variable with SET name TO value.", item.line);
          body.push({ type: "set", variable: tokens[1].upper, displayVariable: tokens[1].value, value: expressionFrom(tokens.slice(3), item.line), line: item.line, text: item.text });
          cursor += 1;
          continue;
        }

        if (tokens.length >= 3 && tokens[0].type === "word" && tokens[1].value === "=") {
          body.push({ type: "set", variable: tokens[0].upper, displayVariable: tokens[0].value, value: expressionFrom(tokens.slice(2), item.line), line: item.line, text: item.text });
          cursor += 1;
          continue;
        }

        const actionText = sig;
        const actionTypes = {
          "MOVE FORWARD": "MOVE_FORWARD",
          "TURN LEFT": "TURN_LEFT",
          "TURN RIGHT": "TURN_RIGHT",
          "CLEAN": "CLEAN",
          "DANCE": "DANCE",
          "RAISE HAND": "RAISE_HAND"
        };
        if (actionTypes[actionText]) {
          body.push({ type: "action", action: actionTypes[actionText], line: item.line, text: item.text });
          cursor += 1;
          continue;
        }

        if (upper === "END") {
          if (context !== "program") throw new PseudocodeError(`Close the ${context} structure before END.`, item.line);
          return { body, end: "END", endLine: item.line };
        }
        throw new PseudocodeError("This instruction is not recognized. Check spelling and the Pseudocode reference.", item.line);
      }
      return { body, end: null, endLine: null };
    }

    const main = parseBlock(["END"], "program");
    if (main.end !== "END") throw new PseudocodeError("The program needs END after its instructions.", lines[lines.length - 1].line);
    const endLine = current().line;
    cursor += 1;
    if (cursor < lines.length) throw new PseudocodeError("No instructions may appear after END.", current().line);
    for (const node of walkNodes(main.body)) {
      if (node.type === "call" && !functions.has(node.name)) throw new PseudocodeError(`The function ${node.displayName} is called but not defined.`, node.line);
    }
    for (const definition of functions.values()) {
      for (const node of walkNodes(definition.body)) {
        if (node.type === "call" && !functions.has(node.name)) throw new PseudocodeError(`The function ${node.displayName} is called but not defined.`, node.line);
      }
    }
    return { type: "program", startLine, endLine, body: main.body, functions, source };
  }

  function* walkNodes(body) {
    for (const node of body) {
      yield node;
      if (node.type === "if") {
        yield* walkNodes(node.thenBody);
        yield* walkNodes(node.elseBody);
      } else if (node.type === "repeat" || node.type === "while") {
        yield* walkNodes(node.body);
      }
    }
  }

  function analyzeMaze(mission) {
    const rows = mission.grid.length;
    const cols = mission.grid[0].length;
    let start = null;
    let goal = null;
    const tasks = new Map();
    mission.grid.forEach((row, r) => {
      if (row.length !== cols) throw new Error(`Mission ${mission.id} has an uneven maze row.`);
      [...row].forEach((cell, c) => {
        if (cell === "S") start = { row: r, col: c };
        if (cell === "G") goal = { row: r, col: c };
        if (ACTION_LABELS[cell]) tasks.set(`${r},${c}`, cell);
      });
    });
    if (!start || !goal) throw new Error(`Mission ${mission.id} needs a start and goal.`);
    return { rows, cols, start, goal, tasks };
  }

  function directionIndex(name) {
    const index = DIRECTIONS.findIndex(direction => direction.name === name);
    return index >= 0 ? index : 1;
  }

  function createRuntime(mission) {
    const maze = analyzeMaze(mission);
    return {
      mission,
      maze,
      row: maze.start.row,
      col: maze.start.col,
      direction: directionIndex(mission.direction),
      variables: new Map(),
      outputs: [],
      completedTasks: new Set(),
      collision: false,
      stopped: false,
      safetyLimitHit: false,
      finished: false,
      steps: 0,
      metrics: {
        actions: 0,
        actionKinds: new Set(),
        inputs: [],
        assignments: [],
        variableReads: new Set(),
        conditions: [],
        repeatIterations: 0,
        whileIterations: 0,
        repeatActions: 0,
        whileActions: 0,
        repeatCountVariables: new Set(),
        calledFunctions: new Set(),
        callCount: 0,
        functionNodes: 0,
        maxIfDepth: 0,
        allBranches: new Map()
      }
    };
  }

  function cellAt(runtime, row, col) {
    if (row < 0 || col < 0 || row >= runtime.maze.rows || col >= runtime.maze.cols) return "#";
    return runtime.mission.grid[row][col];
  }

  function cellAhead(runtime, directionOffset = 0) {
    const direction = DIRECTIONS[(runtime.direction + directionOffset + 4) % 4];
    return { row: runtime.row + direction.dr, col: runtime.col + direction.dc };
  }

  function isClear(runtime, directionOffset = 0) {
    const target = cellAhead(runtime, directionOffset);
    return cellAt(runtime, target.row, target.col) !== "#";
  }

  function currentTask(runtime) {
    const key = `${runtime.row},${runtime.col}`;
    const kind = runtime.maze.tasks.get(key);
    if (!kind || runtime.completedTasks.has(key)) return "NONE";
    return ACTION_LABELS[kind].command;
  }

  function isUnfinishedTask(runtime) {
    return currentTask(runtime) !== "NONE";
  }

  function readSensor(runtime, sensor, tracker = null) {
    if (tracker) tracker.sensors.add(sensor);
    switch (sensor) {
      case "FRONT_IS_CLEAR": return isClear(runtime, 0);
      case "LEFT_IS_CLEAR": return isClear(runtime, -1);
      case "RIGHT_IS_CLEAR": return isClear(runtime, 1);
      case "FRONT_IS_BLOCKED": return !isClear(runtime, 0);
      case "ON_GOAL": return runtime.row === runtime.maze.goal.row && runtime.col === runtime.maze.goal.col;
      case "CURRENT_TASK": return currentTask(runtime);
      case "ON_TASK_SPOT": return isUnfinishedTask(runtime);
      case "ON_CLEAN_SPOT": return currentTask(runtime) === "CLEAN";
      case "ON_DANCE_SPOT": return currentTask(runtime) === "DANCE";
      case "ON_SPEAK_SPOT": return currentTask(runtime) === "OUTPUT";
      case "ON_HAND_SPOT": return currentTask(runtime) === "RAISE HAND";
      default: throw new PseudocodeError(`The sensor ${sensor} is not available.`);
    }
  }

  function evaluateExpression(expression, runtime, tracker = { sensors: new Set(), variables: new Set() }) {
    if (expression.type === "literal") return expression.value;
    if (expression.type === "sensor") return readSensor(runtime, expression.name, tracker);
    if (expression.type === "variable") {
      tracker.variables.add(expression.name);
      runtime.metrics.variableReads.add(expression.name);
      if (!runtime.variables.has(expression.name)) throw new PseudocodeError(`The variable ${expression.originalName} does not have a value yet.`, expression.line);
      return runtime.variables.get(expression.name);
    }
    if (expression.type === "unary") return !Boolean(evaluateExpression(expression.value, runtime, tracker));
    if (expression.type === "binary") {
      const left = evaluateExpression(expression.left, runtime, tracker);
      if (expression.operator === "AND") return Boolean(left) && Boolean(evaluateExpression(expression.right, runtime, tracker));
      if (expression.operator === "OR") return Boolean(left) || Boolean(evaluateExpression(expression.right, runtime, tracker));
      const right = evaluateExpression(expression.right, runtime, tracker);
      switch (expression.operator) {
        case "=": return left === right;
        case "!=": return left !== right;
        case "<": return left < right;
        case ">": return left > right;
        case "<=": return left <= right;
        case ">=": return left >= right;
        default: throw new PseudocodeError(`The operator ${expression.operator} is not supported.`, expression.line);
      }
    }
    throw new PseudocodeError("This expression could not be evaluated.", expression.line);
  }

  function taskKey(runtime) {
    return `${runtime.row},${runtime.col}`;
  }

  function markTask(runtime, command) {
    const key = taskKey(runtime);
    const kind = runtime.maze.tasks.get(key);
    if (!kind || runtime.completedTasks.has(key)) return false;
    if (ACTION_LABELS[kind].command === command) {
      runtime.completedTasks.add(key);
      return true;
    }
    return false;
  }

  class ExecutionStopped extends Error {
    constructor() { super("Program stopped"); this.name = "ExecutionStopped"; }
  }

  async function executeProgram(ast, mission, hooks = {}) {
    const runtime = createRuntime(mission);
    const noop = async () => {};
    const beforeNode = hooks.beforeNode || noop;
    const onAction = hooks.onAction || noop;
    const onOutput = hooks.onOutput || noop;
    const onStateChange = hooks.onStateChange || noop;
    const onTrace = hooks.onTrace || noop;
    const onPause = hooks.onPause || noop;
    const shouldStop = hooks.shouldStop || (() => false);

    function checkExecution(node) {
      if (shouldStop()) {
        runtime.stopped = true;
        throw new ExecutionStopped();
      }
      runtime.steps += 1;
      if (runtime.steps > MAX_EXECUTION_STEPS) {
        runtime.safetyLimitHit = true;
        throw new PseudocodeError(`The program reached the ${MAX_EXECUTION_STEPS}-step safety limit. Check for an infinite loop.`, node.line);
      }
    }

    function conditionRecord(node, value, tracker, context) {
      const unfinished = isUnfinishedTask(runtime);
      const taskSensors = [...tracker.sensors].filter(sensor => sensor === "CURRENT_TASK" || sensor.startsWith("ON_"));
      const record = {
        line: node.line,
        result: Boolean(value),
        sensors: new Set(tracker.sensors),
        variables: new Set(tracker.variables),
        row: runtime.row,
        col: runtime.col,
        unfinishedTask: unfinished,
        taskRelevant: unfinished && taskSensors.length > 0,
        loopDepth: context.loopDepth,
        ifDepth: context.ifDepth
      };
      runtime.metrics.conditions.push(record);
      const outcomes = runtime.metrics.allBranches.get(node.line) || new Set();
      outcomes.add(Boolean(value));
      runtime.metrics.allBranches.set(node.line, outcomes);
      return record;
    }

    async function runAction(node, context) {
      const action = node.action;
      runtime.metrics.actions += 1;
      runtime.metrics.actionKinds.add(action);
      if (context.repeatDepth > 0) runtime.metrics.repeatActions += 1;
      if (context.whileDepth > 0) runtime.metrics.whileActions += 1;
      if (action === "MOVE_FORWARD") {
        if (!isClear(runtime, 0)) {
          runtime.collision = true;
          await onAction(action, runtime, { collision: true, from: { row: runtime.row, col: runtime.col } }, node);
          throw new PseudocodeError("The robot tried to move forward into a wall. Check the route or add a sensor decision.", node.line);
        }
        const from = { row: runtime.row, col: runtime.col };
        const target = cellAhead(runtime, 0);
        runtime.row = target.row;
        runtime.col = target.col;
        await onAction(action, runtime, { from, to: target }, node);
      } else if (action === "TURN_LEFT") {
        const fromDirection = runtime.direction;
        runtime.direction = (runtime.direction + 3) % 4;
        await onAction(action, runtime, { fromDirection, toDirection: runtime.direction }, node);
      } else if (action === "TURN_RIGHT") {
        const fromDirection = runtime.direction;
        runtime.direction = (runtime.direction + 1) % 4;
        await onAction(action, runtime, { fromDirection, toDirection: runtime.direction }, node);
      } else if (action === "CLEAN") {
        const completed = markTask(runtime, "CLEAN");
        await onAction(action, runtime, { completed }, node);
      } else if (action === "DANCE") {
        const completed = markTask(runtime, "DANCE");
        await onAction(action, runtime, { completed }, node);
      } else if (action === "RAISE_HAND") {
        const completed = markTask(runtime, "RAISE HAND");
        await onAction(action, runtime, { completed }, node);
      }
      await onStateChange(runtime);
    }

    async function runBlock(body, context) {
      for (const node of body) {
        checkExecution(node);
        if (context.callDepth > 0) runtime.metrics.functionNodes += 1;
        await beforeNode(node, runtime);
        if (node.type === "action") {
          await runAction(node, context);
        } else if (node.type === "output") {
          const tracker = { sensors: new Set(), variables: new Set() };
          const value = evaluateExpression(node.value, runtime, tracker);
          const message = String(value);
          runtime.outputs.push(message);
          runtime.metrics.actions += 1;
          runtime.metrics.actionKinds.add("OUTPUT");
          if (context.repeatDepth > 0) runtime.metrics.repeatActions += 1;
          if (context.whileDepth > 0) runtime.metrics.whileActions += 1;
          const completed = markTask(runtime, "OUTPUT");
          await onOutput(message, runtime, { completed }, node);
          await onStateChange(runtime);
        } else if (node.type === "input") {
          const unfinishedBefore = isUnfinishedTask(runtime);
          const value = readSensor(runtime, node.sensor);
          runtime.variables.set(node.variable, value);
          runtime.metrics.assignments.push({ variable: node.variable, source: "input", line: node.line });
          runtime.metrics.inputs.push({ sensor: node.sensor, variable: node.variable, line: node.line, row: runtime.row, col: runtime.col, unfinishedTask: unfinishedBefore });
          await onTrace(`Stored ${formatValue(value)} in ${node.displayVariable}.`, "info", node.line);
          await onPause("input", runtime, node);
        } else if (node.type === "set") {
          const tracker = { sensors: new Set(), variables: new Set() };
          const value = evaluateExpression(node.value, runtime, tracker);
          runtime.variables.set(node.variable, value);
          runtime.metrics.assignments.push({ variable: node.variable, source: "set", line: node.line });
          await onTrace(`Set ${node.displayVariable} to ${formatValue(value)}.`, "info", node.line);
          await onPause("set", runtime, node);
        } else if (node.type === "if") {
          const tracker = { sensors: new Set(), variables: new Set() };
          const result = Boolean(evaluateExpression(node.condition, runtime, tracker));
          const nextContext = { ...context, ifDepth: context.ifDepth + 1 };
          runtime.metrics.maxIfDepth = Math.max(runtime.metrics.maxIfDepth, nextContext.ifDepth);
          conditionRecord(node, result, tracker, nextContext);
          await onTrace(`Condition is ${result ? "TRUE" : "FALSE"}.`, "condition", node.line);
          await onPause("condition", runtime, node);
          await runBlock(result ? node.thenBody : node.elseBody, nextContext);
        } else if (node.type === "repeat") {
          const tracker = { sensors: new Set(), variables: new Set() };
          const countValue = evaluateExpression(node.count, runtime, tracker);
          tracker.variables.forEach(variable => runtime.metrics.repeatCountVariables.add(variable));
          const count = Number(countValue);
          if (!Number.isInteger(count) || count < 0) throw new PseudocodeError("REPEAT needs a whole number that is zero or greater.", node.line);
          for (let iteration = 0; iteration < count; iteration += 1) {
            checkExecution(node);
            runtime.metrics.repeatIterations += 1;
            await beforeNode(node, runtime, `Iteration ${iteration + 1} of ${count}`);
            await onTrace(`Repeat iteration ${iteration + 1} of ${count}.`, "loop", node.line);
            await runBlock(node.body, { ...context, loopDepth: context.loopDepth + 1, repeatDepth: context.repeatDepth + 1 });
          }
        } else if (node.type === "while") {
          let iterations = 0;
          while (true) {
            checkExecution(node);
            await beforeNode(node, runtime, iterations ? `Checking loop after ${iterations} iteration${iterations === 1 ? "" : "s"}` : "Checking loop condition");
            const tracker = { sensors: new Set(), variables: new Set() };
            const result = Boolean(evaluateExpression(node.condition, runtime, tracker));
            conditionRecord(node, result, tracker, { ...context, ifDepth: context.ifDepth });
            await onTrace(`WHILE condition is ${result ? "TRUE" : "FALSE"}.`, "condition", node.line);
            await onPause("condition", runtime, node);
            if (!result) break;
            iterations += 1;
            runtime.metrics.whileIterations += 1;
            await runBlock(node.body, { ...context, loopDepth: context.loopDepth + 1, whileDepth: context.whileDepth + 1 });
          }
        } else if (node.type === "call") {
          const definition = ast.functions.get(node.name);
          runtime.metrics.calledFunctions.add(node.name);
          runtime.metrics.callCount += 1;
          if (context.callDepth >= 20) throw new PseudocodeError("Function calls are nested too deeply. Check for a function calling itself forever.", node.line);
          await onTrace(`Calling function ${node.displayName}().`, "call", node.line);
          await runBlock(definition.body, { ...context, callDepth: context.callDepth + 1 });
        }
      }
    }

    try {
      await hooks.onStart?.(runtime, ast);
      await onTrace("Program started.", "info", ast.startLine);
      await runBlock(ast.body, { loopDepth: 0, repeatDepth: 0, whileDepth: 0, ifDepth: 0, callDepth: 0 });
      runtime.finished = true;
      await onTrace("Program ended.", "info", ast.endLine);
      await hooks.onFinish?.(runtime, ast);
      return runtime;
    } catch (error) {
      error.runtime = runtime;
      await hooks.onError?.(error, runtime);
      throw error;
    }
  }

  function formatValue(value) {
    if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
    return String(value);
  }

  function validateMission(runtime, mission) {
    const reasons = [];
    const metrics = runtime.metrics;
    const reachedGoal = runtime.row === runtime.maze.goal.row && runtime.col === runtime.maze.goal.col;
    const unfinished = [...runtime.maze.tasks.entries()].filter(([key]) => !runtime.completedTasks.has(key));

    if (runtime.collision) reasons.push("The robot tried to move forward into a wall.");
    if (runtime.safetyLimitHit) reasons.push("The program exceeded the execution safety limit.");
    if (!reachedGoal) reasons.push("The program ended before reaching the goal.");
    for (const [, kind] of unfinished) reasons.push(`Goal check: a ${ACTION_LABELS[kind].name.toLowerCase()} spot remains unfinished.`);

    const requirements = mission.requirements;
    if (requirements.sequence && metrics.actions < 3) reasons.push("This mission needs an ordered sequence of robot actions.");
    if (requirements.outputAtTask && ![...runtime.completedTasks].some(key => runtime.maze.tasks.get(key) === "T")) reasons.push("Use OUTPUT while the robot is standing on the speaking spot.");

    if (requirements.inputAtTask && !metrics.inputs.some(input => input.sensor === "CURRENT_TASK" && input.unfinishedTask)) {
      reasons.push("Read CURRENT_TASK while the robot is standing on the unfinished action spot.");
    }
    if (requirements.storedVariableUsed) {
      const stored = metrics.inputs.find(input => input.sensor === "CURRENT_TASK" && input.unfinishedTask);
      if (!stored || !metrics.variableReads.has(stored.variable)) reasons.push("Store the task input in a variable and use that variable later.");
    }
    if (requirements.sensorConditional && !metrics.conditions.some(condition => condition.sensors.size > 0)) {
      reasons.push("This mission requires a sensor condition that is actually evaluated.");
    }
    if (requirements.countedLoop && (metrics.repeatIterations < 2 || metrics.repeatActions < 2)) reasons.push("This mission requires a counted loop that repeats robot actions more than once.");
    if (requirements.variableLoop) {
      const setVariables = new Set(metrics.assignments.filter(item => item.source === "set").map(item => item.variable));
      const usedSetVariable = [...setVariables].some(variable => metrics.repeatCountVariables.has(variable));
      if (!usedSetVariable || metrics.repeatIterations < 2 || metrics.repeatActions < 2) reasons.push("Set a numeric variable and use its value as the count for an executed repeated pattern.");
    }
    if (requirements.whileLoop && (metrics.whileIterations < 2 || metrics.whileActions < 2)) reasons.push("This mission requires a WHILE loop that completes repeated robot actions.");
    if (requirements.ifElseInLoop) {
      const inLoop = metrics.conditions.filter(condition => condition.loopDepth > 0);
      const outcomes = new Set(inLoop.map(condition => condition.result));
      if (inLoop.length === 0) reasons.push("Place an IF/ELSE decision inside an executed loop.");
      else if (!(outcomes.has(true) && outcomes.has(false))) reasons.push("The decision inside the loop must execute both its TRUE and FALSE paths on this maze.");
    }
    if (requirements.taskConditional && !metrics.conditions.some(condition => condition.taskRelevant)) {
      reasons.push("The task condition was written but was never evaluated at an unfinished action spot.");
    }
    if (requirements.nestedTaskLogic) {
      const nested = metrics.conditions.some(condition => condition.unfinishedTask && condition.ifDepth >= 2 && [...condition.variables].some(variable => metrics.inputs.some(input => input.variable === variable && input.sensor === "CURRENT_TASK" && input.row === condition.row && input.col === condition.col)));
      const taskInput = metrics.inputs.some(input => input.sensor === "CURRENT_TASK" && input.unfinishedTask);
      if (!nested || !taskInput) reasons.push("Use a task input and nested logic while the robot is standing on an unfinished action spot.");
    }
    if (requirements.allTaskKinds) {
      const completedKinds = new Set([...runtime.completedTasks].map(key => runtime.maze.tasks.get(key)));
      if (!["C", "D", "T", "H"].every(kind => completedKinds.has(kind))) reasons.push("Complete all four kinds of action spots with the matching commands.");
    }
    if (requirements.calledFunction && (metrics.callCount === 0 || metrics.functionNodes === 0)) reasons.push("The function was defined but never called, or its called body did not execute any instructions.");
    if (requirements.integrated) {
      if (metrics.callCount === 0 || metrics.functionNodes === 0) reasons.push("The capstone requires a function whose called body actually executes instructions.");
      if (metrics.whileIterations + metrics.repeatIterations < 2) reasons.push("The capstone requires an executed loop.");
      if (!metrics.inputs.some(input => input.unfinishedTask)) reasons.push("The capstone requires a sensor input read at an unfinished action spot.");
      if (!metrics.conditions.some(condition => condition.sensors.size > 0)) reasons.push("The capstone requires an evaluated sensor-based decision.");
    }

    return { success: reasons.length === 0, reasons };
  }

  function expressionLabel(expression) {
    if (expression.type === "literal") return typeof expression.value === "string" ? `"${expression.value}"` : formatValue(expression.value);
    if (expression.type === "sensor") return expression.name;
    if (expression.type === "variable") return expression.originalName;
    if (expression.type === "unary") return `NOT ${expressionLabel(expression.value)}`;
    if (expression.type === "binary") return `${expressionLabel(expression.left)} ${expression.operator} ${expressionLabel(expression.right)}`;
    return "value";
  }

  function nodeFlowLabel(node) {
    if (node.type === "action") return node.text.toUpperCase();
    if (node.type === "output") return `OUTPUT ${expressionLabel(node.value)}`;
    if (node.type === "input") return `INPUT ${node.sensor} INTO ${node.displayVariable}`;
    if (node.type === "set") return `SET ${node.displayVariable} TO ${expressionLabel(node.value)}`;
    if (node.type === "call") return `CALL ${node.displayName}()`;
    if (node.type === "if") return expressionLabel(node.condition);
    if (node.type === "while") return `WHILE ${expressionLabel(node.condition)}`;
    if (node.type === "repeat") return `REPEAT ${expressionLabel(node.count)} TIMES`;
    return node.text || node.type;
  }

  function createFlowchart(ast) {
    const graph = { nodes: [], edges: [], sections: [] };
    let idCounter = 0;
    const dimensions = {
      terminator: [210, 62],
      process: [240, 72],
      io: [260, 76],
      decision: [270, 112],
      subprocess: [240, 74],
      join: [22, 22]
    };

    function addNode(shape, label, line, x, y, section = "main") {
      const [width, height] = dimensions[shape];
      const node = { id: `n${++idCounter}`, shape, label, line, x, y, width, height, section };
      graph.nodes.push(node);
      return node;
    }

    function addEdge(from, to, label = "", kind = "normal") {
      graph.edges.push({ from: from.id, to: to.id, label, kind });
    }

    function simpleShape(node) {
      if (node.type === "input" || node.type === "output") return "io";
      if (node.type === "call") return "subprocess";
      return "process";
    }

    function layoutSequence(body, x, startY, incoming, section) {
      let y = startY;
      let previous = incoming;
      let first = null;
      for (const node of body) {
        if (node.type === "if") {
          const decision = addNode("decision", nodeFlowLabel(node), node.line, x, y, section);
          if (previous) addEdge(previous, decision);
          if (!first) first = decision;
          const branchY = y + 160;
          const trueResult = layoutSequence(node.thenBody, x - 250, branchY, null, section);
          const falseResult = layoutSequence(node.elseBody, x + 250, branchY, null, section);
          const trueEndY = trueResult.nextY || branchY;
          const falseEndY = falseResult.nextY || branchY;
          const joinY = Math.max(trueEndY, falseEndY) + 72;
          const join = addNode("join", "", node.endLine, x, joinY, section);
          if (trueResult.first) {
            addEdge(decision, trueResult.first, "TRUE");
            addEdge(trueResult.last, join);
          } else addEdge(decision, join, "TRUE");
          if (falseResult.first) {
            addEdge(decision, falseResult.first, "FALSE");
            addEdge(falseResult.last, join);
          } else addEdge(decision, join, "FALSE");
          previous = join;
          y = joinY + 82;
          continue;
        }

        if (node.type === "while" || node.type === "repeat") {
          const decision = addNode("decision", nodeFlowLabel(node), node.line, x, y, section);
          if (previous) addEdge(previous, decision);
          if (!first) first = decision;
          const bodyResult = layoutSequence(node.body, x - 250, y + 160, null, section);
          const loopBottom = bodyResult.nextY || y + 180;
          const joinY = loopBottom + 90;
          const join = addNode("join", "", node.endLine, x, joinY, section);
          if (bodyResult.first) {
            addEdge(decision, bodyResult.first, node.type === "while" ? "TRUE" : "LOOP");
            addEdge(bodyResult.last, decision, "BACK", "back");
          } else {
            addEdge(decision, decision, "BACK", "back");
          }
          addEdge(decision, join, node.type === "while" ? "FALSE / EXIT" : "EXIT");
          previous = join;
          y = joinY + 82;
          continue;
        }

        const flowNode = addNode(simpleShape(node), nodeFlowLabel(node), node.line, x, y, section);
        if (previous) addEdge(previous, flowNode);
        if (!first) first = flowNode;
        previous = flowNode;
        y += 116;
      }
      return { first, last: previous === incoming ? null : previous, nextY: y };
    }

    const start = addNode("terminator", "START", ast.startLine, 0, 50, "main");
    graph.sections.push({ label: "MAIN PROGRAM", y: 0 });
    const mainResult = layoutSequence(ast.body, 0, 160, start, "main");
    const endY = Math.max(mainResult.nextY, 220);
    const end = addNode("terminator", "END", ast.endLine, 0, endY, "main");
    addEdge(mainResult.last || start, end);

    let functionY = endY + 210;
    for (const definition of ast.functions.values()) {
      graph.sections.push({ label: `FUNCTION ${definition.displayName}()`, y: functionY - 55 });
      const functionStart = addNode("terminator", `FUNCTION ${definition.displayName}()`, definition.line, 0, functionY, definition.name);
      const functionResult = layoutSequence(definition.body, 0, functionY + 110, functionStart, definition.name);
      functionY = Math.max(functionResult.nextY, functionY + 170);
      const functionEnd = addNode("terminator", "END FUNCTION", definition.endLine, 0, functionY, definition.name);
      addEdge(functionResult.last || functionStart, functionEnd);
      functionY += 180;
    }

    const svg = renderFlowchartSvg(graph);
    if (/NaN|undefined/.test(svg)) throw new Error("The flowchart layout produced an invalid coordinate.");
    return svg;
  }

  function escapeXml(value) {
    return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[character]));
  }

  function wrapLabel(label, max = 30) {
    if (!label) return [];
    const wordsList = label.split(/\s+/);
    const lines = [];
    let current = "";
    for (const word of wordsList) {
      if (!current) current = word;
      else if (`${current} ${word}`.length <= max) current += ` ${word}`;
      else { lines.push(current); current = word; }
    }
    if (current) lines.push(current);
    return lines.slice(0, 4);
  }

  function renderFlowchartSvg(graph) {
    const nodeById = new Map(graph.nodes.map(node => [node.id, node]));
    const minX = Math.min(...graph.nodes.map(node => node.x - node.width / 2), -350) - 180;
    const maxX = Math.max(...graph.nodes.map(node => node.x + node.width / 2), 350) + 180;
    const minY = -35;
    const maxY = Math.max(...graph.nodes.map(node => node.y + node.height / 2)) + 100;
    const width = Math.ceil(maxX - minX);
    const height = Math.ceil(maxY - minY);
    const tx = -minX;
    const ty = -minY;
    const x = value => Number((value + tx).toFixed(2));
    const y = value => Number((value + ty).toFixed(2));

    const edgeMarkup = graph.edges.map(edge => {
      const from = nodeById.get(edge.from);
      const to = nodeById.get(edge.to);
      if (!from || !to) return "";
      let path;
      let labelX;
      let labelY;
      if (edge.kind === "back") {
        const sideX = Math.min(from.x - from.width / 2, to.x - to.width / 2) - 95;
        const startX = from.x - from.width / 2;
        const startY = from.y;
        const endX = to.x - to.width / 2;
        const endY = to.y;
        path = `M ${x(startX)} ${y(startY)} L ${x(sideX)} ${y(startY)} L ${x(sideX)} ${y(endY)} L ${x(endX)} ${y(endY)}`;
        labelX = x(sideX) - 6;
        labelY = y((startY + endY) / 2);
      } else if (from.id === to.id) {
        const right = from.x + from.width / 2;
        path = `M ${x(right)} ${y(from.y)} C ${x(right + 110)} ${y(from.y - 80)}, ${x(right + 110)} ${y(from.y + 80)}, ${x(right)} ${y(from.y + 10)}`;
        labelX = x(right + 80);
        labelY = y(from.y);
      } else {
        const startX = from.x;
        const startY = from.y + from.height / 2;
        const endX = to.x;
        const endY = to.y - to.height / 2;
        const midY = (startY + endY) / 2;
        path = `M ${x(startX)} ${y(startY)} L ${x(startX)} ${y(midY)} L ${x(endX)} ${y(midY)} L ${x(endX)} ${y(endY)}`;
        labelX = x((startX + endX) / 2) + 7;
        labelY = y(midY) - 6;
      }
      const label = edge.label ? `<text class="edge-label" x="${labelX}" y="${labelY}">${escapeXml(edge.label)}</text>` : "";
      return `<path class="flow-edge ${edge.kind}" d="${path}" marker-end="url(#arrow)"/>${label}`;
    }).join("");

    const nodeMarkup = graph.nodes.map(node => {
      const cx = x(node.x);
      const cy = y(node.y);
      const left = cx - node.width / 2;
      const top = cy - node.height / 2;
      let shape = "";
      if (node.shape === "terminator") shape = `<rect class="flow-shape terminator" x="${left}" y="${top}" width="${node.width}" height="${node.height}" rx="31"/>`;
      else if (node.shape === "process") shape = `<rect class="flow-shape process" x="${left}" y="${top}" width="${node.width}" height="${node.height}" rx="7"/>`;
      else if (node.shape === "io") shape = `<path class="flow-shape io" d="M ${left + 18} ${top} L ${left + node.width} ${top} L ${left + node.width - 18} ${top + node.height} L ${left} ${top + node.height} Z"/>`;
      else if (node.shape === "decision") shape = `<path class="flow-shape decision" d="M ${cx} ${top} L ${left + node.width} ${cy} L ${cx} ${top + node.height} L ${left} ${cy} Z"/>`;
      else if (node.shape === "subprocess") shape = `<rect class="flow-shape subprocess" x="${left}" y="${top}" width="${node.width}" height="${node.height}" rx="5"/><line class="sub-line" x1="${left + 14}" y1="${top}" x2="${left + 14}" y2="${top + node.height}"/><line class="sub-line" x1="${left + node.width - 14}" y1="${top}" x2="${left + node.width - 14}" y2="${top + node.height}"/>`;
      else shape = `<circle class="flow-join" cx="${cx}" cy="${cy}" r="9"/>`;
      if (node.shape === "join") return `<g data-node="${node.id}">${shape}</g>`;
      const labelLines = wrapLabel(node.label, node.shape === "decision" ? 34 : 32);
      const totalLines = labelLines.length + (node.line ? 1 : 0);
      const startY = cy - ((totalLines - 1) * 15) / 2;
      const text = labelLines.map((line, index) => `<text class="node-label" x="${cx}" y="${startY + index * 16}">${escapeXml(line)}</text>`).join("");
      const lineLabel = node.line ? `<text class="line-label" x="${cx}" y="${startY + labelLines.length * 16}">Line ${node.line}</text>` : "";
      return `<g data-node="${node.id}">${shape}${text}${lineLabel}</g>`;
    }).join("");

    const sectionMarkup = graph.sections.map(section => `<g class="section-title"><line x1="${x(-350)}" y1="${y(section.y)}" x2="${x(350)}" y2="${y(section.y)}"/><rect x="${x(-135)}" y="${y(section.y - 18)}" width="270" height="34" rx="17"/><text x="${x(0)}" y="${y(section.y + 5)}">${escapeXml(section.label)}</text></g>`).join("");

    return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Flowchart generated from the current pseudocode" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#294d68"/></marker></defs>
      <style>
        .flow-edge{fill:none;stroke:#294d68;stroke-width:2}.flow-edge.back{stroke:#9b4d78;stroke-dasharray:6 4}.edge-label{font:700 12px system-ui,sans-serif;fill:#294d68;text-anchor:middle;paint-order:stroke;stroke:#fff;stroke-width:5px}.flow-shape{stroke:#17324d;stroke-width:2.5}.terminator{fill:#dff4eb}.process{fill:#e9f3fb}.io{fill:#fff3cc}.decision{fill:#fde7db}.subprocess{fill:#eee6f5}.sub-line{stroke:#17324d;stroke-width:2}.flow-join{fill:#17324d}.node-label{font:700 13px ui-monospace,SFMono-Regular,Menlo,monospace;fill:#17324d;text-anchor:middle;dominant-baseline:middle}.line-label{font:600 10px system-ui,sans-serif;fill:#64798b;text-anchor:middle}.section-title line{stroke:#abc0cf;stroke-width:1}.section-title rect{fill:#17324d}.section-title text{font:800 12px system-ui,sans-serif;fill:#fff;text-anchor:middle;letter-spacing:1px}
      </style>
      <rect width="100%" height="100%" fill="#ffffff"/>
      ${sectionMarkup}${edgeMarkup}${nodeMarkup}
    </svg>`;
  }

  const publicApi = {
    version: APP_VERSION,
    missions: MISSIONS,
    parseProgram,
    executeProgram,
    validateMission,
    createFlowchart,
    createRuntime,
    readSensor
  };
  window.GLMRobotLab = publicApi;

  const elements = {};
  const ui = {
    state: null,
    mission: MISSIONS[0],
    runtime: null,
    stopRequested: false,
    running: false,
    saveTimer: null,
    currentFlowSvg: "",
    lastModalFocus: null,
    mediaReduced: window.matchMedia("(prefers-reduced-motion: reduce)")
  };

  function defaultState() {
    return {
      version: 1,
      selectedMission: 1,
      highestUnlocked: 1,
      completed: [],
      code: {},
      speed: 3,
      reduceMotion: false
    };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      const base = defaultState();
      if (!saved || typeof saved !== "object") return base;
      const merged = { ...base, ...saved };
      merged.completed = Array.isArray(saved.completed) ? saved.completed.filter(id => Number.isInteger(id) && id >= 1 && id <= MISSIONS.length) : [];
      merged.code = saved.code && typeof saved.code === "object" ? saved.code : {};
      merged.highestUnlocked = Math.max(1, Math.min(MISSIONS.length, Number(saved.highestUnlocked) || 1));
      merged.selectedMission = Math.max(1, Math.min(merged.highestUnlocked, Number(saved.selectedMission) || 1));
      merged.speed = Math.max(1, Math.min(5, Number(saved.speed) || 3));
      merged.reduceMotion = Boolean(saved.reduceMotion);
      return merged;
    } catch (error) {
      return defaultState();
    }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ui.state)); }
    catch (error) { setFeedback("Progress could not be saved in this browser. Your current work will still run.", "error"); }
  }

  function cacheElements() {
    const ids = [
      "missionSelect", "missionConcept", "missionHeading", "missionObjective", "conceptBadge", "progressText",
      "missionInstructions", "missionHint", "missionRequirements", "actionLegend", "actionLegendWrap", "previousMission",
      "nextMission", "downloadCode", "showFlowchart", "lineNumbers", "codeEditor", "starterCode", "resetCode",
      "runProgram", "stopProgram", "resetRobot", "speedControl", "speedLabel", "reducedMotion", "clearTrace",
      "executionTrace", "runState", "mazeStage", "mazeGrid", "robot", "speechBubble", "sensorValues", "clearOutput",
      "outputPanel", "missionFeedback", "resetProgress", "flowchartModal", "flowchartError", "flowchartViewport",
      "downloadFlowchart", "closeFlowchart"
    ];
    ids.forEach(id => { elements[id] = document.getElementById(id); });
  }

  function currentCode() { return elements.codeEditor.value; }

  function missionById(id) { return MISSIONS.find(mission => mission.id === Number(id)) || MISSIONS[0]; }

  function renderMissionSelector() {
    elements.missionSelect.innerHTML = "";
    MISSIONS.forEach(mission => {
      const option = document.createElement("option");
      const locked = mission.id > ui.state.highestUnlocked;
      const done = ui.state.completed.includes(mission.id);
      option.value = mission.id;
      option.disabled = locked;
      option.textContent = `${done ? "✓ " : locked ? "🔒 " : ""}${mission.id}. ${mission.title}`;
      elements.missionSelect.append(option);
    });
    elements.missionSelect.value = String(ui.mission.id);
  }

  function renderMission() {
    ui.mission = missionById(ui.state.selectedMission);
    renderMissionSelector();
    elements.missionConcept.textContent = `Mission ${ui.mission.id} · ${ui.mission.concept}`;
    elements.missionHeading.textContent = ui.mission.title;
    elements.missionObjective.textContent = ui.mission.objective;
    elements.conceptBadge.textContent = ui.state.completed.includes(ui.mission.id) ? "Completed" : ui.mission.concept;
    elements.progressText.textContent = `${ui.state.completed.length} of ${MISSIONS.length} missions complete`;
    elements.missionInstructions.textContent = ui.mission.instructions;
    elements.missionHint.textContent = ui.mission.hint;
    elements.missionRequirements.innerHTML = ui.mission.concepts.map(concept => `<li>${escapeHtml(concept)}</li>`).join("");
    const taskKinds = new Set([...analyzeMaze(ui.mission).tasks.values()]);
    elements.actionLegend.innerHTML = [...taskKinds].map(kind => {
      const info = ACTION_LABELS[kind];
      return `<span class="legend-item"><span class="spot-key ${info.colorClass}">${kind}</span>${escapeHtml(info.name)} with <code>${escapeHtml(info.command)}</code></span>`;
    }).join("");
    elements.actionLegendWrap.hidden = taskKinds.size === 0;
    elements.previousMission.disabled = ui.mission.id === 1 || ui.running;
    elements.nextMission.disabled = ui.mission.id >= ui.state.highestUnlocked || ui.mission.id === MISSIONS.length || ui.running;
    const savedCode = ui.state.code[ui.mission.id];
    elements.codeEditor.value = typeof savedCode === "string" ? savedCode : ui.mission.starter;
    updateLineNumbers();
    clearOutput();
    clearTrace();
    setFeedback("Write an algorithm, then run it to test your plan.", "");
    renderMaze();
    ui.state.selectedMission = ui.mission.id;
    saveState();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  }

  function updateLineNumbers(activeLine = null) {
    const count = Math.max(1, elements.codeEditor.value.split("\n").length);
    elements.lineNumbers.innerHTML = Array.from({ length: count }, (_, index) => {
      const number = index + 1;
      return `<span class="line-number${number === activeLine ? " active" : ""}">${number}</span>`;
    }).join("");
    elements.lineNumbers.scrollTop = elements.codeEditor.scrollTop;
  }

  function highlightLine(line) { updateLineNumbers(line || null); }

  function setRunState(text, type = "") {
    elements.runState.textContent = text;
    elements.runState.className = `run-state${type ? ` ${type}` : ""}`;
  }

  function setFeedback(message, type = "") {
    elements.missionFeedback.className = `feedback-message${type ? ` ${type}` : ""}`;
    elements.missionFeedback.innerHTML = message;
  }

  function addTrace(message, type = "info", line = null, current = false) {
    if (current) elements.executionTrace.querySelectorAll(".current").forEach(item => item.classList.remove("current"));
    const entry = document.createElement("div");
    entry.className = `trace-entry ${type}${current ? " current" : ""}`;
    entry.textContent = `${line ? `Line ${line}: ` : ""}${message}`;
    elements.executionTrace.append(entry);
    elements.executionTrace.scrollTop = elements.executionTrace.scrollHeight;
  }

  function clearTrace() {
    elements.executionTrace.innerHTML = '<div class="trace-entry">Trace messages will appear here without moving the page.</div>';
    highlightLine(null);
  }

  function addOutput(message) {
    elements.outputPanel.querySelector(".output-empty")?.remove();
    const entry = document.createElement("div");
    entry.className = "output-entry";
    entry.textContent = message;
    elements.outputPanel.append(entry);
    elements.outputPanel.scrollTop = elements.outputPanel.scrollHeight;
  }

  function clearOutput() {
    elements.outputPanel.innerHTML = '<div class="output-empty">No output yet.</div>';
  }

  function renderMaze() {
    ui.runtime = createRuntime(ui.mission);
    const { rows, cols } = ui.runtime.maze;
    elements.mazeStage.style.setProperty("--cols", cols);
    elements.mazeStage.style.setProperty("--rows", rows);
    elements.mazeGrid.innerHTML = "";
    ui.mission.grid.forEach((row, r) => {
      [...row].forEach((cell, c) => {
        const square = document.createElement("div");
        square.className = `maze-cell ${cell === "#" ? "wall" : "floor"}`;
        square.dataset.row = r;
        square.dataset.col = c;
        if (cell === "G") square.classList.add("goal");
        if (ACTION_LABELS[cell]) {
          square.classList.add("task");
          square.dataset.task = cell;
          square.style.setProperty("--task-color", ACTION_LABELS[cell].color);
          square.setAttribute("aria-label", `${ACTION_LABELS[cell].name} action spot`);
        }
        elements.mazeGrid.append(square);
      });
    });
    elements.robot.className = "robot";
    elements.speechBubble.textContent = "";
    updateRobot(ui.runtime, true);
    updateSensors(ui.runtime);
  }

  function updateRobot(runtime, immediate = false) {
    if (immediate) elements.robot.style.transition = "none";
    elements.robot.style.setProperty("--robot-row", runtime.row);
    elements.robot.style.setProperty("--robot-col", runtime.col);
    elements.robot.style.setProperty("--robot-angle", `${DIRECTIONS[runtime.direction].angle}deg`);
    elements.robot.style.setProperty("--bubble-angle", `${-DIRECTIONS[runtime.direction].angle}deg`);
    elements.robot.setAttribute("aria-label", `Robot at row ${runtime.row + 1}, column ${runtime.col + 1}, facing ${DIRECTIONS[runtime.direction].name.toLowerCase()}`);
    if (immediate) requestAnimationFrame(() => { elements.robot.style.transition = ""; });
    for (const key of runtime.completedTasks) {
      const [row, col] = key.split(",");
      const square = elements.mazeGrid.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      if (square) square.classList.add("task-complete");
    }
  }

  function updateSensors(runtime) {
    const sensorOrder = [
      "FRONT_IS_CLEAR", "LEFT_IS_CLEAR", "RIGHT_IS_CLEAR", "FRONT_IS_BLOCKED", "ON_GOAL", "ON_TASK_SPOT",
      "CURRENT_TASK", "ON_CLEAN_SPOT", "ON_DANCE_SPOT", "ON_SPEAK_SPOT", "ON_HAND_SPOT"
    ];
    elements.sensorValues.innerHTML = sensorOrder.map(sensor => {
      const value = readSensor(runtime, sensor);
      const booleanClass = typeof value === "boolean" ? ` sensor-${value}` : "";
      return `<div class="sensor-value${booleanClass}"><dt title="${sensor}">${sensor}</dt><dd>${escapeHtml(formatValue(value))}</dd></div>`;
    }).join("");
  }

  function executionDuration(multiplier = 1) {
    if (ui.state.reduceMotion || ui.mediaReduced.matches) return 25;
    const values = { 1: 1250, 2: 900, 3: 620, 4: 400, 5: 230 };
    return Math.round(values[ui.state.speed] * multiplier);
  }

  async function sleep(milliseconds) {
    const end = performance.now() + milliseconds;
    while (performance.now() < end) {
      if (ui.stopRequested) throw new ExecutionStopped();
      await new Promise(resolve => setTimeout(resolve, Math.min(60, Math.max(1, end - performance.now()))));
    }
  }

  function clearRobotAnimation() {
    elements.robot.classList.remove("cleaning", "dancing", "speaking", "raising", "collision");
    elements.robot.querySelector(".robot-effects").innerHTML = "";
  }

  function createEffects(kind, count = 14) {
    const effectWrap = elements.robot.querySelector(".robot-effects");
    effectWrap.innerHTML = "";
    const colors = kind === "dust" ? ["#b69868", "#d8c69e", "#92764b"] : ["#f1bd43", "#2aa7b8", "#d85d66", "#9453b3", "#1f8a63"];
    for (let i = 0; i < count; i += 1) {
      const particle = document.createElement("i");
      particle.className = "effect-dot";
      particle.style.left = `${35 + (i % 5) * 7}%`;
      particle.style.top = `${40 + (i % 3) * 8}%`;
      particle.style.setProperty("--effect-color", colors[i % colors.length]);
      particle.style.setProperty("--dx", `${(i % 2 ? 1 : -1) * (20 + (i * 13) % 42)}px`);
      particle.style.setProperty("--dy", `${kind === "dust" ? 12 + (i * 7) % 24 : -25 - (i * 11) % 48}px`);
      particle.style.animationDelay = `${(i % 5) * 50}ms`;
      effectWrap.append(particle);
    }
  }

  async function animateAction(action, runtime, details) {
    clearRobotAnimation();
    if (details.collision) {
      elements.robot.classList.add("collision");
      await sleep(executionDuration(0.45));
      return;
    }
    if (action === "MOVE_FORWARD") {
      updateRobot(runtime);
      await sleep(executionDuration(0.75));
    } else if (action === "TURN_LEFT" || action === "TURN_RIGHT") {
      updateRobot(runtime);
      await sleep(executionDuration(0.65));
    } else if (action === "CLEAN") {
      elements.robot.classList.add("cleaning");
      createEffects("dust", 12);
      await sleep(executionDuration(1.55));
      clearRobotAnimation();
    } else if (action === "DANCE") {
      elements.robot.classList.add("dancing");
      createEffects("confetti", 20);
      await sleep(executionDuration(2.05));
      clearRobotAnimation();
    } else if (action === "RAISE_HAND") {
      elements.robot.classList.add("raising");
      await sleep(executionDuration(1.25));
      clearRobotAnimation();
    }
    updateRobot(runtime);
    updateSensors(runtime);
  }

  async function animateOutput(message, runtime) {
    clearRobotAnimation();
    elements.speechBubble.textContent = message;
    elements.robot.classList.add("speaking");
    addOutput(message);
    await sleep(executionDuration(1.55));
    elements.robot.classList.remove("speaking");
    updateRobot(runtime);
    updateSensors(runtime);
  }

  function setControlsRunning(running) {
    ui.running = running;
    elements.runProgram.disabled = running;
    elements.stopProgram.disabled = !running;
    elements.resetRobot.disabled = running;
    elements.starterCode.disabled = running;
    elements.resetCode.disabled = running;
    elements.codeEditor.readOnly = running;
    elements.missionSelect.disabled = running;
    elements.previousMission.disabled = running || ui.mission.id === 1;
    elements.nextMission.disabled = running || ui.mission.id >= ui.state.highestUnlocked || ui.mission.id === MISSIONS.length;
  }

  async function runCurrentProgram() {
    if (ui.running) return;
    ui.state.code[ui.mission.id] = currentCode();
    saveState();
    ui.stopRequested = false;
    clearOutput();
    clearTrace();
    renderMaze();
    setControlsRunning(true);
    setRunState("Running", "running");
    setFeedback("The robot is tracing your algorithm now.", "");
    const initialPagePosition = { x: window.scrollX, y: window.scrollY };
    let ast;
    try {
      ast = parseProgram(currentCode());
      const runtime = await executeProgram(ast, ui.mission, {
        shouldStop: () => ui.stopRequested,
        beforeNode: async (node, currentRuntime, detail) => {
          highlightLine(node.line);
          addTrace(`${node.text}${detail ? ` — ${detail}` : ""}`, "current", node.line, true);
          updateSensors(currentRuntime);
        },
        onAction: async (action, currentRuntime, details) => animateAction(action, currentRuntime, details),
        onOutput: async (message, currentRuntime) => animateOutput(message, currentRuntime),
        onStateChange: async currentRuntime => { updateRobot(currentRuntime); updateSensors(currentRuntime); },
        onTrace: async (message, type, line) => addTrace(message, type, line),
        onPause: async () => sleep(executionDuration(0.42))
      });
      ui.runtime = runtime;
      const result = validateMission(runtime, ui.mission);
      if (result.success) {
        completeMission(ui.mission.id);
        setRunState("Mission complete", "success");
        addTrace("Program completed successfully.", "success");
        setFeedback("<strong>Program completed successfully.</strong> The robot reached the goal, completed every required task, and genuinely executed the required programming concepts.", "success");
      } else {
        setRunState("Try again", "error");
        setFeedback(`<strong>The program ran, but the mission is not complete yet.</strong><ul class="feedback-list">${result.reasons.map(reason => `<li>${escapeHtml(reason)}</li>`).join("")}</ul>`, "error");
      }
    } catch (error) {
      const runtime = error.runtime || ui.runtime;
      if (error instanceof ExecutionStopped) {
        setRunState("Stopped", "error");
        addTrace("Program stopped by the student.", "error");
        setFeedback("The program was stopped. Reset the robot or edit the code before running again.", "error");
      } else {
        const lineMessage = error.line ? `Line ${error.line}: ` : "";
        setRunState("Check the code", "error");
        addTrace(`${lineMessage}${error.message}`, "error", error.line);
        highlightLine(error.line);
        setFeedback(`<strong>${escapeHtml(lineMessage)}${escapeHtml(error.message)}</strong>`, "error");
      }
      if (runtime) { ui.runtime = runtime; updateRobot(runtime); updateSensors(runtime); }
    } finally {
      clearRobotAnimation();
      setControlsRunning(false);
      if (Math.abs(window.scrollX - initialPagePosition.x) > 2 || Math.abs(window.scrollY - initialPagePosition.y) > 2) {
        window.scrollTo({ left: initialPagePosition.x, top: initialPagePosition.y, behavior: "auto" });
      }
    }
  }

  function completeMission(id) {
    if (!ui.state.completed.includes(id)) ui.state.completed.push(id);
    ui.state.completed.sort((a, b) => a - b);
    if (id < MISSIONS.length) ui.state.highestUnlocked = Math.max(ui.state.highestUnlocked, id + 1);
    saveState();
    renderMissionSelector();
    elements.conceptBadge.textContent = "Completed";
    elements.progressText.textContent = `${ui.state.completed.length} of ${MISSIONS.length} missions complete`;
    elements.nextMission.disabled = id === MISSIONS.length;
  }

  function changeMission(id) {
    if (ui.running) return;
    const nextId = Math.max(1, Math.min(ui.state.highestUnlocked, Number(id)));
    ui.state.code[ui.mission.id] = currentCode();
    ui.state.selectedMission = nextId;
    saveState();
    renderMission();
  }

  function insertSnippet(snippet) {
    const editor = elements.codeEditor;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const before = editor.value.slice(0, start);
    const after = editor.value.slice(end);
    const lineStart = before.lastIndexOf("\n") + 1;
    const baseIndent = (before.slice(lineStart).match(/^\s*/) || [""])[0];
    const indented = snippet.split("\n").map((line, index) => index === 0 ? line : baseIndent + line).join("\n");
    const prefix = before && !before.endsWith("\n") ? "\n" + baseIndent : "";
    const suffix = after && !after.startsWith("\n") ? "\n" + baseIndent : "";
    const inserted = prefix + indented + suffix;
    editor.setRangeText(inserted, start, end, "end");
    editor.focus({ preventScroll: true });
    updateLineNumbers();
    scheduleCodeSave();
  }

  function scheduleCodeSave() {
    clearTimeout(ui.saveTimer);
    ui.saveTimer = setTimeout(() => {
      ui.state.code[ui.mission.id] = currentCode();
      saveState();
    }, 260);
  }

  function downloadBlob(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 800);
  }

  function openFlowchart() {
    ui.lastModalFocus = document.activeElement;
    elements.flowchartModal.hidden = false;
    document.body.classList.add("modal-open");
    elements.flowchartError.hidden = true;
    elements.flowchartViewport.innerHTML = "";
    ui.currentFlowSvg = "";
    elements.downloadFlowchart.disabled = true;
    try {
      const ast = parseProgram(currentCode());
      ui.currentFlowSvg = createFlowchart(ast);
      elements.flowchartViewport.innerHTML = ui.currentFlowSvg;
      elements.downloadFlowchart.disabled = false;
    } catch (error) {
      elements.flowchartError.hidden = false;
      elements.flowchartError.textContent = `${error.line ? `Line ${error.line}: ` : ""}${error.message}`;
    }
    elements.closeFlowchart.focus({ preventScroll: true });
  }

  function closeFlowchart() {
    if (elements.flowchartModal.hidden) return;
    elements.flowchartModal.hidden = true;
    document.body.classList.remove("modal-open");
    ui.lastModalFocus?.focus?.({ preventScroll: true });
  }

  function handleModalKeydown(event) {
    if (elements.flowchartModal.hidden) return;
    if (event.key === "Escape") { event.preventDefault(); closeFlowchart(); return; }
    if (event.key !== "Tab") return;
    const focusable = [...elements.flowchartModal.querySelectorAll('button:not(:disabled), [tabindex="0"]')];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  function updateSpeedLabel() {
    const labels = { 1: "Very slow", 2: "Slow", 3: "Normal", 4: "Fast", 5: "Very fast" };
    elements.speedLabel.textContent = labels[ui.state.speed];
  }

  function bindEvents() {
    elements.missionSelect.addEventListener("change", event => changeMission(event.target.value));
    elements.previousMission.addEventListener("click", () => changeMission(ui.mission.id - 1));
    elements.nextMission.addEventListener("click", () => changeMission(ui.mission.id + 1));
    elements.codeEditor.addEventListener("input", () => { updateLineNumbers(); scheduleCodeSave(); });
    elements.codeEditor.addEventListener("scroll", () => { elements.lineNumbers.scrollTop = elements.codeEditor.scrollTop; });
    elements.codeEditor.addEventListener("keydown", event => {
      if (event.key === "Tab") {
        event.preventDefault();
        elements.codeEditor.setRangeText("  ", elements.codeEditor.selectionStart, elements.codeEditor.selectionEnd, "end");
        updateLineNumbers();
        scheduleCodeSave();
      }
    });
    document.querySelectorAll(".snippet").forEach(button => button.addEventListener("click", () => insertSnippet(button.dataset.snippet)));
    elements.starterCode.addEventListener("click", () => {
      if (currentCode().trim() && currentCode() !== ui.mission.starter && !window.confirm("Replace the current code with this mission’s starter code?")) return;
      elements.codeEditor.value = ui.mission.starter;
      updateLineNumbers();
      scheduleCodeSave();
    });
    elements.resetCode.addEventListener("click", () => {
      if (!window.confirm("Clear all code for this mission?")) return;
      elements.codeEditor.value = "";
      updateLineNumbers();
      scheduleCodeSave();
    });
    elements.runProgram.addEventListener("click", runCurrentProgram);
    elements.stopProgram.addEventListener("click", () => { ui.stopRequested = true; elements.stopProgram.disabled = true; setRunState("Stopping…", "running"); });
    elements.resetRobot.addEventListener("click", () => { renderMaze(); clearTrace(); clearOutput(); setRunState("Ready"); setFeedback("Robot reset to the starting square.", ""); });
    elements.clearTrace.addEventListener("click", clearTrace);
    elements.clearOutput.addEventListener("click", clearOutput);
    elements.speedControl.addEventListener("input", event => { ui.state.speed = Number(event.target.value); updateSpeedLabel(); saveState(); });
    elements.reducedMotion.addEventListener("change", event => { ui.state.reduceMotion = event.target.checked; document.body.classList.toggle("reduce-motion", ui.state.reduceMotion); saveState(); });
    elements.downloadCode.addEventListener("click", () => downloadBlob(currentCode(), `mission-${ui.mission.id}-pseudocode.txt`, "text/plain;charset=utf-8"));
    elements.showFlowchart.addEventListener("click", openFlowchart);
    elements.closeFlowchart.addEventListener("click", closeFlowchart);
    document.querySelector("[data-close-modal]").addEventListener("click", closeFlowchart);
    document.addEventListener("keydown", handleModalKeydown);
    elements.downloadFlowchart.addEventListener("click", () => {
      if (ui.currentFlowSvg) downloadBlob(ui.currentFlowSvg, `mission-${ui.mission.id}-flowchart.svg`, "image/svg+xml;charset=utf-8");
    });
    elements.resetProgress.addEventListener("click", () => {
      if (!window.confirm("Delete all saved code, mission completions, and settings for this lab? This cannot be undone.")) return;
      localStorage.removeItem(STORAGE_KEY);
      ui.state = defaultState();
      ui.mission = MISSIONS[0];
      elements.speedControl.value = ui.state.speed;
      elements.reducedMotion.checked = false;
      document.body.classList.remove("reduce-motion");
      updateSpeedLabel();
      renderMission();
    });
  }

  function initialize() {
    cacheElements();
    ui.state = loadState();
    ui.mission = missionById(ui.state.selectedMission);
    elements.speedControl.value = ui.state.speed;
    elements.reducedMotion.checked = ui.state.reduceMotion;
    document.body.classList.toggle("reduce-motion", ui.state.reduceMotion);
    updateSpeedLabel();
    bindEvents();
    renderMission();
    setRunState("Ready");
    document.documentElement.dataset.appReady = "true";
    window.dispatchEvent(new CustomEvent("glm-lab-ready"));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
