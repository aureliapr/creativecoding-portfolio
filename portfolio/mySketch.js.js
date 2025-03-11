// Simple portfolio with navigation between screens and particle system

// Track the current state/screen
let state = "main";
// Particles array for falling emojis
let particles = [];
// Number of particles to display
let numParticles = 60;
// Track which button is being hovered
let hoveredButton = null;
// Font variables
let sciFiFont;

// Preload fonts
function preload() {
  // Load a sci-fi style font - you can replace with other sci-fi fonts
  sciFiFont = loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textFont(sciFiFont); // Set the sci-fi font as default
  
  // Initialize particles
  for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle(random(width), random(-height, 0)));
  }
}

function draw() {
  // Set background based on current state
  if (state === "main") {
    background(10, 10, 15); // Dark background for main page
    
    // Update and display particles ONLY on main screen
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].display();
      
      // Reset particles that go off screen
      if (particles[i].isOffScreen()) {
        particles[i] = new Particle(random(width), -50);
      }
    }
  } else {
    background(20, 25, 35); // Darker background for feature pages that matches the sci-fi theme
  }
  
  // Draw state-specific content (after particles for better visibility)
  if (state === "main") {
    drawMainScreen();
  } else if (state === "feature1") {
    drawFeature1();
  } else if (state === "feature2") {
    drawFeature2();
  } else if (state === "feature3") {
    drawFeature3();
  } else if (state === "credits") {
    drawCredits();
  }
  
  // Always draw navigation buttons (after everything to be on top)
  drawNavButtons();
  
  // Check for hover
  checkButtonHover();
}

// ------------- Navigation Buttons (Persistent at Top) -------------

function getNavButtons() {
  let btnData = [
    { label: "Home", state: "main", w: 160, h: 50 },
    { label: "Inform7", state: "feature1", w: 160, h: 50 },
    { label: "ml5", state: "feature2", w: 160, h: 50 },
    { label: "Tracery", state: "feature3", w: 160, h: 50 },
    { label: "Credits", state: "credits", w: 160, h: 50 }
  ];
  
  let spacing = 20;
  let totalWidth = btnData.reduce((acc, btn) => acc + btn.w, 0) + spacing * (btnData.length - 1);
  let startX = (width - totalWidth) / 2;
  let y = 40; // fixed vertical position at top
  
  let navButtons = [];
  let currentX = startX;
  
  for (let btn of btnData) {
    let btnObj = { 
      label: btn.label, 
      state: btn.state, 
      w: btn.w, 
      h: btn.h, 
      x: currentX + btn.w / 2, 
      y: y 
    };
    navButtons.push(btnObj);
    currentX += btn.w + spacing;
  }
  
  return navButtons;
}

function drawNavButtons() {
  let navButtons = getNavButtons();
  rectMode(CENTER);
  
  for (let btn of navButtons) {
    // Calculate button size (expand if hovered)
    let buttonWidth = btn.w;
    let buttonHeight = btn.h;
    
    // Apply scaling effect if this button is being hovered
    if (hoveredButton === btn.state) {
      buttonWidth = btn.w * 1.1; // Scale width by 10%
      buttonHeight = btn.h * 1.1; // Scale height by 10%
    }
    
    // Create silver metallic gradient effect
    if (btn.state === state) {
      // Highlighted silver metallic for current state's button
      drawMetallicButton(btn.x, btn.y, buttonWidth, buttonHeight, true, hoveredButton === btn.state);
    } else {
      // Normal silver metallic for other buttons
      drawMetallicButton(btn.x, btn.y, buttonWidth, buttonHeight, false, hoveredButton === btn.state);
    }
    
    // Button text with sci-fi glow effect
    // Glow effect
    if (hoveredButton === btn.state || btn.state === state) {
      drawingContext.shadowBlur = 10;
      drawingContext.shadowColor = "rgba(0, 200, 255, 0.5)";
    }
    
    fill(220, 230, 255); // Bright blue-white text for sci-fi feel
    textSize(hoveredButton === btn.state ? 22 : 20); // Larger text when hovered
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(btn.label.toUpperCase(), btn.x, btn.y); // Uppercase for sci-fi look
    
    // Reset shadow
    drawingContext.shadowBlur = 0;
  }
}

