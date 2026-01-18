// Point.js
// Alexander Bateman
// arbatema@ucsc.edu
// Notes to Grader: 
// Awesomeness: Added an opacity slider for transparent paint that can be layered like real paint. 
// Resources used: None (on this file)


// Point class
class Point{
  constructor(x, y, color, size){
    this.x = x;
    this.y = y;
    this.color = color; 
    this.size = size;
  }

  render(){
    gl.disableVertexAttribArray(a_Position); 
    gl.vertexAttrib3f(a_Position, this.x, this.y, 0.0);
    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    gl.uniform1f(u_PointSize, this.size);
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}