// asgn1.js
// Alexander Bateman
// arbatema@ucsc.edu
// Notes to Grader: 
// Awesomeness: Added an opacity slider for transparent paint that can be layered like real paint. 
// Resources used: 
// I tried out Cursor for the first time, I wasn't really happy with it but I guess I have a lot to learn.
// I didn't like how it went straight to making code changes, I prefer the conversational style 
// of ChatGPT. I need to learn more about the review/undo because it kept getting ahead of me.
// That said, I tried it out for a function that I knew I could do easily (addActionsForHTMLUI)
// and I was really happy with how it turned out, it was exactly as I envisioned it, just essentially
// auto-completed it for me. 

// When I was working on the initials, I went to ChatGPT to have it give me the rect() helper function,
// which just draws a rectangle with two triangles, I used it to make the initals easier to draw in straight blocks.

// ChatGPT also helped me identify the WebGL alpha blending setup needed for the opacity slider with
// gl.enable(gl.BLEND); and gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); 



let canvas = null;
let gl;
let a_Position;
let u_FragColor;
let u_PointSize;

//UI state
let g_selectedColor = [1.0, 0.0, 0.0, 1.0]; 
let g_selectedSize = 10.0;
let g_selectedShape = 'point'; 
let g_circleSegments = 30;
let g_alpha = 1.0;

//Shapes to draw
let shapesList = [];

// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform float u_PointSize;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = u_PointSize;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';


function main(){
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHTMLUI();
  
  //Dragging draw
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev){
    if (ev.buttons == 1) click(ev);
  };

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function setupWebGL(){
  canvas = document.getElementById("webgl");
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log("Failed to get WebGL context");
    return;
  }
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
    console.log("Failed to init shaders");
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get a_Position");
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (!u_FragColor) {
    console.log("Failed to get u_FragColor");
    return;
  }

  u_PointSize = gl.getUniformLocation(gl.program, "u_PointSize");
  if (!u_PointSize) {
    console.log("Failed to get u_PointSize");
    return;
  }
}


function addActionsForHTMLUI(){
  //Color sliders
  let redSlider = document.getElementById("redSlider");
  let greenSlider = document.getElementById("greenSlider");
  let blueSlider = document.getElementById("blueSlider");
  
  redSlider.addEventListener("input", function(){
    g_selectedColor[0] = redSlider.value / 100.0;
    document.getElementById("redValue").textContent = g_selectedColor[0].toFixed(2);
  });
  
  greenSlider.addEventListener("input", function(){
    g_selectedColor[1] = greenSlider.value / 100.0;
    document.getElementById("greenValue").textContent = g_selectedColor[1].toFixed(2);
  });
  
  blueSlider.addEventListener("input", function(){
    g_selectedColor[2] = blueSlider.value / 100.0;
    document.getElementById("blueValue").textContent = g_selectedColor[2].toFixed(2);
  });

  //Size slider
  let sizeSlider = document.getElementById("sizeSlider");
  sizeSlider.addEventListener("input", function(){
    g_selectedSize = parseFloat(sizeSlider.value);
    document.getElementById("sizeValue").textContent = g_selectedSize;
  });

  //Circle segments slider
  let segmentsSlider = document.getElementById("segmentsSlider");
  segmentsSlider.addEventListener("input", function(){
    g_circleSegments = parseInt(segmentsSlider.value);
    document.getElementById("segmentsValue").textContent = g_circleSegments;
  });

  //Point (square) button
  document.getElementById("pointButton").addEventListener("click", function(){
    g_selectedShape = 'point';
  });
  //Triangle button
  document.getElementById("triangleButton").addEventListener("click", function(){
    g_selectedShape = 'triangle';
  });
  
  //Circle button
  document.getElementById("circleButton").addEventListener("click", function(){
    g_selectedShape = 'circle';
  });

  //Clear canvas button
  document.getElementById("clearButton").addEventListener("click", function(){
    shapesList = [];
    renderAllShapes();
  });

  //Draw picture button
  document.getElementById("drawPictureButton").addEventListener("click", function(){
    drawPicture();
  });

  //Opacity/Alpha slider
  let alphaSlider = document.getElementById("alphaSlider");
  alphaSlider.addEventListener("input", function(){
    g_alpha = alphaSlider.value / 100.0;
    g_selectedColor[3] = g_alpha;
    document.getElementById("alphaValue").textContent = g_alpha.toFixed(2);
});
}

