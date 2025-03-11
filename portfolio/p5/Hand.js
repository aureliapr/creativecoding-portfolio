/*
 * 👋 Hello! This is an ml5.js example made and shared with ❤️.
 * Learn more about the ml5.js project: https://ml5js.org/
 */

let handPose;
let video;
let hands = [];
let connections;
let hearts = [];
let fireworks = [];
let plane = {
  x: 50, // Start from top left corner
  y: 50,
  speed: 1,
  active: false, // Initially, the plane is inactive
  targetX: -100,
  targetY: -100,
  gestureActive: false, // Track if the gesture is currently being detected
  gestureWasActive: false // Track if the gesture was previously active
};

// Add car object
let car = {
  x: -100, // Initially off-screen
  y: -100,
  speed: 5,
  active: false,
  startX: 0,
  gestureActive: false,
  gestureWasActive: false // Track if the gesture was previously active
};

function preload() {
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  handPose.detectStart(video, gotHands);
  connections = handPose.getConnections();
}

function draw() {
  image(video, 0, 0, width, height);

  // Draw hand connections
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    for (let j = 0; j < connections.length; j++) {
      let pointAIndex = connections[j][0];
      let pointBIndex = connections[j][1];
      let pointA = hand.keypoints[pointAIndex];
      let pointB = hand.keypoints[pointBIndex];
      stroke(255, 0, 0);
      strokeWeight(2);
      line(pointA.x, pointA.y, pointB.x, pointB.y);
    }
  }

  // Draw hand keypoints
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    for (let j = 0; j < hand.keypoints.length; j++) {
      let keypoint = hand.keypoints[j];
      fill(0, 255, 0);
      noStroke();
      circle(keypoint.x, keypoint.y, 10);
    }
  }

  detectHeartGesture();
  detectRockGesture();
  detectUpwardSlopeGesture();
  detectFlatLeftHandGesture(); // Add new gesture detection
  updateHearts();
  updateFireworks();
  
  // If the plane is active, update its position
  if (plane.active) {
    updatePlanePosition();
  }
  
  // If the car is active, update its position
  if (car.active) {
    updateCarPosition();
  }
}

function gotHands(results) {
  hands = results;
}

function detectHeartGesture() {
  if (hands.length < 2) return;

  let hand1 = hands[0].keypoints;
  let hand2 = hands[1].keypoints;

  let indexTip1 = hand1[8];
  let indexTip2 = hand2[8];
  let thumbTip1 = hand1[4];
  let thumbTip2 = hand2[4];
  let middleTip1 = hand1[12];
  let middleTip2 = hand2[12];
  let ringTip1 = hand1[16];
  let ringTip2 = hand2[16];

  let indexDist = dist(indexTip1.x, indexTip1.y, indexTip2.x, indexTip2.y);
  let thumbDist = dist(thumbTip1.x, thumbTip1.y, thumbTip2.x, thumbTip2.y);

  let middleArch = middleTip1.y > indexTip1.y && middleTip2.y > indexTip2.y;
  let ringArch = ringTip1.y > middleTip1.y && ringTip2.y > middleTip2.y;

  if (indexDist < 20 && thumbDist < 20 && middleArch && ringArch) {
    let centerX = (indexTip1.x + indexTip2.x) / 2;
    let centerY = (indexTip1.y + thumbTip1.y) / 2;
    hearts.push({ x: centerX, y: centerY, size: 24, speed: 0.5, time: millis() });
  }
}

function detectRockGesture() {
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i].keypoints;
    let indexTip = hand[8];
    let pinkyTip = hand[20];
    let middleTip = hand[12];
    let ringTip = hand[16];
    let thumbTip = hand[4];
    let wrist = hand[0];
    let middleKnuckle = hand[9];
    
    let middleBent = middleTip.y > hand[10].y;
    let ringBent = ringTip.y > hand[14].y;
    let indexExtended = indexTip.y < hand[6].y;
    let pinkyExtended = pinkyTip.y < hand[18].y;
    let thumbOut = thumbTip.x < hand[3].x;
    let palmFacingOut = wrist.x < middleKnuckle.x;
    
    if (indexExtended && pinkyExtended && middleBent && ringBent && thumbOut && palmFacingOut) {
      fireworks.push({ x: random(width), y: random(height), size: 10, time: millis(), colors: [random(255), random(255), random(255)] });
    }
  }
}