// Function to check if mouse is hovering over any button
function checkButtonHover() {
  let navButtons = getNavButtons();
  hoveredButton = null; // Reset hover state
  
  for (let btn of navButtons) {
    if (
      mouseX > btn.x - btn.w / 2 &&
      mouseX < btn.x + btn.w / 2 &&
      mouseY > btn.y - btn.h / 2 &&
      mouseY < btn.y + btn.h / 2
    ) {
      hoveredButton = btn.state;
      cursor(HAND); // Change cursor to hand when hovering
      return;
    }
  }
  cursor(ARROW); // Reset cursor when not hovering
}

// Function to draw metallic silver buttons
function drawMetallicButton(x, y, w, h, isActive, isHovered) {
  push();
  // Create darker metallic gradient effect with a sci-fi feel
  const gradient = drawingContext.createLinearGradient(x - w/2, y - h/2, x + w/2, y + h/2);
  
  if (isActive) {
    // Darker metallic for active button with blue sci-fi tint
    gradient.addColorStop(0, '#303540');
    gradient.addColorStop(0.35, '#505A6B');
    gradient.addColorStop(0.5, '#667088');
    gradient.addColorStop(0.65, '#505A6B');
    gradient.addColorStop(1, '#303540');
  } else if (isHovered) {
    // Slightly lighter metallic for hovered buttons
    gradient.addColorStop(0, '#404658');
    gradient.addColorStop(0.35, '#5C6980');
    gradient.addColorStop(0.5, '#7A8CA8');
    gradient.addColorStop(0.65, '#5C6980');
    gradient.addColorStop(1, '#404658');
  } else {
    // Standard dark metallic for inactive buttons
    gradient.addColorStop(0, '#252A35');
    gradient.addColorStop(0.35, '#384050');
    gradient.addColorStop(0.5, '#4A5269');
    gradient.addColorStop(0.65, '#384050');
    gradient.addColorStop(1, '#252A35');
  }
  
  drawingContext.fillStyle = gradient;
  
  // Add glowing border to enhance the sci-fi look
  if (isActive) {
    strokeWeight(2);
    stroke(80, 200, 230);
    drawingContext.shadowBlur = 8;
    drawingContext.shadowColor = "rgba(0, 180, 255, 0.6)";
  } else if (isHovered) {
    strokeWeight(2);
    stroke(60, 160, 200);
    drawingContext.shadowBlur = 5;
    drawingContext.shadowColor = "rgba(0, 160, 230, 0.4)";
  } else {
    strokeWeight(1);
    stroke(40, 100, 140);
  }
  
  // Draw the rounded rectangle button
  rect(x, y, w, h, 10);
  pop();
}

// ------------- State-specific Drawing Functions -------------

function drawMainScreen() {
  // Set up the sci-fi glow for text
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = "rgba(0, 200, 255, 0.7)";
  
  // Portfolio title with space theme
  textSize(60);
  textStyle(BOLD);
  fill(210, 240, 255); // Bright blue-white
  text("AURELIA PETERSON RAJALINGAM", width / 2, height / 3);
  
  // Reset and set different glow for subtitle
  drawingContext.shadowBlur = 8;
  drawingContext.shadowColor = "rgba(80, 180, 255, 0.5)";
  
  // Subtitle
  textSize(24);
  textStyle(NORMAL);
  fill(180, 220, 255);
  text("WELCOME TO MY INTERACTIVE PORTFOLIO", width / 2, height / 3 + 80);
  
  // Instructions with less glow
  drawingContext.shadowBlur = 3;
  drawingContext.shadowColor = "rgba(60, 160, 255, 0.3)";
  textSize(18);
  fill(160, 200, 230);
  text("CLICK ON THE NAVIGATION BUTTONS ABOVE TO EXPLORE DIFFERENT PROJECTS", 
       width / 2, height / 3 + 130);
  
  // Reset shadow for other elements
  drawingContext.shadowBlur = 0;

  if (window.gameIframe) {
    window.gameIframe.style.display = 'none';
  }

  if (window.p5Iframe) {
    window.p5Iframe.style.display = 'none';
  }
  if (window.textGenIframe) {
    window.textGenIframe.style.display = 'none';
  }
}

