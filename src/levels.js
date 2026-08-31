window.ROBOT_LEVELS = [
  {
    id:1,title:"Wake-up Route",concept:"Sequence and output",difficulty:"Starter",
    brief:"Follow the corridor. Stop on D, make the robot dance, then reach G.",
    success:"Perform DANCE on D and reach the goal.",
    focus:"Sequence means instructions run in order. No decision is needed here.",
    hint:"The robot starts facing east. MOVE until the robot is on D, use DANCE, then continue to G.",
    map:["#######","#S.D.G#","#######"],direction:"E",maxActions:12,
    requiredSyntax:["DANCE"],
    starterLines:["START","OUTPUT \"Robot online\"","","// Write the route here","","END"]
  },
  {
    id:2,title:"Read, Store, Use",concept:"INPUT and variables",difficulty:"Starter",
    brief:"Use INPUT to read a sensor into a variable. Re-read after the robot changes direction, then complete C and T before G.",
    success:"Use INPUT at least twice, complete CLEAN on C and OUTPUT on T, and reach G.",
    focus:"INPUT reads a value now and stores it in a variable. The variable does not magically update after the robot moves or turns.",
    hint:"Try INPUT FRONT_IS_CLEAR INTO pathOpen, OUTPUT pathOpen, move or turn, then INPUT FRONT_IS_CLEAR INTO pathOpen again.",
    map:["########","#S.C...#","######T#","#....G.#","########"],direction:"E",maxActions:24,
    requiredSyntax:["INPUT"],minimumCounts:{INPUT:2},
    starterLines:["START","INPUT FRONT_IS_CLEAR INTO pathOpen","OUTPUT pathOpen","","// Move, turn, then READ the sensor again","INPUT FRONT_IS_CLEAR INTO pathOpen","OUTPUT pathOpen","","// Complete C and T before G","","END"]
  },
  {
    id:3,title:"Blocked Ahead",concept:"INPUT + IF / ELSE",difficulty:"Developing",
    brief:"The robot begins facing a wall. Read the front sensor into a variable and use IF / ELSE to choose the safe first action.",
    success:"Use INPUT and IF / ELSE; complete H and C; reach G.",
    focus:"A conditional chooses between alternatives. Here the first sensor value must determine whether MOVE or TURN is safe.",
    hint:"Read FRONT_IS_CLEAR INTO pathOpen first. Because a wall is ahead, pathOpen is FALSE, so the ELSE branch should execute.",
    map:["#######","#S#C.G#","#H#.#.#","#...#.#","#######"],direction:"E",maxActions:30,
    requiredSyntax:["INPUT","IF","ELSE"],
    starterLines:["START","INPUT FRONT_IS_CLEAR INTO pathOpen","","IF pathOpen THEN","  MOVE","ELSE","  // What safe action should happen when pathOpen is FALSE?","END IF","","// Finish H, C and G","","END"]
  },
  {
    id:4,title:"Long Hall",concept:"Counted loops",difficulty:"Developing",
    brief:"Replace repeated MOVE lines with one counted REPEAT block.",
    success:"Reach G using REPEAT ... TIMES.",
    focus:"A counted loop is useful when you know exactly how many repetitions are needed.",
    hint:"Count moves from S to G. Do not count the starting square as a move.",
    map:["##########","#S......G#","##########"],direction:"E",maxActions:18,
    requiredSyntax:["REPEAT"],
    starterLines:["START","OUTPUT \"Crossing the hall\"","REPEAT 1 TIMES","  MOVE","END REPEAT","END"]
  },
  {
    id:5,title:"Count the Work",concept:"Variables + loops",difficulty:"Developing",
    brief:"Travel the staircase route and keep a variable counting completed movement sections. Complete H, C and T.",
    success:"Use SET, INCREASE and REPEAT; complete all task spots and reach G.",
    focus:"A variable can store information that changes while the program runs.",
    hint:"SET sections TO 0. After completing a section, INCREASE sections BY 1 and OUTPUT sections.",
    map:["#########","#S.H#####","###.#####","###..C###","#####.###","#####.TG#","#########"],direction:"E",maxActions:40,
    requiredSyntax:["SET","INCREASE","REPEAT"],
    starterLines:["START","SET sections TO 0","","// Use repeated movement where it fits","","INCREASE sections BY 1","OUTPUT sections","END"]
  },
  {
    id:6,title:"Unknown Corridor",concept:"WHILE + sensor conditions",difficulty:"Proficient",
    brief:"Move while the path ahead is clear. Stop safely when the corridor ends.",
    success:"Use WHILE with FRONT_IS_CLEAR and reach G.",
    focus:"A condition-controlled loop repeats only while its condition remains TRUE.",
    hint:"WHILE FRONT_IS_CLEAR DO can test the live sensor every iteration.",
    map:["#########","#S.....G#","#########"],direction:"E",maxActions:24,
    requiredSyntax:["WHILE"],
    starterLines:["START","WHILE FRONT_IS_CLEAR DO","  MOVE","END WHILE","END"]
  },
  {
    id:7,title:"React to Tasks",concept:"INPUT + IF inside a loop",difficulty:"Proficient",
    brief:"Travel the corridor and react only when CURRENT_TASK reports a task.",
    success:"Use INPUT CURRENT_TASK and IF inside a loop; complete D and C; reach G.",
    focus:"Read CURRENT_TASK after moving. The IF should test the stored task value before choosing an action.",
    hint:"INPUT CURRENT_TASK INTO task, then IF task = \"DANCE\" THEN ... A second IF can check for CLEAN.",
    map:["###########","#S..D..C.G#","###########"],direction:"E",maxActions:50,
    requiredSyntax:["INPUT","IF","WHILE"],
    starterLines:["START","WHILE NOT ON_GOAL DO","  MOVE","  INPUT CURRENT_TASK INTO task","  IF task = \"DANCE\" THEN","    DANCE","  END IF","  // Add a CLEAN condition","END WHILE","END"]
  },
  {
    id:8,title:"Choose the Turn",concept:"Nested sensor logic",difficulty:"Advanced",
    brief:"At each obstacle, read the right and left sensors and choose a safe turn. Complete T before G.",
    success:"Use INPUT with at least two sensors and nested/combined IF logic; complete T and reach G.",
    focus:"Multiple INPUT values let a conditional compare alternatives instead of blindly turning the same way.",
    hint:"Read RIGHT_IS_CLEAR and LEFT_IS_CLEAR into variables. Prefer a clear path; only MOVE when the front is clear.",
    map:["#########","#S..#####","###.#####","###...T##","#####..G#","#########"],direction:"E",maxActions:60,
    requiredSyntax:["INPUT","IF"],minimumCounts:{INPUT:2},
    starterLines:["START","INPUT FRONT_IS_CLEAR INTO frontOpen","INPUT RIGHT_IS_CLEAR INTO rightOpen","","IF frontOpen THEN","  MOVE","ELSE","  IF rightOpen THEN","    TURN RIGHT","  ELSE","    TURN LEFT","  END IF","END IF","","// Continue by re-reading sensors as the robot changes position","","END"]
  },
  {
    id:9,title:"Reusable Helper",concept:"Functions",difficulty:"Advanced",
    brief:"Create and call a function that performs a repeated celebration/checkpoint action.",
    success:"Define a FUNCTION, CALL it, complete D and T, and reach G.",
    focus:"A function gives a meaningful name to reusable instructions.",
    hint:"Define FUNCTION celebrate() before END, then CALL celebrate() when the robot reaches a matching checkpoint.",
    map:["##########","#S..D..TG#","##########"],direction:"E",maxActions:45,
    requiredSyntax:["FUNCTION","CALL"],
    starterLines:["START","","// Move to the checkpoints and CALL your helper","","CALL celebrate()","END","","FUNCTION celebrate()","  OUTPUT \"Checkpoint reached\"","  DANCE","END FUNCTION"]
  },
  {
    id:10,title:"Service Robot Challenge",concept:"Integrated algorithm",difficulty:"Capstone",
    brief:"Build one complete algorithm that uses sensors, stored values, decisions, repetition and a helper function to complete every task.",
    success:"Complete C, D, T and H, reach G, and use INPUT, IF, a loop, a variable and a function.",
    focus:"The best algorithm does not just reach the goal: it reads the environment, stores information, makes decisions and performs required work at the correct place.",
    hint:"Use a navigation loop. Inside it, read CURRENT_TASK and call a helper or choose the matching action. Re-read navigation sensors before deciding how to move.",
    map:["############","#S..C......#","#####.####.#","#D....#..H.#","#.#####.##.#","#......T.G.#","############"],direction:"E",maxActions:120,
    requiredSyntax:["INPUT","IF","FUNCTION","CALL"],oneOf:["WHILE","REPEAT"],
    starterLines:["START","SET completed TO 0","","// Build your navigation loop here","// Read sensors, make decisions, and complete each task","","OUTPUT completed","END","","FUNCTION doTask()","  INPUT CURRENT_TASK INTO task","  // Decide which task action is required","END FUNCTION"]
  }
];
