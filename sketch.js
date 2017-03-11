var serial; // variable to hold an instance of the serialport library
var sensorValue = 20;		// ellipse position

var video;

// A variable for the color we are searching for.
var trackColor; 

var threshold = 25;
var lerpX=0
var lerpY=0;

var motionX=0;
var motionY=0;

var oldposition = 0;

var outByte;



function setup() {
  frameRate(10);
  //MediaStreamTrack.getSources(gotSources);

	  var options = {
    video: {
      optional: [{
        sourceId: '5b9c3d482c5e9fe9e400aa9a3a53362e50ca95c9f1fa849f164c6e55e2138500'
      }]
    }
  };
  
  serial = new p5.SerialPort();  // make a new instance of  serialport library
  serial.on('list', printList);  // callback function for serialport list event
  serial.on('data', serialEvent);// callback for new data coming in
	serial.list();                         // list the serial ports
	serial.open("/dev/cu.usbmodem14211"); // open a port
  
  createCanvas(320, 240);
  pixelDensity(1);
  video = createCapture(options);
  video.size(width,height);
  // The above function actually makes a separate video

 // element on the page.  The line below hides it since we are
  // drawing the video to the canvas
  video.hide();

  // Start off tracking for red
  //trackColor = [255, 0, 0];
  
   prevFrame = createImage(video.width, video.height, RGB);
}

function draw() {
  // Draw the video
  image(video,0,0);

  // We are going to look at the video's pixels
  video.loadPixels();
  prevFrame.loadPixels();
	//threshold = map(mouseX,0,width,0,100);
  // XY coordinate of closest color
  
  var count = 0;
  var avgX= 0;
  var avgY= 0;

  for (var y = 0; y < video.height; y++ ) {
    for (var x = 0; x < video.width; x++ ) {
      var loc = (x + y * video.width) * 4;
      // The functions red(), green(), and blue() pull out the three color components from a pixel.
      var r1 = prevFrame.pixels[loc   ]; 
      var g1 = prevFrame.pixels[loc + 1];
      var b1 = prevFrame.pixels[loc + 2];

      // Step 3, what is the current color
      var r2 = video.pixels[loc   ]; 
      var g2 = video.pixels[loc + 1];
      var b2 = video.pixels[loc + 2];
      
      // Using euclidean distance to compare colors
      var d = distSq(r1, g1, b1, r2, g2, b2); // We are using the dist( ) function to compare the current color with the color we are tracking.

      // If current color is more similar to tracked color than
      // closest color, save current location and current difference
      
      if (d > threshold*threshold) {
   		   stroke(255);
   		   strokeWeight(1);
   		   point(x,y);
   		   avgX+=x;
   		   //avgY+=y;
   		   count++; 
      }
    }
  }

  // We only consider the color found if its color distance is less than 10. 
  // This threshold of 10 is arbitrary and you can adjust this number depending on how accurate you require the tracking to be.
  if (count >600) { 
    motionX= avgX/count;
    motionY= avgY/count;
    // Draw a circle at the tracked pixel
  }
   lerpX = lerp(lerpX, motionX, 0.5);
   //lerpY = lerp(lerpY, motionY, 0.5);
  fill(255,0,255);
  strokeWeight(2.0);
  stroke(0);
  ellipse(lerpX, 120, 30, 30);


  var op = int(map(lerpX,0,320,0,18))*10;

  console.log(op);

	if(op!=oldposition){  
serial.write(180-op);
	oldposition = op;
}
  if (video.canvas) {
    prevFrame.copy(video, 0, 0, video.width, video.height, 0, 0, video.width, video.height); // Before we read the new frame, we always save the previous frame for comparison!
  }

}//end draw



function distSq(x1,y1,z1,x2,y2,z2){
	var d = (x2-x1)*(x2-x1)+(y2-y1)*(y2-y1)+(z2-z1)*(z2-z1);

 return d;
}


function gotSources(sources) {
  for (var i = 0; i !== sources.length; ++i) {
    if (sources[i].kind === 'audio') {
      console.log('audio: '+sources[i].label+' ID: '+sources[i].id);
    } else if (sources[i].kind === 'video') {
      console.log('video: '+sources[i].label+' ID: '+sources[i].id);
    } else {
      console.log('Some other kind of source: ', sources[i]);
    }
  }
}

function printList(portList) {
 for (var i = 0; i < portList.length; i++) {
	// Display the list the console:
 	println(i + " " + portList[i]);
 }
}

function serialEvent() {
	var inString = serial.readLine();
	if (inString.length > 0) {
	  inString = inString.trim();
    if(Number(inString/3)>sendorvalue)
		sensorValue = Number(inString/3);
   // println(sensorValue);
	}
}

function keyPressed() {
 if (key >=0 && key <=9) { // if the user presses 0 through 9
 outByte = byte(key * 25); // map the key to a range from 0 to 225

  console.log(outByte);
 }
 serial.write(outByte); // send it out the serial port
}