$(document).ready(function () {
  // ========================================== Variables ==========================================

  const soundBtn = $("#sound-btn");
  const pauseBtn = $("#pause-btn");
  const repeatBtn = $("#repeat-btn");
  const introPlayBtn = $("#intro-play-btn");
  const playAgainBtn = $("#play-again-btn");
  const mainMenuBtn = $("#main-menu-btn");
  const nextLevelBtn = $("#next-level-btn");

  const userCar = $("#car-1");
  const otherCar1 = $("#car-2");
  const otherCar2 = $("#car-3");

  const gameWidth = $(window).width();
  const gameHeight = $(window).height();
  const roadWidth = 490;
  const roadLeft = (gameWidth - roadWidth) / 2;

  let level = 1;
  let unlockedLevels = 1;
  let score = 0;
  let gameTime = 0;
  let gameRunning = false;

  let highestScore = [0, 0, 0, 0];

  let roadSpeed;
  let carSpeed;
  let scoreInterval;
  let gameDuration;
  let stars;
  let minCarSpacing;

  let moveRoadLoop;
  let gameTimeLoop;
  let updateScoreLoop;
  let moveInterval;
  let spawnInterval;

  // Car Movement Variables
  let moveLeft = false;
  let moveRight = false;
  let moveUp = false;
  let moveDown = false;

  const bgMusic = new Audio("/assets/audio/Bg-music.mp3");

  // ========================================== Initialization ==========================================

  bgMusic.loop = true;
  bgMusic.volume = 0;

  bgMusic
    .play()
    .then(() => {
      setTimeout(() => {
        bgMusic.volume = 0.5;
      }, 6000);
    })
    .catch(() => {
      $("#sound-btn i")
        .removeClass("fa-volume-high")
        .addClass("fa-volume-xmark");
      bgMusic.volume = 0.5;
      bgMusic.pause();
    });

  setTimeout(() => {
    $("#loading-screen").addClass("d-none");
    $("#speed-shifter-intro").removeClass("d-none");
    $("#sound-button-container").removeClass("d-none");
  }, 6000);

  initializeLevels();
  initializeCarPositions();

  // ========================================== Hover ==========================================

  soundBtn.hover(
    function () {
      // Mouse enter
      if (bgMusic.paused) {
        $("#sound-btn i")
          .removeClass("fa-volume-high")
          .addClass("fa-volume-xmark");
      } else {
        $("#sound-btn i")
          .removeClass("fa-volume-xmark")
          .addClass("fa-volume-high");
      }
    },
    function () {
      // Mouse leave
      if (bgMusic.paused) {
        $("#sound-btn i")
          .removeClass("fa-volume-high")
          .addClass("fa-volume-xmark");
      } else {
        $("#sound-btn i")
          .removeClass("fa-volume-xmark")
          .addClass("fa-volume-high");
      }
    }
  );

  pauseBtn.hover(
    function () {
      // Mouse enter
      if (gameRunning) {
        $("#pause-btn i").addClass("fa-pause");
      } else {
        $("#pause-btn i").addClass("fa-play");
      }
    },
    function () {
      // Mouse leave
      if (gameRunning) {
        $("#pause-btn i").removeClass("fa-pause");
      } else {
        $("#pause-btn i").removeClass("fa-play");
      }
    }
  );

  repeatBtn.hover(
    function () {
      // Mouse enter
      $("#repeat-btn i").addClass("fa-redo");
    },
    function () {
      // Mouse leave
      $("#repeat-btn i").removeClass("fa-redo");
    }
  );

  introPlayBtn.hover(
    function () {
      // Mouse enter
      $("#intro-play-btn i").addClass("fa-play");
    },
    function () {
      // Mouse leave
      $("#intro-play-btn i").removeClass("fa-play");
    }
  );

  $("#levels button").hover(
    function () {
      // Mouse enter
      if (!$(this).hasClass("active")) {
        if ($(this).val() <= unlockedLevels) {
          $(this).find("i").addClass("fa-unlock");
        } else {
          $(this).find("i").addClass("fa-lock").removeClass("fa-unlock");
        }
      }
    },
    function () {
      // Mouse leave
      if (!$(this).hasClass("active")) {
        if ($(this).val() <= unlockedLevels) {
          $(this).find("i").addClass("fa-unlock");
        } else {
          $(this).find("i").addClass("fa-lock").removeClass("fa-unlock");
        }
      }
    }
  );

  // ========================================== Events ==========================================

  soundBtn.click(function () {
    if (bgMusic.paused) {
      bgMusic.play();
      $("#sound-btn i")
        .removeClass("fa-volume-xmark")
        .addClass("fa-volume-high");
    } else {
      bgMusic.pause();
      $("#sound-btn i")
        .removeClass("fa-volume-high")
        .addClass("fa-volume-xmark");
    }
  });

  pauseBtn.click(function () {
    if (gameRunning) {
      clearInterval(moveRoadLoop);
      clearInterval(gameTimeLoop);
      clearInterval(updateScoreLoop);
      clearInterval(gameDurationLoop);
      clearInterval(moveInterval);
      clearInterval(spawnInterval);
      gameRunning = false;
      $("#pause-btn i").removeClass("fa-pause").addClass("fa-play");
    } else {
      moveRoadLoop = setInterval(moveRoad, roadSpeed);
      gameTimeLoop = setInterval(updateGameTime, 1000);
      updateScoreLoop = setInterval(() => updateScore(1), scoreInterval);
      moveInterval = setInterval(gameLoop, roadSpeed / 2);
      spawnInterval = setInterval(spawnRandomCars, 30);

      gameDurationLoop = setTimeout(() => {
        clearInterval(gameTimeLoop);
        clearInterval(updateScoreLoop);
        clearInterval(moveRoadLoop);
        clearInterval(moveInterval);
        clearInterval(spawnInterval);
        showGameOverBoard();
        $("#pause-button-container").addClass("d-none");
        $("#repeat-button-container").addClass("d-none");
      }, gameDuration - gameTime * 1000);
      gameRunning = true;
      $("#pause-btn i").removeClass("fa-play").addClass("fa-pause");
    }
  });

  repeatBtn.click(function () {
    clearInterval(moveRoadLoop);
    clearInterval(gameTimeLoop);
    clearInterval(updateScoreLoop);
    clearInterval(moveInterval);
    clearInterval(spawnInterval);
    gameRunning = false;
    $("#pause-btn i").removeClass("fa-pause").addClass("fa-play");
  });

  $("#confirmPlayAgain").click(function () {
    $("#pause-btn i").removeClass("fa-play").addClass("fa-pause");
    gameRunning = true;
    clearInterval(gameDurationLoop);
    resetGame();
    playGame();
  });

  introPlayBtn.click(function () {
    $("#speed-shifter-intro").addClass("d-none");
    $("#game-play").removeClass("d-none");
    resetGame();
    playGame();
    gameRunning = true;
  });

  playAgainBtn.click(function () {
    gameRunning = true;
    clearInterval(gameDurationLoop);
    resetGame();
    playGame();
  });

  mainMenuBtn.click(function () {
    gameRunning = false;
    initializeLevels();
    resetGame();
    $("#speed-shifter-intro").removeClass("d-none");
    $("#game-play").addClass("d-none");
  });

  nextLevelBtn.click(function () {
    if (level < 4) {
      level++;
    }

    gameRunning = true;
    resetGame();
    playGame();
  });

  $(".toggle-btn").click(function () {
    // Check if the button is locked
    if ($(this).val() > unlockedLevels) {
      return; // Exit the function early if the level is locked
    } else {
      // Proceed with the logic for unlocked buttons
      const activeElements = $(".active").toArray();

      $(activeElements[0])
        .find("i")
        .removeClass("fa-unlock")
        .addClass("fa-lock");

      // Remove the active class from all buttons
      $(".toggle-btn").removeClass("active");

      // Add the active class to the clicked button
      $(this).addClass("active");
      $(this).find("i").removeClass("fa-lock").addClass("fa-unlock");

      level = parseInt($(this).val(), 10);
    }
  });

  // Keyboard Controls
  $(document).on("keydown", function (e) {
    if (!gameRunning) return;

    switch (e.key) {
      case "ArrowLeft":
        moveLeft = true;
        break;
      case "ArrowRight":
        moveRight = true;
        break;
      case "ArrowUp":
        moveUp = true;
        break;
      case "ArrowDown":
        moveDown = true;
        break;
    }
  });

  $(document).on("keyup", function (e) {
    switch (e.key) {
      case "ArrowLeft":
        moveLeft = false;
        break;
      case "ArrowRight":
        moveRight = false;
        break;
      case "ArrowUp":
        moveUp = false;
        break;
      case "ArrowDown":
        moveDown = false;
        break;
    }
  });

  // ========================================== Functions ==========================================

  function initializeCarPositions() {
    userCar.css({
      left: gameWidth / 2 - userCar.width() / 2,
      top: gameHeight - userCar.height() - 10,
    });

    // Position first car at the top
    otherCar1.css({
      left: roadLeft + Math.random() * (roadWidth - otherCar1.width()),
      top: -otherCar1.height(),
    });

    // Position second car with minimum spacing
    otherCar2.css({
      left: roadLeft + Math.random() * (roadWidth - otherCar2.width()),
      top: -otherCar2.height() - minCarSpacing,
    });
  }

  function initializeLevels() {
    $("#level-1-btn").addClass("active");

    switch (unlockedLevels) {
      case 1:
        $("#level-1-btn i").removeClass("fa-lock").addClass("fa-unlock");
        $("#level-2-btn i").addClass("fa-lock").removeClass("fa-unlock");
        $("#level-3-btn i").addClass("fa-lock").removeClass("fa-unlock");
        $("#level-4-btn i").addClass("fa-lock").removeClass("fa-unlock");
        break;

      case 2:
        $("#level-1-btn i").removeClass("fa-lock").addClass("fa-unlock");
        $("#level-2-btn i").removeClass("fa-lock").addClass("fa-unlock");
        $("#level-2-btn span").text("2");
        $("#level-3-btn i").addClass("fa-lock").removeClass("fa-unlock");
        $("#level-4-btn i").addClass("fa-lock").removeClass("fa-unlock");
        break;

      case 3:
        $("#level-1-btn i").removeClass("fa-lock").addClass("fa-unlock");
        $("#level-2-btn i").removeClass("fa-lock").addClass("fa-unlock");
        $("#level-2-btn span").text("2");
        $("#level-3-btn i").removeClass("fa-lock").addClass("fa-unlock");
        $("#level-3-btn span").text("3");
        $("#level-4-btn i").addClass("fa-lock").removeClass("fa-unlock");
        break;

      case 4:
        $("#level-1-btn i").removeClass("fa-lock").addClass("fa-unlock");
        $("#level-2-btn i").removeClass("fa-lock").addClass("fa-unlock");
        $("#level-2-btn span").text("2");
        $("#level-3-btn i").removeClass("fa-lock").addClass("fa-unlock");
        $("#level-3-btn span").text("3");
        $("#level-4-btn i").removeClass("fa-lock").addClass("fa-unlock");
        $("#level-4-btn span").text("4");
        break;
    }
  }

  function playGame() {
    switch (level) {
      case 1:
        roadSpeed = 60;
        carSpeed = 5;
        minCarSpacing = 500;
        scoreInterval = 1000;
        gameDuration = 30000;
        break;
      case 2:
        roadSpeed = 50;
        carSpeed = 6;
        minCarSpacing = 450;
        scoreInterval = 1500;
        gameDuration = 60000;
        break;
      case 3:
        roadSpeed = 40;
        carSpeed = 7;
        minCarSpacing = 400;
        scoreInterval = 2000;
        gameDuration = 90000;
        break;
      case 4:
        roadSpeed = 30;
        carSpeed = 8;
        minCarSpacing = 350;
        scoreInterval = 2500;
        gameDuration = 120000;
        break;
    }

    initializeCarPositions();

    setTimeout(() => {
      $("#countdown").addClass("d-none");
      moveRoadLoop = setInterval(moveRoad, roadSpeed);
      gameTimeLoop = setInterval(updateGameTime, 1000);
      updateScoreLoop = setInterval(() => updateScore(1), scoreInterval);
      moveInterval = setInterval(gameLoop, roadSpeed / 2);
      spawnInterval = setInterval(spawnRandomCars, 30); // Faster updates for smoother movement
      $("#pause-button-container").removeClass("d-none");
      $("#repeat-button-container").removeClass("d-none");
    }, 4000);

    gameDurationLoop = setTimeout(() => {
      clearInterval(gameTimeLoop);
      clearInterval(updateScoreLoop);
      clearInterval(moveRoadLoop);
      clearInterval(moveInterval);
      clearInterval(spawnInterval);
      showGameOverBoard();
      $("#pause-button-container").addClass("d-none");
      $("#repeat-button-container").addClass("d-none");
    }, gameDuration + 5000);
  }

  function updateScore(points) {
    score += points;
    $("#score").text(score);
  }

  function updateGameTime() {
    gameTime++;
    $("#game-time").text(formatTime(gameTime));
  }

  function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  }

  function resetGame() {
    // Center the user car horizontally and place at bottom of screen
    userCar.css({
      left: gameWidth / 2 - userCar.width() / 2,
      top: gameHeight - userCar.height() - 10,
    });

    // Reset other cars to top of screen with random horizontal positions
    otherCar1.css({
      left: Math.random() * (gameWidth - otherCar1.width()),
      top: -otherCar1.height(),
    });

    otherCar2.css({
      left: Math.random() * (gameWidth - otherCar2.width()),
      top: -otherCar2.height(),
    });

    // Clear all existing intervals to prevent multiple timers
    clearInterval(moveRoadLoop);
    clearInterval(gameTimeLoop);
    clearInterval(updateScoreLoop);
    clearInterval(moveInterval);
    clearInterval(spawnInterval);

    // Reset game state variables
    score = 0;
    gameTime = 0;

    // Reset UI elements
    $("#score").text(score);
    $("#game-time").text("00:00");

    // Reset star displays
    $("#stars-0, #stars-1, #stars-2, #stars-3").addClass("d-none");

    // Show countdown, hide game over elements
    $("#countdown").removeClass("d-none");
    $("#game-over-overlay").addClass("d-none");
    $("#game-over-board").addClass("d-none");

    // Hide control buttons
    $("#pause-button-container").addClass("d-none");
    $("#repeat-button-container").addClass("d-none");
    $("#next-level-btn").addClass("d-none"); // Hide next level button
  }

  // Road Movement  function moveRoad() {
  function moveRoad() {
    $(".road").each(function () {
      let currentTop = parseFloat($(this).css("top"));
      let newTop = currentTop + 5;

      if (newTop >= $(window).height() * 2) {
        newTop = -$(window).height() + 10;
      }

      $(this).css("top", `${newTop}px`);
    });
  }

  function showGameOverBoard() {
    $("#final-score").text(score); // Display the final score
    $("#highest-score").text(highestScore[level - 1]); // Display the highest score
    $("#current-level").text(level); // Display the current level

    // Save highest score if beaten
    if (score > highestScore[level - 1]) {
      highestScore[level - 1] = score;
    }

    let compareScore = gameDuration / scoreInterval / 4;

    if (score >= compareScore * 3) {
      stars = 3;
    } else if (score >= compareScore * 2) {
      stars = 2;
    } else if (score >= compareScore) {
      stars = 1;
    } else {
      stars = 0;
    }

    // Display stars
    switch (stars) {
      case 0:
        $("#stars-0").removeClass("d-none");
        break;
      case 1:
        $("#stars-1").removeClass("d-none");
        break;
      case 2:
        $("#stars-2").removeClass("d-none");
        break;
      case 3:
        $("#stars-3").removeClass("d-none");
        break;
    }

    if (stars > 0) {
      switch (level) {
        case 1:
          unlockedLevels = 2;
          break;
        case 2:
          unlockedLevels = 3;
          break;
        case 3:
          unlockedLevels = 4;
          break;
      }
      $("#next-level-btn").removeClass("d-none");
    }

    if (level === 4) {
      $("#next-level-btn").addClass("d-none");
    }

    // Show the game over board
    $("#game-over-overlay").removeClass("d-none");
    $("#game-over-board").removeClass("d-none");
  }

  // Car Movement Function
  function moveUserCar() {
    if (gameRunning == false) return;

    const roadWidth = 490; // Specify the road width
    const roadLeft = (gameWidth - roadWidth) / 2; // Calculate left position of the road
    const roadRight = roadLeft + roadWidth; // Calculate right position of the road

    let currentLeft = parseInt(userCar.css("left"));
    let currentTop = parseInt(userCar.css("top"));
    let userCarSpeed = 10;

    if (moveLeft && currentLeft > roadLeft) {
      userCar.css("left", currentLeft - userCarSpeed);
    }
    if (moveRight && currentLeft < roadRight - userCar.width()) {
      userCar.css("left", currentLeft + userCarSpeed);
    }
    if (moveUp && currentTop > 0) {
      userCar.css("top", currentTop - userCarSpeed);
    }
    if (moveDown && currentTop < gameHeight - userCar.height()) {
      userCar.css("top", currentTop + userCarSpeed);
    }
  }

  function spawnRandomCars() {
    if (!gameRunning) return;

    [otherCar1, otherCar2].forEach((car, index) => {
      let currentTop = parseInt(car.css("top"));
      let newTop = currentTop + carSpeed; // Use carSpeed for movement

      // If car is off screen, reset position
      if (newTop > gameHeight) {
        let newLeft;
        let newPosition;
        let attempts = 0;
        const otherCar = index === 0 ? otherCar2 : otherCar1;

        // Try to find a non-overlapping position
        do {
          newLeft = getRandomCarPosition();
          newPosition = -car.height() - Math.random() * minCarSpacing;
          car.css({
            left: newLeft,
            top: newPosition,
          });
          attempts++;
        } while (checkCollision(car, otherCar) && attempts < 10);

        // If we couldn't find a non-overlapping position, force minimum spacing
        if (attempts >= 10) {
          const otherCarTop = parseInt(otherCar.css("top"));
          newPosition = otherCarTop - minCarSpacing - car.height();
          car.css("top", newPosition);
        }
      } else {
        car.css("top", newTop);
      }
    });
  }

  // Function to move the car smoothly using requestAnimationFrame
  function moveCarSmoothly(car) {
    // Get the current top position of the car
    const currentTop = parseFloat(car.css("top"));
    const nextTop = currentTop + roadSpeed;

    // Check if the car is still on screen (below the viewport height)
    if (nextTop < gameHeight) {
      // Update the car's position smoothly
      car.css("top", nextTop); // Update car's vertical position

      // Request the next frame to keep moving the car
      requestAnimationFrame(() => moveCarSmoothly(car));
    } else {
      // If the car moves off-screen, reset its position for respawning
      resetCarPosition(car);
    }
  }

  // Function to reset the car position when it moves off-screen
  function resetCarPosition(car) {
    // Reset car's position if it has moved off the screen
    const roadWidth = 490;
    const roadLeft = (gameWidth - roadWidth) / 2;

    const carWidth = car.width();
    const newLeft = roadLeft + Math.random() * (roadWidth - carWidth);

    // Reset the car off-screen and start moving again
    car.css({
      left: newLeft,
      top: -car.height(), // Reset car position off-screen
    });

    // Start moving the car again smoothly
    moveCarSmoothly(car);
  }

  // Collision Detection
  function checkCollision(car1, car2) {
    const rect1 = car1[0].getBoundingClientRect();
    const rect2 = car2[0].getBoundingClientRect();

    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  }

  function getRandomCarPosition() {
    const carWidth = otherCar1.width();
    return roadLeft + Math.random() * (roadWidth - carWidth);
  }

  // Game Loop
  function gameLoop() {
    if (!gameRunning) return;

    moveUserCar();
    spawnRandomCars();
    moveRoad();

    // Check collision with other cars
    if (
      checkCollision(userCar, otherCar1) ||
      checkCollision(userCar, otherCar2)
    ) {
      clearInterval(moveRoadLoop);
      clearInterval(gameTimeLoop);
      clearInterval(updateScoreLoop);
      clearInterval(moveInterval);
      clearInterval(spawnInterval);
      gameRunning = false;
      $("#pause-button-container").addClass("d-none");
      $("#repeat-button-container").addClass("d-none");
      showGameOverBoard();
    }
  }
});
