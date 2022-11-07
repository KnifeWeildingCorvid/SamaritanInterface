var cursor;
var grid;
var data = {};
var nodes = [];
var info;
var threat;
var cycle, projection, conclusion;
var n_complete = false;
var index = 0;
var lastMillis = 0;
var b_reset, b_complete;
var images = ["assets/john_reese2.png",
    "assets/john_reese3.png",
    "assets/john_reese4.png",
    "assets/john_reese5.png",
    "assets/john_reese6.png",
    "assets/john_reese7.png",
    "assets/john_reese8.png",
    "assets/john_reese9.png",
    "assets/john_reese10.png",
    "assets/john_reese11.png",
    "assets/john_reese12.png",
    "assets/john_reese13.png",
    "assets/john_reese14.png",
    "assets/john_reese15.png",
    "assets/john_reese16.png"];
var evidence;
class SamaritanCursor {
    x;
    y;
    //https://p5js.org/examples/input-easing.html
    ex = 1;
    ey = 1;
    diameter = 150;
    easing = 0.5;
    constructor() {
        this.x = 0;
        this.y = 0;
    }
    PolarToCartesian(r, theta) {
        let x = r * cos(theta);
        let y = r * sin(theta);
        return { "x": x, "y": y };
    }
    getPolarLineSegment(r, theta, line_length) {
        //I have zero idea why r doubles the distance from origin
        var polar1 = this.PolarToCartesian(r / 2, theta);
        var polar2 = this.PolarToCartesian((r / 2) - line_length, theta);
        return { "x1": polar1.x, "y1": polar1.y, "x2": polar2.x, "y2": polar2.y };
    }
    draw() {

        let dx = mouseX - this.ex;
        this.ex += dx * this.easing;

        let dy = mouseY - this.ey;
        this.ey += dy * this.easing;
        noFill();

        strokeWeight(35);
        stroke('rgba(255,255,255,0.10)');
        circle(mouseX, mouseY, 140);
        strokeWeight(25);
        stroke('rgba(0,0,0,0.25)');
        circle(mouseX, mouseY, this.diameter);
        strokeWeight(1);
        stroke('rgba(255,255,255,0.25)');
        circle(this.ex, this.ey, this.diameter);
        strokeWeight(2);
        stroke(255);
        var p = QUARTER_PI / 2;



        arc(mouseX, mouseY, 200, 200, PI - p, PI + p);
        arc(mouseX, mouseY, 200, 200, TWO_PI - p, TWO_PI + p);
        strokeWeight(1);
        stroke(0);
        var line1 = this.getPolarLineSegment(130, PI - p, 5);
        var line2 = this.getPolarLineSegment(130, PI + p, 5)
        line(this.ex + line1.x1, this.ey + line1.y1, this.ex + line1.x2, this.ey + line1.y2);
        line(this.ex + line2.x1, this.ey + line2.y1, this.ex + line2.x2, this.ey + line2.y2);
        arc(this.ex, this.ey, 130, 130, PI - p, PI + p);
        var line3 = this.getPolarLineSegment(130, TWO_PI - p, 5);
        var line4 = this.getPolarLineSegment(130, TWO_PI + p, 5)
        line(this.ex + line3.x1, this.ey + line3.y1, this.ex + line3.x2, this.ey + line3.y2);
        line(this.ex + line4.x1, this.ey + line4.y1, this.ex + line4.x2, this.ey + line4.y2);
        arc(this.ex, this.ey, 130, 130, TWO_PI - p, TWO_PI + p);
        strokeWeight(2);
        stroke(255, 0, 0);
        triangle(mouseX + 20, mouseY - 20, mouseX - 20, mouseY - 20, mouseX, mouseY + 20);
    }
}
class Line {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
    draw() {
        line(this.x1, this.y1, this.x2, this.y2);
    }
}
class Grid {
    lines = [];
    points = [];
    constructor(cell_size, sizeX, sizeY) {
        this.cell_size = constrain(cell_size, 10, 100);
        this.sizeX = sizeX;
        this.sizeY = sizeY;
    }
    setup() {
        this.lines = [];
        this.points = [];
        for (let x = 0; x < width; x++) {
            if (x % this.cell_size == 0) {
                
                this.lines.push(new Line(x, 0, x, height))

            }
        }
        for (let y = 0; y < height; y++) {
            if (y % this.cell_size == 0) {
                this.lines.push(new Line(0, y, width, y))

            }
        }
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (x % this.cell_size == 0 && y % this.cell_size == 0) {
                    this.points.push(new Line(x - 5, y + this.cell_size, x + 5, y + this.cell_size))
                    this.points.push(new Line(x + this.cell_size, y - 5, x + this.cell_size, y + 5))
                }
            }

        }
        console.log(this.lines)
    }
    draw() {
        for (let i = 0; i < this.lines.length; i++) {
            stroke(10)
            this.lines[i].draw();
        }
        for (let i = 0; i < this.points.length; i++) {
            stroke(50)
            this.points[i].draw();
        }
    }
}
//https://p5js.org/examples/simulate-particles.html
//I initially made a network grapher but fugg it the above looks nicer
class Node {
    constructor(data_object) {
        this.x = random(0, width);
        this.y = random(0, height);
        this.r = random(5, 10);
        this.xSpeed = random(-2, 2);
        this.ySpeed = random(-1, 1.5);
        this.focused = false;
        this.visited = false;
        this.mx = 0;
        this.my = 0;
        this.data_object = data_object;
        this.allVisited = false;
    }