function drawFeature1() {

  if (window.p5Iframe) {
    window.p5Iframe.style.display = 'none';
  }
  if (window.textGenIframe) {
    window.textGenIframe.style.display = 'none';
  }

  // Sci-fi text with glow
  drawingContext.shadowBlur = 12;
  drawingContext.shadowColor = "rgba(0, 200, 255, 0.6)";


   // Only show title and iframe if we haven't created the iframe yet
   if (!window.gameIframe) {
    // Create and position the iframe
    window.gameIframe = document.createElement('iframe');
    window.gameIframe.src = 'First Project.materials/Release/source.html';
    window.gameIframe.style.position = 'absolute';
    window.gameIframe.style.top = '100px'; // Leave space for nav buttons
    window.gameIframe.style.left = '0';
    window.gameIframe.style.width = '100%';
    window.gameIframe.style.height = 'calc(100% - 100px)'; // Subtract nav space
    window.gameIframe.style.border = 'none';
    document.body.appendChild(window.gameIframe);
  }
  
  // Make sure iframe is visible
  if (window.gameIframe) {
    window.gameIframe.style.display = 'block';
  }
       
  drawingContext.shadowBlur = 0;
  
 
}

function drawFeature2() {
  if (window.gameIframe) {
    window.gameIframe.style.display = 'none';
  }

  // Create and show Feature2 iframe if it doesn't exist yet
  if (!window.p5Iframe) {
    // Create the iframe
    window.p5Iframe = document.createElement('iframe');
    window.p5Iframe.src = 'P5/index.html';
    
    // Position in center of screen with fixed width/height
    const iframeWidth = '640px';
    const iframeHeight = '480px';
    window.p5Iframe.style.position = 'absolute';
    window.p5Iframe.style.width = iframeWidth;
    window.p5Iframe.style.height = iframeHeight;
    window.p5Iframe.style.left = '50%';
    window.p5Iframe.style.top = '45%'; // Move up slightly to make room for text
    window.p5Iframe.style.transform = 'translate(-50%, -50%)';
    window.p5Iframe.style.marginTop = '0px'; // Adjust to ensure there's space below
    
    // Add glowing border that matches portfolio text
    window.p5Iframe.style.border = '4px solid rgba(0, 200, 255, 0.8)';
    window.p5Iframe.style.borderRadius = '10px'; // Rounded corners
    window.p5Iframe.style.boxShadow = '0 0 15px rgba(0, 200, 255, 0.7), 0 0 30px rgba(0, 160, 220, 0.4)';
    
    document.body.appendChild(window.p5Iframe);
    
    // Create instruction text as HTML element below the iframe
    window.p5Instructions = document.createElement('div');
    window.p5Instructions.innerHTML = `
      <div style="
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        font-family: 'Source Code Pro', monospace;
        color: rgb(210, 240, 255);
        width: 640px;
        top: calc(45% + ${parseInt(iframeHeight)/2}px + 20px);
        text-shadow: 0 0 10px rgba(0, 200, 255, 0.6), 0 0 20px rgba(0, 200, 255, 0.4);
      ">
        <p style="
          font-size: 22px;
          font-weight: bold;
          margin-bottom: 10px;
        ">HAND GESTURE CONTROLS</p>
        <p style="
          font-size: 16px;
          margin-bottom: 8px;
          color: rgb(180, 220, 255);
        ">TRY DIFFERENT GESTURES: HEART SHAPE, FLAT HAND, VICTORY SIGN</p>
        <p style="
          font-size: 16px;
          color: rgb(180, 220, 255);
        ">MOVE YOUR HAND AROUND TO INTERACT WITH THE ML5 HANDPOSE MODEL</p>
      </div>
    `;
    document.body.appendChild(window.p5Instructions);
  }
  
  // Make sure Feature2 iframe is visible
  if (window.p5Iframe) {
    window.p5Iframe.style.display = 'block';
  }
  // Make sure instructions are visible
  if (window.p5Instructions) {
    window.p5Instructions.style.display = 'block';
  }
  
  if (window.textGenIframe) {
    window.textGenIframe.style.display = 'none';
  }
}

 

