(() => {
  "use strict";

  const LEVELS = window.ROBOT_LEVELS;
  const TASKS = {
    C:{label:"CLEAN",color:"#2878b5"},
    D:{label:"DANCE",color:"#8e57ad"},
    T:{label:"SPEAK",color:"#d17a1b"},
    H:{label:"RAISE_HAND",color:"#3b8f57"}
  };
  const DIRS = ["N","E","S","W"];
  const DELTAS = {N:[0,-1],E:[1,0],S:[0,1],W:[-1,0]};
  const STORAGE_KEY = "glmRobotPseudocodeGithubV2";

  const $ = id => document.getElementById(id);
  const els = {
    missionStrip:$("missionStrip"), missionNumber:$("missionNumber"), missionTitle:$("missionTitle"),
    missionConcept:$("missionConcept"), missionDifficulty:$("missionDifficulty"), missionBrief:$("missionBrief"),
    learningFocus:$("learningFocus"), hintButton:$("hintButton"), hintBox:$("hintBox"),
    canvas:$("mazeCanvas"), code:$("codeEditor"), run:$("runButton"), step:$("stepButton"),
    reset:$("resetButton"), speed:$("speedRange"), status:$("simulatorStatus"), statusText:$("statusText"),
    traceBody:$("traceBody"), traceWrap:$("traceWrap"), actionCount:$("actionCount"),
    progressText:$("progressText"), progressFill:$("progressFill"), lineIndicator:$("lineIndicator"),
    commandToolbar:$("commandToolbar"), blockToolbar:$("blockToolbar"), toast:$("toast"),
    sensorFront:$("sensorFront"),sensorLeft:$("sensorLeft"),sensorRight:$("sensorRight"),
    sensorGoal:$("sensorGoal"),sensorTask:$("sensorTask"), flowchartOverlay:$("flowchartOverlay"),
    flowchartCanvas:$("flowchartCanvas"),flowchartViewport:$("flowchartViewport")
  };
  const ctx = els.canvas.getContext("2d");

  let current = 0, maze = null, robot = null, runtime = null, running = false, timer = null;
  let progress = loadProgress();

  const commandTemplates = [
    ["MOVE", ["MOVE"]], ["TURN LEFT",["TURN LEFT"]], ["TURN RIGHT",["TURN RIGHT"]],
    ["OUTPUT",['OUTPUT "Hello!"']], ["INPUT",["INPUT FRONT_IS_CLEAR INTO pathOpen"]],
    ["CLEAN",["CLEAN"]], ["DANCE",["DANCE"]], ["RAISE HAND",["RAISE HAND"]],
    ["SET",["SET steps TO 0"]], ["INCREASE",["INCREASE steps BY 1"]], ["CALL",["CALL celebrate()"]]
  ];

  // Multiline blocks are arrays of real lines. Nothing in the editor receives a visible "\n" token.
  const blockTemplates = [
    ["IF / ELSE",["IF condition THEN","  // instructions when TRUE","ELSE","  // instructions when FALSE","END IF"]],
    ["IF",["IF condition THEN","  // instructions","END IF"]],
    ["REPEAT",["REPEAT 3 TIMES","  // repeated instructions","END REPEAT"]],
    ["WHILE",["WHILE condition DO","  // repeated while TRUE","END WHILE"]],
    ["FUNCTION",["FUNCTION helper()","  // reusable instructions","END FUNCTION"]]
  ];

  function loadProgress(){
    try{
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {unlocked:Number.isInteger(saved.unlocked)?saved.unlocked:0,completed:saved.completed||{},code:saved.code||{}};
    }catch{return {unlocked:0,completed:{},code:{}}}
  }
  function saveProgress(){
    progress.code[LEVELS[current].id] = els.code.value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  function makeToolbar(target, templates){
    target.innerHTML="";
    templates.forEach(([label, lines])=>{
      const b=document.createElement("button");
      b.type="button"; b.className="command-chip"; b.textContent=label;
      b.addEventListener("click",()=>insertLines(lines));
      target.appendChild(b);
    });
  }

  function insertLines(lines){
    const area=els.code, start=area.selectionStart, end=area.selectionEnd;
    const before=area.value.slice(0,start), after=area.value.slice(end);
    const text=lines.join("\n");
    const prefix=before && !before.endsWith("\n") ? "\n" : "";
    const suffix=after && !after.startsWith("\n") ? "\n" : "";
    area.value=before+prefix+text+suffix+after;
    const caret=(before+prefix+text).length;
    area.setSelectionRange(caret,caret);
    area.focus();
    updateLineIndicator(); saveProgress();
  }

  function loadLevel(index, userClick=false){
    if(index<0||index>=LEVELS.length||index>progress.unlocked)return;
    stop();
    saveProgress();
    current=index;
    const level=LEVELS[index];
    maze=parseMaze(level.map);
    resetRobotState();
    els.missionNumber.textContent=`Mission ${level.id}`;
    els.missionTitle.textContent=level.title;
    els.missionConcept.textContent=level.concept;
    els.missionDifficulty.textContent=level.difficulty;
    els.missionBrief.textContent=`${level.brief} Success: ${level.success}`;
    els.learningFocus.innerHTML=`<b>Learning focus:</b> ${escapeHtml(level.focus)}`;
    els.hintBox.textContent=level.hint; els.hintBox.hidden=true; els.hintButton.textContent="Show hint";
    els.code.value=progress.code[level.id] || level.starterLines.join("\n");
    clearTrace(); renderMissionStrip(); draw(); updateSensors(); updateProgress();
    setStatus("Predict what will happen, then use Step trace or Run program.","normal");
    updateLineIndicator();
    if(userClick){
      const card=els.missionStrip.children[index];
      if(card) card.scrollIntoView({behavior:"smooth",inline:"center",block:"nearest"});
    }
  }

  function parseMaze(rows){
    let start,goal; const tasks=[];
    rows.forEach((row,y)=>[...row].forEach((v,x)=>{
      if(v==="S")start={x,y};
      if(v==="G")goal={x,y};
      if(TASKS[v])tasks.push({x,y,code:v,...TASKS[v]});
    }));
    return {rows,width:rows[0].length,height:rows.length,start,goal,tasks};
  }

  function resetRobotState(){
    const l=LEVELS[current];
    robot={x:maze.start.x,y:maze.start.y,dir:l.direction,completed:new Set(),action:null,speech:null,anim:0};
    runtime={steps:[],pointer:0,variables:{},functions:{},used:new Map(),raw:""};
    running=false;
  }

  function renderMissionStrip(){
    els.missionStrip.innerHTML="";
    LEVELS.forEach((l,i)=>{
      const b=document.createElement("button"); b.className="mission-card"; b.type="button";
      b.disabled=i>progress.unlocked; b.setAttribute("aria-current",String(i===current));
      const done=progress.completed[l.id]?" ✓":"";
      b.innerHTML=`<strong>Mission ${l.id}${done}</strong><span>${escapeHtml(l.title)}</span>`;
      b.addEventListener("click",()=>loadLevel(i,true)); els.missionStrip.appendChild(b);
    });
  }

  function updateProgress(){
    const done=Object.values(progress.completed).filter(Boolean).length;
    els.progressText.textContent=`${done} of ${LEVELS.length} missions complete`;
    els.progressFill.style.width=`${done/LEVELS.length*100}%`;
  }

  function isWall(x,y){
    return y<0||y>=maze.height||x<0||x>=maze.width||maze.rows[y][x]==="#";
  }
  function sensorValue(name){
    const n=normalize(name);
    const delta=DELTAS[robot.dir], left=DELTAS[DIRS[(DIRS.indexOf(robot.dir)+3)%4]], right=DELTAS[DIRS[(DIRS.indexOf(robot.dir)+1)%4]];
    const task=maze.tasks.find(t=>t.x===robot.x&&t.y===robot.y&&!robot.completed.has(`${t.x},${t.y}`));
    if(n==="FRONT_IS_CLEAR")return !isWall(robot.x+delta[0],robot.y+delta[1]);
    if(n==="LEFT_IS_CLEAR")return !isWall(robot.x+left[0],robot.y+left[1]);
    if(n==="RIGHT_IS_CLEAR")return !isWall(robot.x+right[0],robot.y+right[1]);
    if(n==="FRONT_IS_BLOCKED")return isWall(robot.x+delta[0],robot.y+delta[1]);
    if(n==="ON_GOAL")return robot.x===maze.goal.x&&robot.y===maze.goal.y;
    if(n==="CURRENT_TASK")return task?task.label:"NONE";
    if(n==="ON_TASK_SPOT")return Boolean(task);
    if(n==="ON_CLEAN_SPOT")return task?.code==="C";
    if(n==="ON_DANCE_SPOT")return task?.code==="D";
    if(n==="ON_SPEAK_SPOT")return task?.code==="T";
    if(n==="ON_HAND_SPOT")return task?.code==="H";
    return undefined;
  }

  function normalize(s){return String(s??"").trim().toUpperCase().replace(/\s+/g," ")}
  function stripComment(line){const i=line.indexOf("//");return (i>=0?line.slice(0,i):line).trim()}
  function tokenizeProgram(source){
    return source.split(/\r?\n/).map((raw,i)=>({raw,line:i+1,text:stripComment(raw)})).filter(x=>x.text);
  }

  function compile(source){
    const lines=tokenizeProgram(source);
    const functions={}; const main=[]; let i=0;
    while(i<lines.length){
      const line=lines[i], n=normalize(line.text);
      const fm=n.match(/^FUNCTION\s+([A-Z_][A-Z0-9_]*)\s*\(\s*\)$/);
      if(fm){
        const body=[]; i++;
        while(i<lines.length && normalize(lines[i].text)!=="END FUNCTION"){body.push(lines[i]);i++}
        if(i>=lines.length)throw new Error(`Line ${line.line}: FUNCTION is missing END FUNCTION.`);
        functions[fm[1]]=body; i++; continue;
      }
      main.push(line);i++;
    }
    if(!main.length||normalize(main[0].text)!=="START")throw new Error("Program must begin with START.");
    if(normalize(main[main.length-1].text)!=="END")throw new Error("Program must finish with END.");
    const steps=expandBlock(main.slice(1,-1),functions,0);
    return {steps,functions};
  }

  function expandBlock(lines,functions,depth){
    if(depth>30)throw new Error("Too much nesting.");
    const out=[]; let i=0;
    while(i<lines.length){
      const item=lines[i], n=normalize(item.text);
      if(n.startsWith("IF ")){
        const cond=item.text.replace(/^IF\s+/i,"").replace(/\s+THEN\s*$/i,"").trim();
        if(!/\s+THEN\s*$/i.test(item.text))throw new Error(`Line ${item.line}: IF must end with THEN.`);
        let level=1,j=i+1,elseAt=-1;
        for(;j<lines.length;j++){
          const q=normalize(lines[j].text);
          if(q.startsWith("IF "))level++;
          if(q==="END IF"){level--;if(level===0)break}
          if(q==="ELSE"&&level===1)elseAt=j;
        }
        if(j>=lines.length)throw new Error(`Line ${item.line}: IF is missing END IF.`);
        const aStart=i+1,aEnd=elseAt>=0?elseAt:j,bStart=elseAt>=0?elseAt+1:j,bEnd=j;
        out.push({type:"if",line:item.line,raw:item.text,condition:cond,
          thenSteps:expandBlock(lines.slice(aStart,aEnd),functions,depth+1),
          elseSteps:expandBlock(lines.slice(bStart,bEnd),functions,depth+1)});
        i=j+1;continue;
      }
      if(/^REPEAT\s+/i.test(item.text)){
        const m=item.text.match(/^REPEAT\s+(.+?)\s+TIMES$/i);
        if(!m)throw new Error(`Line ${item.line}: use REPEAT n TIMES.`);
        let level=1,j=i+1;
        for(;j<lines.length;j++){const q=normalize(lines[j].text);if(q.startsWith("REPEAT "))level++;if(q==="END REPEAT"){level--;if(level===0)break}}
        if(j>=lines.length)throw new Error(`Line ${item.line}: REPEAT is missing END REPEAT.`);
        out.push({type:"repeat",line:item.line,raw:item.text,countExpr:m[1],body:expandBlock(lines.slice(i+1,j),functions,depth+1)});
        i=j+1;continue;
      }
      if(/^WHILE\s+/i.test(item.text)){
        const m=item.text.match(/^WHILE\s+(.+?)\s+DO$/i);
        if(!m)throw new Error(`Line ${item.line}: use WHILE condition DO.`);
        let level=1,j=i+1;
        for(;j<lines.length;j++){const q=normalize(lines[j].text);if(q.startsWith("WHILE "))level++;if(q==="END WHILE"){level--;if(level===0)break}}
        if(j>=lines.length)throw new Error(`Line ${item.line}: WHILE is missing END WHILE.`);
        out.push({type:"while",line:item.line,raw:item.text,condition:m[1],body:expandBlock(lines.slice(i+1,j),functions,depth+1)});
        i=j+1;continue;
      }
      if(["ELSE","END IF","END REPEAT","END WHILE","END FUNCTION"].includes(n))throw new Error(`Line ${item.line}: unexpected ${item.text}.`);
      out.push({type:"command",line:item.line,raw:item.text}); i++;
    }
    return out;
  }

  function evaluateAtom(token){
    const t=token.trim();
    if(/^".*"$/.test(t))return t.slice(1,-1);
    if(/^-?\d+(\.\d+)?$/.test(t))return Number(t);
    if(/^(TRUE|FALSE)$/i.test(t))return /^TRUE$/i.test(t);
    const sensor=sensorValue(t); if(sensor!==undefined)return sensor;
    if(Object.prototype.hasOwnProperty.call(runtime.variables,t))return runtime.variables[t];
    const matchKey=Object.keys(runtime.variables).find(k=>normalize(k)===normalize(t));
    if(matchKey)return runtime.variables[matchKey];
    return t;
  }
  function evaluateCondition(expr){
    let s=expr.trim();
    const orParts=splitLogical(s,"OR"); if(orParts.length>1)return orParts.some(evaluateCondition);
    const andParts=splitLogical(s,"AND"); if(andParts.length>1)return andParts.every(evaluateCondition);
    if(/^NOT\s+/i.test(s))return !evaluateCondition(s.replace(/^NOT\s+/i,""));
    const m=s.match(/^(.+?)\s*(<=|>=|!=|=|<|>)\s*(.+)$/);
    if(m){
      const a=evaluateAtom(m[1]),b=evaluateAtom(m[3]);
      return ({'=':a==b,'!=':a!=b,'<':a<b,'>':a>b,'<=':a<=b,'>=':a>=b})[m[2]];
    }
    return Boolean(evaluateAtom(s));
  }
  function splitLogical(expr,op){
    const parts=[];let quoted=false,start=0;const upper=expr.toUpperCase();
    for(let i=0;i<expr.length;i++){if(expr[i]==='"')quoted=!quoted;if(!quoted&&upper.slice(i,i+op.length+2)===` ${op} `){parts.push(expr.slice(start,i));start=i+op.length+2;i=start-1}}
    parts.push(expr.slice(start));return parts;
  }

  function flattenForExecution(steps,depth=0){
    const result=[];
    const expand=(items,d)=>{
      if(d>50)throw new Error("Execution nesting limit reached.");
      for(const s of items){
        if(s.type==="command"){result.push(s);continue}
        if(s.type==="if"){
          const choice=evaluateCondition(s.condition);
          result.push({type:"trace",line:s.line,raw:s.raw,evidence:`Condition is ${choice?"TRUE":"FALSE"} → ${choice?"THEN":"ELSE"} branch`});
          expand(choice?s.thenSteps:s.elseSteps,d+1); continue;
        }
        if(s.type==="repeat"){
          const count=Number(evaluateAtom(s.countExpr));
          if(!Number.isInteger(count)||count<0||count>100)throw new Error(`Line ${s.line}: REPEAT count must be an integer from 0 to 100.`);
          result.push({type:"trace",line:s.line,raw:s.raw,evidence:`Repeat ${count} time${count===1?"":"s"}`});
          for(let k=0;k<count;k++)expand(s.body,d+1);continue;
        }
        if(s.type==="while"){
          let guard=0;
          while(evaluateCondition(s.condition)){
            result.push({type:"trace",line:s.line,raw:s.raw,evidence:`WHILE condition TRUE → iteration ${guard+1}`});
            expand(s.body,d+1); guard++;
            // execute generated body before retesting cannot happen if merely flattened.
            // therefore WHILE is compiled to runtime marker instead.
            result.push({type:"while-recheck",condition:s.condition,body:s.body,line:s.line,raw:s.raw,iteration:guard});
            break;
          }
          if(guard===0)result.push({type:"trace",line:s.line,raw:s.raw,evidence:"WHILE condition FALSE → exit loop"});
        }
      }
    };
    expand(steps,depth);return result;
  }

  function prepare(){
    saveProgress();
    const compiled=compile(els.code.value);
    runtime={steps:compiled.steps,pointer:0,variables:{},functions:compiled.functions,used:new Map(),raw:els.code.value,queue:[],whileStack:[]};
    // Queue starts with block objects; dynamic expansion evaluates conditions at execution time.
    runtime.queue=[...compiled.steps];
    clearTrace();
  }

  function enqueueFront(items){runtime.queue.unshift(...items)}
  function markUsed(key){runtime.used.set(key,(runtime.used.get(key)||0)+1)}
  function executeOne(){
    if(!runtime.queue.length)return {done:true};
    const s=runtime.queue.shift();

    if(s.type==="if"){
      markUsed("IF");
      const choice=evaluateCondition(s.condition);
      addTrace(s.raw,`Condition ${s.condition} = ${choice?"TRUE":"FALSE"} → ${choice?"THEN":"ELSE"}`);
      enqueueFront(choice?s.thenSteps:s.elseSteps);
      return {done:false};
    }
    if(s.type==="repeat"){
      markUsed("REPEAT");
      const count=Number(evaluateAtom(s.countExpr));
      if(!Number.isInteger(count)||count<0||count>100)throw new Error(`Line ${s.line}: invalid REPEAT count.`);
      const expanded=[];for(let i=0;i<count;i++)expanded.push(...s.body);
      addTrace(s.raw,`Loop scheduled ${count} iteration${count===1?"":"s"}.`);
      enqueueFront(expanded);return {done:false};
    }
    if(s.type==="while"){
      markUsed("WHILE");
      const choice=evaluateCondition(s.condition);
      addTrace(s.raw,`Condition ${s.condition} = ${choice?"TRUE":"FALSE"}.`);
      if(choice){
        s._guard=(s._guard||0)+1;if(s._guard>150)throw new Error(`Line ${s.line}: WHILE exceeded 150 iterations.`);
        enqueueFront([...s.body,s]);
      }
      return {done:false};
    }
    if(s.type!=="command")return {done:false};
    return executeCommand(s);
  }

  function executeCommand(s){
    const text=s.raw.trim(), n=normalize(text);
    if(n==="MOVE"){
      markUsed("MOVE");const [dx,dy]=DELTAS[robot.dir];
      if(isWall(robot.x+dx,robot.y+dy))throw new Error(`Line ${s.line}: MOVE hits a wall.`);
      robot.x+=dx;robot.y+=dy;robot.action="move";
      addTrace(text,`Robot moved to (${robot.x}, ${robot.y}).`);return {done:false,animate:"move"};
    }
    if(n==="TURN LEFT"||n==="TURN RIGHT"){
      markUsed("TURN");const idx=DIRS.indexOf(robot.dir);robot.dir=DIRS[(idx+(n==="TURN RIGHT"?1:3))%4];
      robot.action="turn";addTrace(text,`Robot now faces ${robot.dir}.`);return {done:false,animate:"turn"};
    }
    if(n==="CLEAN"||n==="DANCE"||n==="RAISE HAND"){
      const action=n==="RAISE HAND"?"RAISE_HAND":n;markUsed(action);
      robot.action=action.toLowerCase();completeTask(action);
      addTrace(text,taskEvidence(action));return {done:false,animate:action.toLowerCase()};
    }
    if(/^OUTPUT\b/i.test(text)){
      markUsed("OUTPUT");const expr=text.replace(/^OUTPUT\s*/i,"").trim();
      const value=evaluateOutput(expr);robot.speech=String(value);robot.action="talk";completeTask("SPEAK");
      addTrace(text,`Output: ${String(value)}`);return {done:false,animate:"talk"};
    }
    let m=text.match(/^INPUT\s+(.+?)\s+INTO\s+([A-Za-z_][A-Za-z0-9_]*)$/i);
    if(m){
      markUsed("INPUT");const val=sensorValue(m[1]);if(val===undefined)throw new Error(`Line ${s.line}: unknown INPUT sensor "${m[1]}".`);
      runtime.variables[m[2]]=val;addTrace(text,`${m[2]} stores ${formatValue(val)}.`);return {done:false};
    }
    m=text.match(/^SET\s+([A-Za-z_][A-Za-z0-9_]*)\s+TO\s+(.+)$/i);
    if(m){markUsed("SET");const val=evaluateAtom(m[2]);runtime.variables[m[1]]=val;addTrace(text,`${m[1]} = ${formatValue(val)}.`);return {done:false}}
    m=text.match(/^INCREASE\s+([A-Za-z_][A-Za-z0-9_]*)\s+BY\s+(.+)$/i);
    if(m){markUsed("INCREASE");const old=Number(runtime.variables[m[1]]??0),inc=Number(evaluateAtom(m[2]));runtime.variables[m[1]]=old+inc;addTrace(text,`${m[1]} changed ${old} → ${old+inc}.`);return {done:false}}
    m=text.match(/^CALL\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(\s*\)$/i);
    if(m){
      markUsed("CALL");const fn=runtime.functions[normalize(m[1])];if(!fn)throw new Error(`Line ${s.line}: function ${m[1]}() is not defined.`);
      markUsed("FUNCTION");addTrace(text,`Calling ${m[1]}().`);
      const body=expandBlock(fn,runtime.functions,0);enqueueFront(body);return {done:false};
    }
    if(n==="START"||n==="END")return {done:false};
    throw new Error(`Line ${s.line}: I do not understand "${text}".`);
  }

  function evaluateOutput(expr){
    if(!expr)return "";
    if(/^".*"$/.test(expr))return expr.slice(1,-1);
    return evaluateAtom(expr);
  }
  function completeTask(action){
    const t=maze.tasks.find(q=>q.x===robot.x&&q.y===robot.y&&!robot.completed.has(`${q.x},${q.y}`));
    if(!t)return;
    const expected=t.label;
    if(expected===action)robot.completed.add(`${t.x},${t.y}`);
  }
  function taskEvidence(action){
    const t=maze.tasks.find(q=>q.x===robot.x&&q.y===robot.y);
    if(!t)return `${action} performed, but this square has no matching task.`;
    const ok=(t.label===action);
    return ok?`${action} completed task ${t.code}.`:`${action} does not match task ${t.code} (${t.label}).`;
  }
  function formatValue(v){return typeof v==="string"?`"${v}"`:String(v).toUpperCase()}

  function addTrace(instruction,evidence){
    if(els.traceBody.querySelector(".empty-row"))els.traceBody.innerHTML="";
    const tr=document.createElement("tr");
    const num=els.traceBody.children.length+1;
    tr.innerHTML=`<td>${num}</td><td>${escapeHtml(instruction)}</td><td>${escapeHtml(evidence)}</td>`;
    els.traceBody.appendChild(tr);els.actionCount.textContent=`${num} action${num===1?"":"s"}`;
    // Keep the browser page fixed; only the trace container scrolls.
    els.traceWrap.scrollTop=els.traceWrap.scrollHeight;
  }

  function clearTrace(){
    els.traceBody.innerHTML='<tr><td colspan="3" class="empty-row">Run or step a program to collect evidence.</td></tr>';
    els.actionCount.textContent="0 actions";
  }

  async function doStep(){
    if(running)return;
    try{
      if(!runtime||!runtime.queue){resetRobotState();prepare()}
      const result=executeOne();draw();updateSensors();
      if(result.animate) await animateAction(result.animate);
      if(runtime.queue.length===0){finishProgram()}
    }catch(err){setStatus(err.message,"error");stop()}
  }

  function runProgram(){
    if(running)return;
    try{
      resetRobotState();prepare();draw();updateSensors();running=true;setControls();
      const tick=async()=>{
        if(!running)return;
        try{
          if(!runtime.queue.length){finishProgram();return}
          const result=executeOne();draw();updateSensors();
          if(result.animate)await animateAction(result.animate);
          if(!running)return;
          if(runtime.queue.length===0){finishProgram();return}
          timer=setTimeout(tick,Number(els.speed.value));
        }catch(err){setStatus(err.message,"error");stop()}
      };
      tick();
    }catch(err){setStatus(err.message,"error");stop()}
  }

  function finishProgram(){
    stop();
    const level=LEVELS[current];
    const atGoal=robot.x===maze.goal.x&&robot.y===maze.goal.y;
    const tasksDone=maze.tasks.every(t=>robot.completed.has(`${t.x},${t.y}`));
    const syntax=validateSyntax(level);
    if(atGoal&&tasksDone&&syntax.ok){
      progress.completed[level.id]=true;
      if(current+1<LEVELS.length)progress.unlocked=Math.max(progress.unlocked,current+1);
      saveProgress();renderMissionStrip();updateProgress();
      setStatus(current===LEVELS.length-1?"Capstone complete! Every required task and code structure was verified.":"Mission complete. The next mission is unlocked.","success");
      toast("Mission complete ✓");
    }else{
      const missing=[];
      if(!atGoal)missing.push("reach G");
      if(!tasksDone){const left=maze.tasks.filter(t=>!robot.completed.has(`${t.x},${t.y}`)).map(t=>t.code).join(", ");missing.push(`complete task tile(s): ${left}`)}
      if(!syntax.ok)missing.push(syntax.message);
      setStatus(`Program ended. Still needed: ${missing.join("; ")}.`,"error");
    }
  }

  function validateSyntax(level){
    const code=normalize(runtime.raw);
    const counts={};
    for(const [k,v] of runtime.used.entries())counts[k]=v;
    for(const req of level.requiredSyntax||[]){
      const normalizedReq=req==="ELSE"?"ELSE":req;
      if(req==="ELSE"){if(!/\bELSE\b/.test(code))return {ok:false,message:"include ELSE"}}
      else if(!(counts[normalizedReq]>0) && !code.includes(req))return {ok:false,message:`use ${req}`};
    }
    for(const [k,min] of Object.entries(level.minimumCounts||{})){
      const regex=new RegExp(`\\b${k}\\b`,"g");const c=(code.match(regex)||[]).length;
      if(c<min)return {ok:false,message:`use ${k} at least ${min} times`};
    }
    if(level.oneOf && !level.oneOf.some(k=>code.includes(k)))return {ok:false,message:`use ${level.oneOf.join(" or ")}`};
    return {ok:true};
  }

  function reset(){
    stop();maze=parseMaze(LEVELS[current].map);resetRobotState();clearTrace();draw();updateSensors();setStatus("Robot reset. Your code is unchanged.","normal");
  }
  function stop(){running=false;if(timer){clearTimeout(timer);timer=null}setControls()}
  function setControls(){els.run.disabled=running;els.step.disabled=running;els.reset.disabled=false}

  function setStatus(text,type){els.status.className=`status ${type}`;els.statusText.textContent=text}
  function updateSensors(){
    const values=[
      [els.sensorFront,sensorValue("FRONT_IS_CLEAR")],
      [els.sensorLeft,sensorValue("LEFT_IS_CLEAR")],
      [els.sensorRight,sensorValue("RIGHT_IS_CLEAR")],
      [els.sensorGoal,sensorValue("ON_GOAL")]
    ];
    values.forEach(([el,v])=>{el.classList.toggle("on",Boolean(v));el.querySelector("strong").textContent=v?"TRUE":"FALSE"});
    const task=sensorValue("CURRENT_TASK");els.sensorTask.classList.toggle("on",task!=="NONE");els.sensorTask.querySelector("strong").textContent=task;
  }

  function draw(){
    const shell=els.canvas.parentElement;
    const maxW=Math.max(280,Math.min(760,shell.clientWidth-20)), maxH=500;
    const cell=Math.max(26,Math.floor(Math.min(maxW/maze.width,maxH/maze.height)));
    const w=maze.width*cell,h=maze.height*cell,dpr=Math.min(window.devicePixelRatio||1,2);
    els.canvas.width=w*dpr;els.canvas.height=h*dpr;els.canvas.style.width=`${w}px`;els.canvas.style.height=`${h}px`;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    for(let y=0;y<maze.height;y++)for(let x=0;x<maze.width;x++){
      const v=maze.rows[y][x],px=x*cell,py=y*cell;
      if(v==="#"){ctx.fillStyle="#123f73";ctx.fillRect(px,py,cell,cell);ctx.strokeStyle="rgba(255,255,255,.12)";ctx.strokeRect(px+.5,py+.5,cell-1,cell-1)}
      else{ctx.fillStyle=(x+y)%2?"#f8fbff":"#eef4fa";ctx.fillRect(px,py,cell,cell);ctx.strokeStyle="#dbe4ee";ctx.strokeRect(px+.5,py+.5,cell-1,cell-1)}
      if(v==="G"){ctx.fillStyle="#f2c94c";ctx.fillRect(px+cell*.18,py+cell*.18,cell*.64,cell*.64);ctx.fillStyle="#092b50";ctx.font=`900 ${cell*.28}px system-ui`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("G",px+cell/2,py+cell/2)}
      if(TASKS[v]){
        const done=robot.completed.has(`${x},${y}`);ctx.fillStyle=done?"#b9dfc7":TASKS[v].color;ctx.beginPath();ctx.arc(px+cell/2,py+cell/2,cell*.28,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#fff";ctx.font=`900 ${cell*.25}px system-ui`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(done?"✓":v,px+cell/2,py+cell/2)
      }
    }
    drawRobot(cell);
  }

  function drawRobot(cell){
    const cx=robot.x*cell+cell/2,cy=robot.y*cell+cell/2;
    let bounce=0,wiggle=0;
    if(robot.action==="dance"){bounce=Math.sin(robot.anim*Math.PI*6)*cell*.08;wiggle=Math.sin(robot.anim*Math.PI*8)*.25}
    if(robot.action==="clean"){wiggle=Math.sin(robot.anim*Math.PI*10)*.16}
    ctx.save();ctx.translate(cx,cy+bounce);ctx.rotate(wiggle);
    ctx.fillStyle="#eef5fb";ctx.strokeStyle="#123f73";ctx.lineWidth=Math.max(2,cell*.04);
    ctx.beginPath();ctx.roundRect(-cell*.22,-cell*.18,cell*.44,cell*.40,cell*.09);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.arc(0,-cell*.28,cell*.17,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle="#123f73";ctx.beginPath();ctx.arc(-cell*.055,-cell*.3,cell*.025,0,Math.PI*2);ctx.arc(cell*.055,-cell*.3,cell*.025,0,Math.PI*2);ctx.fill();
    // direction pointer
    const ang={E:0,S:Math.PI/2,W:Math.PI,N:-Math.PI/2}[robot.dir];ctx.save();ctx.rotate(ang);ctx.fillStyle="#f2c94c";ctx.beginPath();ctx.moveTo(cell*.3,0);ctx.lineTo(cell*.18,-cell*.08);ctx.lineTo(cell*.18,cell*.08);ctx.closePath();ctx.fill();ctx.restore();
    if(robot.action==="raise_hand"||robot.action==="dance"){
      ctx.strokeStyle="#123f73";ctx.lineWidth=cell*.06;ctx.beginPath();ctx.moveTo(cell*.18,0);ctx.lineTo(cell*.33,-cell*.3);ctx.stroke();
    }
    if(robot.action==="clean"){
      ctx.strokeStyle="#795548";ctx.lineWidth=cell*.045;ctx.beginPath();ctx.moveTo(cell*.15,cell*.05);ctx.lineTo(cell*.38,cell*.28);ctx.stroke();
      ctx.fillStyle="#f2c94c";ctx.fillRect(cell*.31,cell*.23,cell*.18,cell*.08);
    }
    ctx.restore();
    if(robot.speech){
      const text=robot.speech.length>30?robot.speech.slice(0,28)+"…":robot.speech;
      ctx.font=`700 ${Math.max(11,cell*.18)}px system-ui`;const tw=Math.min(cell*4,ctx.measureText(text).width+24),bh=Math.max(34,cell*.55);
      let bx=Math.max(4,Math.min(cx-tw/2,maze.width*cell-tw-4)),by=Math.max(4,cy-cell*.95-bh);
      ctx.fillStyle="#fff";ctx.strokeStyle="#123f73";ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(bx,by,tw,bh,10);ctx.fill();ctx.stroke();
      ctx.fillStyle="#172033";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(text,bx+tw/2,by+bh/2);
    }
  }

  function animateAction(action){
    return new Promise(resolve=>{
      const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if(reduced){robot.anim=1;draw();robot.action=null;robot.speech=null;resolve();return}
      const duration=action==="dance"?900:action==="clean"?850:action==="talk"?1050:600,start=performance.now();
      function frame(now){
        robot.anim=Math.min(1,(now-start)/duration);draw();
        if(robot.anim<1)requestAnimationFrame(frame);
        else{setTimeout(()=>{robot.action=null;robot.speech=null;robot.anim=0;draw();resolve()},80)}
      }requestAnimationFrame(frame);
    });
  }

  function updateLineIndicator(){
    const p=els.code.selectionStart, line=els.code.value.slice(0,p).split("\n").length;
    els.lineIndicator.textContent=`Ln ${line}`;
  }
  function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
  function toast(msg){els.toast.textContent=msg;els.toast.classList.add("show");setTimeout(()=>els.toast.classList.remove("show"),1800)}

  function downloadText(){
    const blob=new Blob([els.code.value],{type:"text/plain;charset=utf-8"}),a=document.createElement("a");
    a.href=URL.createObjectURL(blob);a.download=`robot-mission-${LEVELS[current].id}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)
  }

  function showFlowchart(){
    try{
      const compiled=compile(els.code.value);
      els.flowchartCanvas.innerHTML=buildFlowSvg(compiled.steps,compiled.functions);
      els.flowchartOverlay.hidden=false;document.body.style.overflow="hidden";
    }catch(err){toast(err.message)}
  }
  function closeFlowchart(){els.flowchartOverlay.hidden=true;document.body.style.overflow=""}
  function buildFlowSvg(steps,functions){
    const nodes=[];
    nodes.push({type:"term",text:"START",depth:0});
    const visit=(items,depth=0)=>{
      items.forEach(s=>{
        if(s.type==="command"){
          const n=normalize(s.raw);
          nodes.push({type:/^(INPUT|OUTPUT)/.test(n)?"io":/^CALL /.test(n)?"call":"proc",text:s.raw,depth});
        }else if(s.type==="if"){
          nodes.push({type:"decision",text:`IF ${s.condition}`,depth});
          nodes.push({type:"label",text:"TRUE",depth:depth+1});visit(s.thenSteps,depth+1);
          if(s.elseSteps.length){nodes.push({type:"label",text:"FALSE",depth:depth+1});visit(s.elseSteps,depth+1)}
          nodes.push({type:"merge",text:"END IF",depth});
        }else if(s.type==="repeat"){
          nodes.push({type:"decision",text:`REPEAT ${s.countExpr} TIMES`,depth});visit(s.body,depth+1);nodes.push({type:"merge",text:"END REPEAT ↺",depth});
        }else if(s.type==="while"){
          nodes.push({type:"decision",text:`WHILE ${s.condition}`,depth});visit(s.body,depth+1);nodes.push({type:"merge",text:"END WHILE ↺",depth});
        }
      })
    };
    visit(steps);nodes.push({type:"term",text:"END",depth:0});
    Object.entries(functions).forEach(([name,body])=>{nodes.push({type:"section",text:`FUNCTION ${name}()`,depth:0});visit(expandBlock(body,functions,0),1);nodes.push({type:"merge",text:"END FUNCTION",depth:0})});
    const width=940,row=92,height=Math.max(420,80+nodes.length*row),cx=width/2;let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><defs><marker id="arr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#123f73"/></marker></defs>`;
    let last=null;
    nodes.forEach((n,i)=>{
      const y=42+i*row,x=cx+n.depth*70;
      if(last){svg+=`<line x1="${last.x}" y1="${last.y+34}" x2="${x}" y2="${y-8}" stroke="#123f73" stroke-width="2" marker-end="url(#arr)"/>`}
      if(n.type==="term"){svg+=`<rect x="${x-150}" y="${y}" width="300" height="54" rx="27" fill="#e8f7ee" stroke="#3b8f57" stroke-width="2"/>`}
      else if(n.type==="io"){svg+=`<polygon points="${x-165+20},${y} ${x+165},${y} ${x+165-20},${y+58} ${x-165},${y+58}" fill="#eaf3fd" stroke="#123f73" stroke-width="2"/>`}
      else if(n.type==="decision"){svg+=`<polygon points="${x},${y-5} ${x+185},${y+29} ${x},${y+63} ${x-185},${y+29}" fill="#fff8d8" stroke="#b88700" stroke-width="2"/>`}
      else if(n.type==="call"){svg+=`<rect x="${x-165}" y="${y}" width="330" height="58" fill="#f2f7ff" stroke="#123f73" stroke-width="2"/><line x1="${x-148}" y1="${y}" x2="${x-148}" y2="${y+58}" stroke="#123f73" stroke-width="2"/><line x1="${x+148}" y1="${y}" x2="${x+148}" y2="${y+58}" stroke="#123f73" stroke-width="2"/>`}
      else if(n.type==="label"||n.type==="merge"){svg+=`<rect x="${x-145}" y="${y}" width="290" height="48" rx="8" fill="#f8fafc" stroke="#9fb2c7" stroke-width="2" stroke-dasharray="${n.type==="label"?"5 4":"0"}"/>`}
      else if(n.type==="section"){svg+=`<rect x="${x-190}" y="${y}" width="380" height="54" rx="10" fill="#123f73" stroke="#092b50" stroke-width="2"/>`}
      else{svg+=`<rect x="${x-165}" y="${y}" width="330" height="58" rx="7" fill="#fff" stroke="#123f73" stroke-width="2"/>`}
      const fill=n.type==="section"?"#fff":"#172033";svg+=`<text x="${x}" y="${y+(n.type==="decision"?31:29)}" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="${n.type==="label"?"800":"650"}" fill="${fill}">${escapeXml(n.text)}</text>`;
      last={x,y};
    });
    return svg+"</svg>";
  }
  function escapeXml(v){return String(v).replace(/[<>&'"]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;","'":"&apos;",'"':"&quot;"}[c]))}
  function downloadFlowSvg(){
    const svg=els.flowchartCanvas.querySelector("svg");if(!svg){toast("Generate the flowchart first.");return}
    const blob=new Blob([new XMLSerializer().serializeToString(svg)],{type:"image/svg+xml"}),a=document.createElement("a");
    a.href=URL.createObjectURL(blob);a.download=`robot-mission-${LEVELS[current].id}-flowchart.svg`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)
  }

  els.hintButton.addEventListener("click",()=>{els.hintBox.hidden=!els.hintBox.hidden;els.hintButton.textContent=els.hintBox.hidden?"Show hint":"Hide hint"});
  els.run.addEventListener("click",runProgram);els.step.addEventListener("click",doStep);els.reset.addEventListener("click",reset);
  els.code.addEventListener("input",()=>{updateLineIndicator();saveProgress()});els.code.addEventListener("click",updateLineIndicator);els.code.addEventListener("keyup",updateLineIndicator);
  $("downloadButton").addEventListener("click",downloadText);$("flowchartButton").addEventListener("click",showFlowchart);
  $("closeFlowchartButton").addEventListener("click",closeFlowchart);$("downloadFlowchartButton").addEventListener("click",downloadFlowSvg);
  els.flowchartOverlay.addEventListener("click",e=>{if(e.target===els.flowchartOverlay)closeFlowchart()});
  window.addEventListener("keydown",e=>{if(e.key==="Escape"&&!els.flowchartOverlay.hidden)closeFlowchart()});
  window.addEventListener("resize",()=>draw());

  makeToolbar(els.commandToolbar,commandTemplates);makeToolbar(els.blockToolbar,blockTemplates);
  loadLevel(Math.min(progress.unlocked,LEVELS.length-1));
})();
