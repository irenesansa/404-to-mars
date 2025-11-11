/* comportamiento y lógica */
(() => {
  const bigError = document.getElementById("big-error");
  const typeZone = document.getElementById("type-zone");
  const typewriter = document.getElementById("typewriter");
  const countdownBar = document.getElementById("countdown-bar");
  const countdownEl = document.getElementById("countdown");
  const gameArea = document.getElementById("game-area");
  const iframe = document.getElementById("game-iframe");
  const photoArea = document.getElementById("photo-area");
  const photoImg = document.getElementById("photo");
  const finalMessage = document.getElementById("final-message");

  const audio = document.getElementById("bg-audio");
  const vol = document.getElementById("vol");
  const downloadAudio = document.getElementById("download-audio");

  // set download link to same src so user can download
  downloadAudio.href = audio.src;

  // connect volume slider
  vol.addEventListener("input", () => {
    audio.volume = Number(vol.value);
  });
  // initial volume
  audio.volume = Number(vol.value);

  // autoplay attempt
  const tryPlayAudio = async () => {
    try {
      await audio.play();
    } catch (e) {
      // autoplay blocked — leave it paused; user can unmute / press slider to trigger
      console.log(
        "Autoplay blocked, user intervention needed to enable audio."
      );
    }
  };

  // SEQUENCE:
  // 1) blink ERROR 404, after ~2s animate up and shrink
  // 2) show typewriter typing the sentence
  // 3) after typed, remove it and start countdown (3 min), show countdown and iframe
  // 4) when countdown <= 30: hide iframe and start showing images, one per second, for each second remaining
  // 5) when countdown hits 0: show "You are dead"

  const typeText =
    "The planet Mars has vanished from the solar System. You are going to die. Enjoy your last moments.";

  function startSequence() {
    // allow blink for a bit then move up
    setTimeout(() => {
      bigError.classList.add("small-up");
      // show typewriter after transition completes
      setTimeout(() => {
        typeZone.classList.remove("hidden");
        startTyping(typeText, () => {
          // After typing done, pause, then fade out typewriter and start countdown
          setTimeout(() => {
            typeZone.classList.add("hidden");
            beginCountdown(180); // 3 minutes = 180s
          }, 800);
        });
      }, 1200);
    }, 1600);
  }

  // typewriter
  function startTyping(text, cb) {
    let i = 0;
    typewriter.textContent = "";
    const speed = 28; // ms per char
    const interval = setInterval(() => {
      typewriter.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        if (cb) cb();
      }
    }, speed);
  }

  // countdown
  let countdownInterval = null;
  function beginCountdown(totalSeconds) {
    countdownBar.classList.remove("hidden");
    gameArea.classList.remove("hidden");
    // ensure audio playing
    tryPlayAudio();

    let remaining = totalSeconds;
    function update() {
      const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
      const ss = String(remaining % 60).padStart(2, "0");
      countdownEl.textContent = `${mm}:${ss}`;

      // at <=30: hide game and show images
      if (remaining === 30) {
        gameArea.classList.add("hidden");
        photoArea.classList.remove("hidden");
      }

      if (remaining <= 30 && remaining > 0) {
        // show a new photo each second
        const seed = `mars-${remaining}-${Date.now()}`;
        // use picsum.photos for dynamic images — each second a different seed
        const w = Math.min(window.innerWidth * 0.8, 860) | 0;
        const h = Math.min(window.innerHeight * 0.6, 560) | 0;
        photoImg.src = `https://picsum.photos/seed/${encodeURIComponent(
          seed
        )}/${w}/${h}`;
      }

      if (remaining <= 0) {
        clearInterval(countdownInterval);
        endSequence();
      }
      remaining--;
    }

    update();
    countdownInterval = setInterval(update, 1000);
  }

  function endSequence() {
    // hide everything and show final message
    countdownBar.classList.add("hidden");
    gameArea.classList.add("hidden");
    photoArea.classList.add("hidden");
    bigError.classList.add("hidden");
    finalMessage.classList.remove("hidden");

    // ensure audio stops
    try {
      audio.pause();
    } catch (e) {}
  }

  // kick off when DOM ready
  window.addEventListener("load", () => {
    // small safeguard: unhide big error then start sequence
    bigError.classList.remove("hidden");
    // show big error then begin animations
    startSequence();

    // make iframe visible only after load to avoid prefetch blocking
    iframe.addEventListener("load", () => {
      console.log("iframe loaded (if allowed by site).");
    });

    // allow clicking the volume slider area to trigger audio play (help browsers that block autoplay)
    vol.addEventListener("pointerdown", async () => {
      try {
        await audio.play();
      } catch (e) {
        /* ignore */
      }
    });
    // also try clicking anywhere to enable audio
    document.addEventListener("pointerdown", async function once() {
      try {
        await audio.play();
      } catch (e) {}
      document.removeEventListener("pointerdown", once);
    });
  });
})();