function drawFeature3() {
  if (window.gameIframe) {
    window.gameIframe.style.display = 'none';
  }

  if (window.p5Iframe) {
    window.p5Iframe.style.display = 'none';
  }

  // Only create iframe if it doesn't exist yet
  if (!window.textGenIframe) {
    // Create and position the iframe
    window.textGenIframe = document.createElement('iframe');
    window.textGenIframe.src = 'text_gen/index.html';
    
    // Position to fill entire screen except nav area
    window.textGenIframe.style.position = 'absolute';
    window.textGenIframe.style.top = '100px'; // Leave space for nav buttons
    window.textGenIframe.style.left = '0';
    window.textGenIframe.style.width = '100%';
    window.textGenIframe.style.height = 'calc(100% - 100px)'; // Subtract nav space
    window.textGenIframe.style.border = 'none'; // Remove border entirely
    
    document.body.appendChild(window.textGenIframe);
  }
  
  // Make sure iframe is visible
  if (window.textGenIframe) {
    window.textGenIframe.style.display = 'block';
  }
}

function drawCredits() {
  // Sci-fi text with glow
  drawingContext.shadowBlur = 12;
  drawingContext.shadowColor = "rgba(0, 200, 255, 0.6)";
  
  textSize(48);
  textStyle(BOLD);
  fill(210, 240, 255);
  text("CREDITS", width / 2, height / 5);
  
  drawingContext.shadowBlur = 6;
  textSize(24);
  textStyle(NORMAL);
  fill(180, 220, 255);
  
  // Create credit sections with different spacing
  let startY = height / 3;
  let lineHeight = 40;
  
  // Developer section
  textSize(28);
  text("Inform7", width / 2, startY);
  textSize(22);
  text("Written with assistance from ChatGPT 4.0 mini, Claude 3.7 Sonnet", width / 2, startY + lineHeight);
  text("Iridium template modified using CoPilot Agent and Claude 3.5 Sonnet", width / 2, startY + lineHeight * 2);
  
  // Design section
  textSize(28);
  text("p5", width / 2, startY + lineHeight * 3);
  textSize(22);
  text("ml5 code based on HandPose model provided by ml5 team", width / 2, startY + lineHeight * 4);
  text("Edits done with Claude 3.7 Sonnet", width / 2, startY + lineHeight * 5);
  
  // Technology section
  textSize(28);
  text("Tracery", width / 2, startY + lineHeight * 6);
  textSize(22);
  text("Tracery generated code asissted with text nodes scraped from Arthur Conan Doyle", width / 2, startY + lineHeight * 7);
  text("bookshelf of Project Gutenberg using python code written by ChatGPT 4.0.", width / 2, startY + lineHeight * 8);

  drawingContext.shadowBlur = 0;

  if (window.gameIframe) {
    window.gameIframe.style.display = 'none';
  }

  if (window.p5Iframe) {
    window.p5Iframe.style.display = 'none';
  }

  if (window.textGenIframe) {
    window.textGenIframe.style.display = 'none';
  }
}

// ------------- Particle Class for Falling Emojis -------------

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = random(1, 2); // Increased base speed range
    this.emoji = this.getRandomEmoji();
    this.size = random(20, 50); // Slightly larger size range for more variety
    this.rotation = random(TWO_PI);
    this.rotSpeed = random(-0.03, 0.03); // Slightly faster rotation
    this.alpha = random(200, 255); // Higher minimum alpha for better visibility on dark background
  }
  
  getRandomEmoji() {
    // Collection of star and planet emojis
    let emojis = ["⭐", "🌟", "✨", "💫", "🪐", "🌍", "🌎", "🌏", "🌕", "🌙", "☄️"];
    return emojis[floor(random(emojis.length))];
  }
  
  update() {
    this.y += this.speed * 2; // Doubled speed for faster falling
    this.rotation += this.rotSpeed;
  }
  
  display() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    textSize(this.size);
    textAlign(CENTER, CENTER);
    textFont('Arial'); // Use default font for emojis to display properly
    text(this.emoji, 0, 0);
    pop();
  }
  
  isOffScreen() {
    return (this.y > height + this.size);
  }
}

// ------------- Mouse Interaction for Nav Buttons -------------

function mousePressed() {
  let navButtons = getNavButtons();
  for (let btn of navButtons) {
    if (
      mouseX > btn.x - btn.w / 2 &&
      mouseX < btn.x + btn.w / 2 &&
      mouseY > btn.y - btn.h / 2 &&
      mouseY < btn.y + btn.h / 2
    ) {
      state = btn.state;
      return;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // Reset some particles to ensure they cover the new window size
  for (let i = 0; i < particles.length; i++) {
    if (random() < 0.5) { // Only reset some of them for a more natural transition
      particles[i] = new Particle(random(width), random(-height, 0));
    }
  }
}