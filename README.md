# CSE 160 - Assignment 1 - Paint
Name: Alexander Bateman  
Email: arbatema@ucsc.edu  

Live Demo: https://ycmsoft.github.io/paint/src/asgn1.html

# Files:
- `index.html` - Root `index.html` redirects to `src/asgn1.html` for GitHub Pages.
- `src/asgn1.html` - UI/canvas.
- `src/asgn1.js` - drawing/operations implementation file. 
- `src/Point.js` - Point/Square shape class.
- `src/Triangle.js` - Triangle shape class.
- `src/Circle.js` - Circle shape class.
- `lib/cuon-utils.js` - Shader utilities
- `lib/webgl-debug.js` - WebGL debugging utilities
- `lib/webgl-utils.js` - WebGL utilities
- `lib/myDrawing.JPEG` - Picture of my drawing.
- `README.md` - This readme.
# Notes to Grader:
Awesomeness: Added an opacity slider for transparent paint that can be layered like real paint. 

Resources used: I tried out Cursor for the first time, I wasn't really happy with it but I guess I have a lot to learn.
I didn't like how it went straight to making code changes, I prefer the conversational style 
of ChatGPT. I need to learn more about the review/undo because it kept getting ahead of me.
That said, I tried it out for a function that I knew I could do easily (addActionsForHTMLUI)
and I was really happy with how it turned out, it was exactly as I envisioned it, just essentially
auto-completed it for me. 

When I was working on the initials, I went to ChatGPT to have it give me the rect() helper function,
which just draws a rectangle with two triangles, I used it to make the initals easier to draw in straight blocks.

ChatGPT also helped me identify the WebGL alpha blending setup needed for the opacity slider with
gl.enable(gl.BLEND); and gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); 