// New function to detect flat left hand gesture
function detectFlatLeftHandGesture() {
  if (hands.length < 1) {
    // No hands detected, reset the gesture active flag
    car.gestureActive = false;
    return;
  }
  
  // Check each hand
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i].keypoints;
    
    // Check if this is a left hand
    // For left hand, the thumb should be on the right side of the palm/wrist
    let wrist = hand[0];
    let thumb = hand[4];
    let isLeftHand = thumb.x > wrist.x;
    
    if (!isLeftHand) continue; // Skip if not left hand
    
    // Get key points for slope calculations
    let thumbTip = hand[4];
    
    let indexKnuckle = hand[5];
    let indexMiddle = hand[6];
    let indexTip = hand[8];
    
    let middleKnuckle = hand[9];
    let middleMiddle = hand[10];
    let middleTip = hand[12];
    
    let ringKnuckle = hand[13];
    let ringMiddle = hand[14];
    let ringTip = hand[16];
    
    let pinkyKnuckle = hand[17];
    let pinkyMiddle = hand[18];
    let pinkyTip = hand[20];
    
    // Calculate slopes for each finger (knuckle to tip)
    // Slope close to 0 means the finger is horizontal (flat hand vertical)
    // Check for division by zero to avoid NaN
    let indexKnuckleToTipSlope = (indexTip.x !== indexKnuckle.x) ? 
      Math.abs((indexTip.y - indexKnuckle.y) / (indexTip.x - indexKnuckle.x)) : Infinity;
    
    let middleKnuckleToTipSlope = (middleTip.x !== middleKnuckle.x) ? 
      Math.abs((middleTip.y - middleKnuckle.y) / (middleTip.x - middleKnuckle.x)) : Infinity;
    
    let ringKnuckleToTipSlope = (ringTip.x !== ringKnuckle.x) ? 
      Math.abs((ringTip.y - ringKnuckle.y) / (ringTip.x - ringKnuckle.x)) : Infinity;
    
    let pinkyKnuckleToTipSlope = (pinkyTip.x !== pinkyKnuckle.x) ? 
      Math.abs((pinkyTip.y - pinkyKnuckle.y) / (pinkyTip.x - pinkyKnuckle.x)) : Infinity;
    
    // Calculate slopes for finger segments
    let indexBaseToMiddleSlope = (indexMiddle.x !== indexKnuckle.x) ? 
      Math.abs((indexMiddle.y - indexKnuckle.y) / (indexMiddle.x - indexKnuckle.x)) : Infinity;
    
    let indexMiddleToTipSlope = (indexTip.x !== indexMiddle.x) ? 
      Math.abs((indexTip.y - indexMiddle.y) / (indexTip.x - indexMiddle.x)) : Infinity;
    
    let middleBaseToMiddleSlope = (middleMiddle.x !== middleKnuckle.x) ? 
      Math.abs((middleMiddle.y - middleKnuckle.y) / (middleMiddle.x - middleKnuckle.x)) : Infinity;
    
    let middleMiddleToTipSlope = (middleTip.x !== middleMiddle.x) ? 
      Math.abs((middleTip.y - middleMiddle.y) / (middleTip.x - middleMiddle.x)) : Infinity;
    
    // Check if slopes are within the range of 0 to 0.15 (nearly horizontal fingers)
    let isFlat = 
      indexKnuckleToTipSlope >= 0 && indexKnuckleToTipSlope <= 0.15 &&
      middleKnuckleToTipSlope >= 0 && middleKnuckleToTipSlope <= 0.15 &&
      ringKnuckleToTipSlope >= 0 && ringKnuckleToTipSlope <= 0.15 &&
      pinkyKnuckleToTipSlope >= 0 && pinkyKnuckleToTipSlope <= 0.15 &&
      indexBaseToMiddleSlope >= 0 && indexBaseToMiddleSlope <= 0.15 &&
      indexMiddleToTipSlope >= 0 && indexMiddleToTipSlope <= 0.15 &&
      middleBaseToMiddleSlope >= 0 && middleBaseToMiddleSlope <= 0.15 &&
      middleMiddleToTipSlope >= 0 && middleMiddleToTipSlope <= 0.15;
    
    // Additional check for vertical alignment
    // Vertical hand means wrist and knuckles should be approximately aligned vertically
    let knucklesXDiff = Math.max(
      Math.abs(indexKnuckle.x - middleKnuckle.x),
      Math.abs(middleKnuckle.x - ringKnuckle.x),
      Math.abs(ringKnuckle.x - pinkyKnuckle.x)
    );
    
    let isVerticallyAligned = knucklesXDiff < 20; // Small X difference means vertical alignment
    
    if (isFlat && isVerticallyAligned) {
      // Gesture detected
      if (!car.gestureActive && !car.active && !car.gestureWasActive) {
        // Start car animation from middle finger tip instead of wrist
        car.startX = middleTip.x;
        car.x = middleTip.x;
        car.y = middleTip.y;
        car.active = true;
        // Mark that we've used this gesture
        car.gestureWasActive = true;
      }
      car.gestureActive = true;
      return;
    }
  }
  
  // No gesture detected
  car.gestureActive = false;
  
  // If the gesture was active before but isn't now, and car is not active, reset gestureWasActive
  // This allows the gesture to work again next time
  if (car.gestureWasActive && !car.active) {
    car.gestureWasActive = false;
  }
}