    // creation of a particle.
    createNode(info, visited) {
        noStroke();
        this.allVisited = visited;

        if (this.focused) {
            // stroke(255);
            //nofill();
            //circle(this.mx, this.my, this.r * 2);
            //this.createDataRect();
            this.createDomRect(info)
            this.visited = true;
        } else {
            if (this.allVisited) {
                fill('rgba(255,0,0,0.5)');

            } else {
                fill('rgba(200,169,169,0.5)');
            }

            circle(this.x, this.y, this.r);
            //info.hide();
        }
    }
    createDataRect() {
        fill(200);
        stroke(126);
        text(this.data_object['name'], this.x + this.r + 100, this.y);
        text(this.data_object['transcript'], this.x + this.r + 100, this.y + 15);
    }
    createDomRect(info) {
        info.show();
        info.elt.innerHTML = this.data_object['content'];
        let offset = 100;
        let info_size = info.size();
        let nx = this.x + this.r + 100;
        let ny = this.y - info_size.height / 2

        //console.log(info.size())
        if (width > 800) {
            if (this.x + this.r + offset + info_size.width > width) {
                nx = this.x - this.r - offset - info_size.width;
            }
            if (this.y - info_size.height / 2 < 0) {
                ny = this.y;
            }
            if (this.y + info_size.height / 2 > height) {
                ny = this.y - info_size.height
            }
        } else {
            nx = width / 2 - info_size.width / 2;
            ny = height / 2 - info_size.height / 2;
        }


        info.position(nx, ny, "fixed")
    }

    focus(mx, my) {
        let d = dist(mx, my, this.x, this.y);
        let c = sqrt((this.x - mx) * (this.x - mx) + (this.y - my) * (this.y - my))
        this.focused = c < 30;
        this.mx = (this.focused) ? mx : 0;
        this.my = (this.focused) ? my : 0;

    }
    // setting the particle in motion.
    moveNode() {
        if (!this.focused) {
            if (this.x < 0 || this.x > width)
                this.xSpeed *= -1;
            if (this.y < 0 || this.y > height)
                this.ySpeed *= -1;
            this.x += this.xSpeed;
            this.y += this.ySpeed;
        }
    }