function click(ev){
  let [x, y] = convertCoordinatesEventToGL(ev);

  if (g_selectedShape === 'point'){
    let point = new Point(x, y, [...g_selectedColor], g_selectedSize);
    shapesList.push(point);
  } else if (g_selectedShape === 'triangle'){
    let size = g_selectedSize / 200.0;
    let triangle = new Triangle(
      x, y + size,           //Top
      x - size, y - size,    //Bottom left
      x + size, y - size,    //Bottom right
      [...g_selectedColor]
    );
    shapesList.push(triangle);
  } else if (g_selectedShape === 'circle'){
    let radius = g_selectedSize / 400.0;
    let circle = new Circle(x, y, radius, [...g_selectedColor], g_circleSegments);
    shapesList.push(circle);
  }
  //Color check debug
  //console.log("Current RGBA:", g_selectedColor);
  renderAllShapes();
}

//ClickedPoints.js
function convertCoordinatesEventToGL(ev){
  let x = ev.clientX;
  let y = ev.clientY;
  let rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}

function renderAllShapes(){
  gl.clear(gl.COLOR_BUFFER_BIT);

  for (let i = 0; i < shapesList.length; i++){
    shapesList[i].render();
  }
}


function drawPicture(){

  //To clear canvas before picture shows up
  shapesList = []; 

  function tri(x1, y1, x2, y2, x3, y3, c){
    shapesList.push(new Triangle(x1, y1, x2, y2, x3, y3, c));
  }
  function rect(x1, y1, x2, y2, c){
    tri(x1, y1,  x2, y1,  x2, y2, c);
    tri(x1, y1,  x2, y2,  x1, y2, c);
}

  let green = [0.1, 0.8, 0.2, 1.0];
  let dark  = [0.0, 0.5, 0.1, 1.0];
  let light = [0.3, 1.0, 0.4, 1.0];

  //Head
  tri(-0.15, 0.85,  0.15, 0.85,  0.15, 0.65, green);
  tri(-0.15, 0.85,  0.15, 0.65, -0.15, 0.65, green);
  tri(-0.15, 0.65, -0.12, 0.68,  0.15, 0.85, dark);
  let neckX = 0.0, neckY = 0.62;
  tri(neckX, neckY, -0.85, 0.15, -0.25, 0.25, green);
  tri(neckX, neckY,  0.85, 0.15,  0.25, 0.25, green);


  //Torso
  tri(0.0, 0.62, -0.28, 0.30, 0.28, 0.30, green);
  tri(-0.28, 0.05, -0.22, -0.55, -0.10, -0.20, green);

  tri(0.28, 0.05, 0.22, -0.55, 0.10, -0.20, green);
  tri(0.0, 0.30,  -0.22, 0.05,   0.22, 0.05,  green);   
  tri(0.0, -0.25, -0.22, 0.05,   0.22, 0.05,  green);   

  tri(-0.22, 0.05, -0.12, -0.55, 0.0,  -0.25, green);   
  tri(0.22,  0.05,  0.12, -0.55, 0.0,  -0.25, green);   
  
  //Cbest insignia/embelem
  tri(0.0, 0.44,  -0.12, 0.28,   0.12, 0.28, dark);
  //tri(0.0, 0.28,  -0.08, 0.16,   0.08, 0.16, dark);

  tri(-0.22, 0.05, -0.28, 0.30, 0.0, 0.30, green);
  tri( 0.22, 0.05,  0.28, 0.30, 0.0, 0.30, green);
  
  //Left leg
  tri(0.0, -0.20, -0.10, -0.20, -0.35, -0.90, green);
  tri(0.0, -0.20, -0.35, -0.90, -0.05, -0.90, green);

  //Right leg
  tri(0.0, -0.20, 0.10, -0.20, 0.35, -0.90, green);
  tri(0.0, -0.20, 0.35, -0.90, 0.05, -0.90, green);

    
  //Initials
  let ab = [1.0, 0.0, 1.0, 1.0]; 

  let x0 = -0.10;   
  let y0 =  0.27;   
  let width  =  0.08;   
  let height  =  0.18;   
  let thickness  =  0.015;   

  //A
  rect(x0, y0, x0 + thickness, y0 - height, ab);
  rect(x0 + width - thickness, y0, x0 + width, y0 - height, ab);
  rect(x0, y0, x0 + width, y0 - thickness, ab);
  rect(x0, y0 - height/2, x0 + width, y0 - height/2 - thickness, ab);

  //B
  let bx = x0 + width + 0.05; //width of A + 0.05 for kerning/spacing, used instead of x0

  rect(bx, y0, bx + thickness, y0 - height, ab);

  rect(bx, y0, bx + width, y0 - thickness, ab);
  rect(bx, y0 - height/2, bx + width, y0 - height/2 - thickness, ab);
  
  //Bottom crossbar to make it a B
  rect(bx, y0 - height, bx + width, y0 - height + thickness, ab);

  rect(bx + width - thickness, y0, bx + width, y0 - height/2, ab);
  rect(bx + width - thickness, y0 - height/2, bx + width, y0 - height, ab);
  
  
  renderAllShapes();

  }