function updateCarPosition() {
  // Move the car to the left
  car.x -= car.speed;
  
  // Draw the car emoji
  textSize(48);
  textAlign(CENTER, CENTER);
  text("🚗", car.x, car.y);
  
  // Reset car when it goes off screen
  if (car.x < -50) {
    car.active = false;
  }
}

function detectUpwardSlopeGesture() {
  if (hands.length < 1) {
    // No hands detected, reset the gesture active flag
    plane.gestureActive = false;
    return;
  }

  let hand = hands[0].keypoints;

  let wrist = hand[0];
  let thumbTip = hand[4];
  
  let indexKnuckle = hand[5];
  let indexTip = hand[8];
  
  let middleKnuckle = hand[9];
  let middleTip = hand[12];
  
  let ringKnuckle = hand[13];
  let ringTip = hand[16];
  
  let pinkyKnuckle = hand[17];
  let pinkyTip = hand[20];

  // Check for division by zero to avoid NaN
  let wristToThumbSlope = (thumbTip.x !== wrist.x) ? (thumbTip.y - wrist.y) / (thumbTip.x - wrist.x) : 0;
  let wristToIndexSlope = (indexTip.x !== wrist.x) ? (indexTip.y - wrist.y) / (indexTip.x - wrist.x) : 0;
  let wristToMiddleSlope = (middleTip.x !== wrist.x) ? (middleTip.y - wrist.y) / (middleTip.x - wrist.x) : 0;
  let wristToRingSlope = (ringTip.x !== wrist.x) ? (ringTip.y - wrist.y) / (ringTip.x - wrist.x) : 0;
  let wristToPinkySlope = (pinkyTip.x !== wrist.x) ? (pinkyTip.y - wrist.y) / (pinkyTip.x - wrist.x) : 0;

  let indexKnuckleToTipSlope = (indexTip.x !== indexKnuckle.x) ? (indexTip.y - indexKnuckle.y) / (indexTip.x - indexKnuckle.x) : 0;
  let middleKnuckleToTipSlope = (middleTip.x !== middleKnuckle.x) ? (middleTip.y - middleKnuckle.y) / (middleTip.x - middleKnuckle.x) : 0;
  let ringKnuckleToTipSlope = (ringTip.x !== ringKnuckle.x) ? (ringTip.y - ringKnuckle.y) / (ringTip.x - ringKnuckle.x) : 0;
  let pinkyKnuckleToTipSlope = (pinkyTip.x !== pinkyKnuckle.x) ? (pinkyTip.y - pinkyKnuckle.y) / (pinkyTip.x - pinkyKnuckle.x) : 0;

  // Check if gesture is detected
  let gestureDetected = 
    wristToThumbSlope > 0.3 && wristToThumbSlope < 1 &&
    wristToIndexSlope > 0.3 && wristToIndexSlope < 1 &&
    wristToMiddleSlope > 0.3 && wristToMiddleSlope < 1 &&
    wristToRingSlope > 0.3 && wristToRingSlope < 1 &&
    wristToPinkySlope > 0.3 && wristToPinkySlope < 1 &&
    indexKnuckleToTipSlope > 0.3 && indexKnuckleToTipSlope < 1 &&
    middleKnuckleToTipSlope > 0.3 && middleKnuckleToTipSlope < 1 &&
    ringKnuckleToTipSlope > 0.3 && ringKnuckleToTipSlope < 1 &&
    pinkyKnuckleToTipSlope > 0.3 && pinkyKnuckleToTipSlope < 1;

  // Update target position when gesture is detected
  if (gestureDetected) {
    plane.targetX = wrist.x;
    plane.targetY = wrist.y;
    
    // Only activate the plane if:
    // 1. The gesture wasn't active before (just detected)
    // 2. The plane isn't currently active (not in animation)
    // 3. We haven't already activated this gesture (gestureWasActive is false)
    if (!plane.gestureActive && !plane.active && !plane.gestureWasActive) {
      // Reset plane to top left corner
      plane.x = 50;
      plane.y = 50;
      plane.active = true;
      // Mark that we've used this gesture
      plane.gestureWasActive = true;
    }
    
    // Mark that the gesture is currently active
    plane.gestureActive = true;
  } else {
    // Gesture is no longer detected
    plane.gestureActive = false;
    
    // If the gesture was active before but isn't now, reset gestureWasActive
    // This allows the gesture to work again next time
    if (plane.gestureWasActive && !plane.active) {
      plane.gestureWasActive = false;
    }
  }
}