    // this function creates the connections(lines)
    // between particles which are less than a certain distance apart
    joinNode(particles) {
        if (!this.allVisited) {
            particles.forEach(element => {
                let d = dist(this.x, this.y, element.x, element.y);
                let m = map(d, 0, width, 0, 1);
                if (this.visited && element.visited) {
                    stroke(`rgba(255,0,0,${constrain(1 - m, 0, 1)})`)
                } else {
                    stroke(`rgba(120,120,120,${constrain(1 - m, 0, 1)})`);
                }
                line(this.x, this.y, element.x, element.y);


            });
        } else {

            particles.forEach(element => {

                let d = dist(this.x, this.y, element.x, element.y);
                let m = map(d, 0, width, 0, 1);
                stroke(`rgba(255,0,0,${constrain(1 - m, 0, 1)})`)
                line(this.x, this.y, element.x, element.y);


            });
            stroke('rgba(255,0,0,0.4)');
            line(this.x, this.y, width / 2, height / 2)
        }
    }
}

function loadData() {
    for (let i = 0; i < Object.keys(data).length; i++) {
        nodes.push(new Node(data[i]))
    }
    console.log(nodes)
}
function checkComplete(nodes) {
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].visited == false) { return false }
    }
    return true;
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    grid.setup();
  }
function preload() {
    data = loadJSON('assets/data.json');
    console.log(data)
}
function setup() {
    // put setup code here
    createCanvas(windowWidth, windowHeight);
    evidence = shuffle(images)
    info = select('#info');
    info.position(0, 0, 'fixed');
    info.hide();
    threat = select('#samaritan_threat');
    cycle = select('#image_cycle');
    projection = select('.projection.text .value');
    conclusion = select('.conclusion.text .value');

    threat.hide();
    loadData();
    grid = new Grid(windowWidth/20, windowWidth, windowHeight);
    grid.setup();
    cursor = new SamaritanCursor();
    b_reset = select('#reset');
    b_reset.mouseClicked(reset);
    b_complete = select('#complete');
    b_complete.mouseClicked(complete)
}
function imageCycle(elem, images) {

    if (index < images.length) {

        if (millis() > lastMillis + 200) {
            console.log(index)
            index = index + 1;
            elem.elt.style.backgroundImage = `url('${images[index]}')`
            lastMillis = millis();
        }

    } else {
        projection.html('THREAT');
        conclusion.html('ELIMINATE')
        elem.hide();
    }
    //elem.elt.style.backgroundImage = `url('${images[0]}')`


}
function checkFocus(nodes) {
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].focused) { return nodes[i].focused }
    }
    return false;
}
function reset() {
    for (let i = 0; i < nodes.length; i++) {
        nodes[i].visited = false;
    }
    projection.html('');
    conclusion.html('')
    cycle.show();
    index = 0;
}
function complete() {
    for (let i = 0; i < nodes.length; i++) {
        nodes[i].visited = true;
    }
}
function draw() {
    // put drawing code here;

    background(0);
    for (let y = 0; y < height; y++) {
        if (y % 4 == 0) {
            stroke(10)
            line(0, y, width, y)
        }

    }
    grid.draw();
    if (!checkFocus(nodes)) {
        info.hide();
    }
    n_complete = checkComplete(nodes)
    for (let i = 0; i < nodes.length; i++) {

        nodes[i].createNode(info, n_complete);
        nodes[i].joinNode(nodes.slice(i));
        nodes[i].focus(mouseX, mouseY)
        nodes[i].moveNode();


    }
    if (n_complete) {

        threat.show();
        imageCycle(cycle, evidence)
    } else {
        threat.hide();
    }
    textSize(16);
    textAlign(CENTER, TOP);
    noStroke();
    fill(255)
    text('Hover over the network nodes. Make sure to visit them all.', 0, 30, width);
    textAlign(RIGHT);
    textSize(11);
    text('Steal it. No warranty though. Made with p5.', -10, height - 20, width);
    cursor.draw();

}
