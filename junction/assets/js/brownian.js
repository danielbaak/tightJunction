var fieldDim = (100e-6)*400; // actual slide is 120 microns across at 400x magnification so 480 mum at 100x
var magFactor = 400; // 400 or 100

var box = document.getElementById('box');
var context = box.getContext('2d');
var particles = new Array();
var N = 100;
var rho = 1000;
var color = 'black';
var width = box.width;
var height = box.height;
var running = false;
var animate;
var v0 = 1e-3;
var v = 1e-1;

var kb = 1.381e-23; // m^2 kg s^-2 K^-1
var T = 300; // K
var nu = 1e-3; // Pa s
var r = 0.5e-6; // m
var scale = width/(fieldDim/magFactor); // pixels/meter
var dt = 0.1; // seconds/timestep
var frameRate = 1/dt; // frames/second
var rPixels = r*scale;
var peclet;


// D = kb*T/(6*pi*nu*r) 
// <x^2> = 2*D*dt
// x is normally distributed so var(x) = <x^2> - <x>^2 and since <x> = 0, var(x) = <x^2>
// taking normally distributed random variables with zero mean and variance/std = 1 and multiplying by 
// sqrt(<x^2>) = sqrt(2*D*dt) will yield normally distributed random variables with mean zero and 
// variance equal to 2*D*dt
// so I must multiply by Math.sqrt(2*dt*kb*T/(6*Math.pi*nu*r));

var mfact = scale*Math.sqrt(2*dt*kb*T/(6*3.1415*nu*r));
// var mfact = 1;

main();

function main() {
	initParticles();
	loop();



	document.getElementById('reset').onclick = function() // reset the simulation
	{
		if (running) {
			run = clearInterval(animate);
			running = false;
		}

		initParticles();
		loop();
	}
	document.getElementById('pause').onclick = function() // Detecting clicking on pause button.
	{
	  if(running)
	  {
	    run = clearInterval(animate); // Stop simulation.
	    running = false;
    }
  }


	document.getElementById('play').onclick = function()
	{
	  animate = setInterval('loop()',1000/frameRate); 
	  running = true;
  }

}

function loop() {

	render();
	iterate();

}

function iterate()
{
	for (var i = 0; i < N; i++)
	{
	  var step = boxMuller();

	  particles[i].x += mfact*step.dx; 
	  if (particles[i].x > width) {
		  particles[i].x = particles[i].x - width;
	  }
	  if (particles[i].x < 0) {
		  particles[i].x = particles[i].x + width;
	  }
	  particles[i].y += mfact*step.dy;
	  if (particles[i].y > height) {
		  particles[i].y = particles[i].y - height;
	  }
	  if (particles[i].y < 0) {
		  particles[i].y = particles[i].y + height;
	  }


  }
}


function sphere(rho, x, y, vx, vy, r, color) {
	this.rho = rho; // density
	this.x = x; // x position
	this.y = y; // y position
	this.vx = vx; // x velocity
	this.vy = vy; // y velocity
	this.r = rPixels; // radius
	this.fill = color ? color : 'white'; // color of sphere - defaults to white
}

function render()
{
	context.clearRect(0, 0, width, height);

	for (var i = 0; i < N; i++)
	{
	  context.beginPath();
	  var radius = particles[i].r;
	  context.arc(particles[i].x, particles[i].y, radius, 0, 2*Math.PI, false);
	  context.fillStyle = particles[i].fill;
	  context.fill();
  }
}

function initParticles()
{

	getParams();

	var Width = width - 2*rPixels;
	var Height = height - 2*rPixels
		for (var i = 0; i < N; i++)
		{
	    particles[i] = new sphere(rho, Math.random()*Width + rPixels, Math.random() * Height + rPixels, v0*(Math.random() - 0.5), v0*(Math.random() - 0.5), r, color);
    }
}


// generate normally distributed random numbers
// using the polar form of the Box-Muller transform
function boxMuller() {
	var x, y, rr

		do {
			x = 2*Math.random()-1;
			y = 2*Math.random()-1;
			rr = x*x+y*y;
		} while(rr >= 1 || rr == 0);

	var f = Math.sqrt(-2*Math.log(rr)/rr);

	return {
dx: x*f, dy: y*f
	}
}

function getParams(){

	r = (document.getElementById('radius').value)*1e-6;
	N = document.getElementById('N').value;
	T = document.getElementById('T').value;

	for (var i = 0; i < document.magnification.mag.length; i++) {

		if (document.magnification.mag[i].checked) {
			if (document.magnification.mag[i].value == "100") {
				magFactor = 100;
			} else { 
				magFactor = 400;
			}
		}
	}


	scale = width/(fieldDim/magFactor); // pixels/meter
	rPixels = r*scale;
	mfact = scale*Math.sqrt(2*dt*kb*T/(6*3.1415*nu*r));

}	