function updateHearts() {
  let currentTime = millis();
  for (let i = hearts.length - 1; i >= 0; i--) {
    let heart = hearts[i];
    if (currentTime - heart.time > 2000) {
      hearts.splice(i, 1);
      continue;
    }
    fill(255, 0, 0);
    textSize(heart.size);
    text("❤️", heart.x, heart.y);
    heart.y -= heart.speed; // Move heart upwards
    heart.size += 0.1; // Slightly increase size
  }
}

function updateFireworks() {
  let currentTime = millis();
  for (let i = fireworks.length - 1; i >= 0; i--) {
    let firework = fireworks[i];
    if (currentTime - firework.time > 1000) {
      fireworks.splice(i, 1);
      continue;
    }
    fill(firework.colors[0], firework.colors[1], firework.colors[2]);
    noStroke();
    ellipse(firework.x, firework.y, firework.size);
    firework.size += 2;
  }
}

function updatePlanePosition() {
  // Update the plane's position gradually towards the wrist
  plane.x += (plane.targetX - plane.x) * 0.05;
  plane.y += (plane.targetY - plane.y) * 0.05;

  // Draw the plane (using the emoji) at the current position
  textSize(48);
  textAlign(CENTER, CENTER);
  text("✈️", plane.x, plane.y);

  // Stop animation when the plane reaches the target (wrist)
  if (dist(plane.x, plane.y, plane.targetX, plane.targetY) < 10) {
    plane.active = false; // Reset plane status when animation ends
    
    // Optional: Add a small visualization to show the plane has "landed"
    fill(100, 255, 100, 150);
    noStroke();
    circle(plane.x, plane.y, 30);
    
    // Reset gestureWasActive if the animation is complete and gesture is no longer active
    if (!plane.gestureActive) {
      plane.gestureWasActive = false;
    }
  }
}


// Function to handle camera access
function setupCamera() {
  // Create a video element for the camera
  const video = document.createElement('video');
  video.id = 'camera';
  video.autoplay = true;
  video.playsinline = true; // Important for iOS
  video.style.display = 'none'; // Hide the video element
  document.body.appendChild(video);
  
  // Request camera access with proper error handling
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user', // Use front camera on mobile devices
        width: { ideal: 640 },
        height: { ideal: 480 }
      },
      audio: false
    })
    .then(function(stream) {
      // Camera access granted
      video.srcObject = stream;
      console.log("Camera access granted");
      
      // If you're using ml5.handpose, initialize it after camera is ready
      video.onloadeddata = function() {
        if (window.initHandpose) {
          window.initHandpose(video);
        }
      };
    })
    .catch(function(error) {
      console.error("Camera access error:", error);
      // Show a helpful error message to the user
      const errorDiv = document.createElement('div');
      errorDiv.style.color = 'white';
      errorDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
      errorDiv.style.padding = '20px';
      errorDiv.style.position = 'absolute';
      errorDiv.style.top = '50%';
      errorDiv.style.left = '50%';
      errorDiv.style.transform = 'translate(-50%, -50%)';
      errorDiv.style.borderRadius = '10px';
      errorDiv.style.fontFamily = 'Arial, sans-serif';
      errorDiv.style.zIndex = '1000';
      
      if (error.name === 'NotAllowedError') {
        errorDiv.innerHTML = '<h3>Camera Access Denied</h3>' +
          '<p>Please allow camera access to use the hand gesture features.</p>' +
          '<p>You may need to reset permissions in your browser settings.</p>';
      } else if (error.name === 'NotFoundError') {
        errorDiv.innerHTML = '<h3>Camera Not Found</h3>' +
          '<p>This application requires a camera to detect hand gestures.</p>';
      } else {
        errorDiv.innerHTML = '<h3>Camera Error</h3>' +
          '<p>There was a problem accessing your camera.</p>' +
          '<p>Error: ' + error.message + '</p>';
      }
      
      document.body.appendChild(errorDiv);
    });
  } else {
    console.error("getUserMedia not supported in this browser");
    alert("Your browser doesn't support camera access needed for this feature.");
  }
  
  return video;
}

// Add function to initialize handpose after camera is ready
function initHandpose(video) {
  // This function should be implemented in your P5 sketch 
  // to initialize ml5.handpose with the video element
  console.log("Initializing handpose with video element");
  
  // Example implementation (modify according to your existing code):
  // handpose = ml5.handpose(video, modelReady);
}

// Make functions available globally
window.setupCamera = setupCamera;
window.initHandpose = initHandpose;

// Call setupCamera when the page loads
document.addEventListener('DOMContentLoaded', function() {
  setupCamera();
});