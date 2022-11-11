var cursor;
var grid;
var data = {};
var nodes = [];
var info;
var threat;
var cycle, projection, conclusion, image_container, threat_image;
var n_complete = false;
var index = 0;
var lastMillis = 0;
var b_reset, b_complete;
var images = [];
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
    draw(isHovered) {

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
        if (isHovered) {

            triangle(mouseX + 20, mouseY - 20, mouseX - 20, mouseY - 20, mouseX, mouseY + 20);
        }
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
    xoff = 0;
    yoff = 0;
    xMin =  Number.POSITIVE_INFINITY;
    xMax =  Number.NEGATIVE_INFINITY;
    yMin = Number.POSITIVE_INFINITY;
     yMax = Number.NEGATIVE_INFINITY;

    constructor(cell_size) {
        this.cell_size = cell_size;

    }
    getBounds(){
        return {"xMin":this.xMin,
                "xMax":this.xMax,
                "yMin":this.yMin,
                "yMax":this.yMax
                }
    }
    setup() {
        this.lines = [];
        this.points = []
        
        let xs = this.cell_size * ceil((width / this.cell_size) );
        let ys = this.cell_size * ceil((height / this.cell_size) );
        console.log(xs / 2)
        console.log(width)
        this.xoff = (width / 2) - xs;
        this.yoff = (height / 2) - ys
        console.log("Xoff",this.xoff);
        
        for (let x = this.xoff; x <= width; x += this.cell_size) {
            if(x > 0 && x <= width) {
            if(x < this.xMin) {
                this.xMin = x;
            }
            if(x > this.xMax) {
                this.xMax = x
            }
            this.lines.push(new Line(x, 0, x, height))
            }
            
        }
        console.log(this.xMin);
            console.log(this.xMax)

        for (let y =this.yoff; y < height; y += this.cell_size) {
            if(y > 0 && y <= height) {
                if(y < this.yMin) {
                    this.yMin = y;
                }
                if(y > this.yMax) {
                    this.yMax = y
                }
                this.lines.push(new Line(0, y, width, y))
            }


        }
        console.log(this.yMin);
            console.log(this.yMax)
        for (let x = this.xoff; x <= width; x += this.cell_size) {
            for (let y = this.yoff; y < height; y += this.cell_size) {
                if(y > 0 && y <= height && x > 0 && x <= width) {
                this.points.push(new Line(x - 5, y, x + 5, y))
                this.points.push(new Line(x, y - 5, x, y + 5))
                }
            }

        }

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
        noStroke();
        fill(10)
       rect(0,this.yMin,this.xMin,this.yMax - this.yMin)
       rect(this.xMax,this.yMin,this.xMin,this.yMax - this.yMin)
       rect(0,0,width,this.yMin)
       rect(0,this.yMax,width,this.yMin)
       stroke(70)
       line(this.xMin/2,0, this.xMin/2, height * 0.55)
       line(this.xMin/2,height * 0.75, this.xMin/2, height )
       line(this.xMax+this.xMin/2,0, this.xMax+this.xMin/2, height * 0.55)
       line(this.xMax+this.xMin/2,height * 0.75, this.xMax+this.xMin/2, height )
       stroke(150)
       line(this.xMin/2 + 10,0, this.xMin/2 + 10, height * 0.33)
       line(this.xMin/2 + 10, height * 0.33,this.xMin/2 - 8 ,(height * 0.33) + 10)
       line(this.xMin/2 + 10,height * 0.5, this.xMin/2 + 10, height )
       line(this.xMin/2 + 10,height * 0.5, this.xMin/2 - 8 ,(height * 0.5) - 10 )
       line(this.xMax+this.xMin/2 - 10,0, this.xMax+this.xMin/2 - 10, height )
    }
}
//https://p5js.org/examples/simulate-particles.html
//I initially made a network grapher but fugg it the above looks nicer
class Node {
    constructor(data_object,bounds) {
        this.x = random(bounds.xMin, bounds.xMax);
        this.y = random(bounds.yMin, bounds.yMax);
        this.r = random(5, 10);
        this.xSpeed = random(-1, 1);
        this.ySpeed = random(-0.5, 0.5);
        this.focused = false;
        this.visited = false;
        this.mx = 0;
        this.my = 0;
        this.data_object = data_object;
        this.allVisited = false;
        this.bounds = bounds;
       
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
            fill('rgba(255,0,0,1)');
            this.createDomRect(info)
            this.visited = true;
        } else {
            if (this.allVisited || this.visited) {
                fill('rgba(255,0,0,0.5)');

            } else {
                fill('rgba(200,169,169,0.5)');
            }

           
            //info.hide();
        }
        circle(this.x, this.y, this.r);
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
            if (this.x < this.bounds.xMin || this.x > this.bounds.xMax)
                this.xSpeed *= -1;
            if (this.y < this.bounds.yMin || this.y > this.bounds.yMax)
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

function loadData(bounds) {
    for (let i = 0; i < data['evidence'].length; i++) {
        nodes.push(new Node(data['evidence'][i],bounds))
    }
    for (let i = 0; i < data['images'].length; i++) {
        let img = createImg(data['images'][i]);
        img.id(`img${i}`);
        img.hide();
        images.push(img);
        image_container.child(img);
    }
}
function checkComplete(nodes) {
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].visited == false) { return false }
    }
    return true;
}
function windowResized() {
    resizeCanvas(windowWidth - 8, windowHeight - 8);
    grid.setup();
}
function preload() {
    data = loadJSON('assets/data.json');
}
function setup() {
    // put setup code here
    createCanvas(windowWidth - 8, windowHeight -8);
    
    info = select('#info');
    info.position(0, 0, 'fixed');
    info.hide();
    threat = select('#samaritan_threat');
    cycle = select('#image_cycle');
    projection = select('.projection.text .value');
    conclusion = select('.conclusion.text .value');
    image_container = select('.image-container');
    threat_image = select('#threat-image');
    threat_image.hide();
    threat.hide();
    grid = new Grid(100);
    grid.setup();
    loadData(grid.getBounds());
     cursor = new SamaritanCursor();
    b_reset = select('#reset');
    b_reset.mouseClicked(reset);
    b_complete = select('#complete');
    b_complete.mouseClicked(complete);
    evidence = shuffle(images)
}
function imageCycle( images) {

    if (index < images.length) {

        if (millis() > lastMillis + 150) {
            if (index > 0) {
                images[index - 1].hide();
            }
            images[index].show();
            lastMillis = millis();
            index = index + 1;
        }

    } else {
        if (millis() > lastMillis + 150) {
        projection.html('THREAT');
        conclusion.html('ELIMINATE');
        images[images.length - 1].hide();
        threat_image.show();
        }
     
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
    threat_image.hide();
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
        nodes[i].joinNode(nodes.slice(i));
        nodes[i].createNode(info, n_complete);
        nodes[i].focus(mouseX, mouseY)
        nodes[i].moveNode(grid.getBounds());


    }
    if (n_complete) {

        threat.show();
        imageCycle(evidence)
    } else {
        threat.hide();
    }
    textSize(16);
    textAlign(CENTER, TOP);
    noStroke();
    fill(255)
    text('Hover over the network nodes. Make sure to visit them all.', 0, 30, width);
    textAlign(RIGHT);
    //textSize(11);
    //text('Steal it. No warranty though. Made with p5.', -10, height - 20, width);
    cursor.draw(checkFocus(nodes));

}
