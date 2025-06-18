let emotionColors = {
  Joy: [255, 192, 0],
  Sadness: [0, 71, 171],
  Anger: [210, 4, 45],
  Love: [250, 160, 160],
  Calm: [167, 199, 231]
};

let emotionCounts = {
  Joy: 0,
  Sadness: 0,
  Anger: 0,
  Love: 0,
  Calm: 0
};

let totalEmotions = 0;

let songs = ["time.mp3", "above.mp3", "back.mp3"];
let index = 0;
let song;
let fft;
let button;
let bgImage;

function preload() {
  song = loadSound(songs[index]);
  bgImage = loadImage("background.jpg");
}

function setup() {
  createCanvas (windowWidth, windowHeight);
  setupSocket();

  button = createButton("play");
  button.position(10, 10);
  button.mousePressed(togglePlaying);

  fft = new p5.FFT(0.9, 512);
  angleMode(DEGREES);
}

function draw() {
  image(bgImage, 0, 0, width, height);

  let spectrum = fft.analyze(1024, 1024);
  strokeWeight(1);
  noFill();

  let gridSize = 6;
  let cellSize = width / gridSize;

  for (let gx = 0; gx < gridSize; gx++) {
    for (let gy = 0; gy < gridSize; gy++) {
      push();
      let centerX = gx * cellSize + cellSize / 2;
      let centerY = gy * cellSize + cellSize / 2;
      translate(centerX, centerY);

      beginShape();
      for (let i = 0; i < spectrum.length; i++) {
        let angle = map(i, 0, spectrum.length, 0, 360);
        let amp = spectrum[i];
        let r = map(amp, 0, 512, 5, 500);
        let x = r * cos(angle);
        let y = r * sin(angle);
        vertex(x, y);

        if (i % 2 === 0) {
          let chosenColor = [255, 255, 255];
          let rand = Math.random();
          let acc = 0;

          if (totalEmotions > 0) {
            for (let emotion in emotionCounts) {
              acc += emotionCounts[emotion] / totalEmotions;
              if (rand <= acc) {
                chosenColor = emotionColors[emotion];
                break;
              }
            }
          }

          stroke(...chosenColor, 150);
          line(0, 0, x, y);
        }
      }
      endShape(CLOSE);
      pop();
    }
  }
}

function togglePlaying() {
  if (!song.isPlaying()) {
    song.play();
    button.html("pause");
  } else {
    song.pause();
    button.html("play");
  }
}

function keyPressed() {
  if (key === "c") {
    index = (index + 1) % songs.length;
    if (song.isPlaying()) {
      song.stop();
    }

    song = loadSound(songs[index], () => {
      song.play();
      button.html("pause");
    });
  }
}

function setupSocket() {
  const socket = io();
  socket.on("emotion", (emotion) => {
    if (emotionCounts.hasOwnProperty(emotion)) {
      emotionCounts[emotion]++;
      totalEmotions++;
    }
  });
}
