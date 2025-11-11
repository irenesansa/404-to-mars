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

  // Crear partículas flotantes
  const particlesContainer = document.getElementById("particles");
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.width = `${Math.random() * 4 + 2}px`;
    particle.style.height = particle.style.width;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 15}s`;
    particle.style.animationDuration = `${Math.random() * 10 + 15}s`;
    particlesContainer.appendChild(particle);
  }

  // connect volume slider
  vol.addEventListener("input", () => {
    audio.volume = Number(vol.value);
  });
  // initial volume
  audio.volume = Number(vol.value);

  // asegurar que iframe no emita sonido (intento)
  try {
    // atributo ya presente en HTML; aquí intentamos forzarlo desde DOM
    iframe.setAttribute("muted", "");
    // algunos navegadores/devtools exponen propiedad muted en el elemento <iframe>
    if ("muted" in iframe) iframe.muted = true;
    // reforzar política de permiso para autoplay (no garantiza silencio, depende del origen)
    iframe.setAttribute("allow", "autoplay; fullscreen");
  } catch (e) {
    /* ignore */
  }

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

  // SECUENCIA según el briefing
  const typeText =
    "The planet Mars has vanished from the solar System. You are going to die. Enjoy your last moments.";

  function startSequence() {
    setTimeout(() => {
      bigError.classList.add("small-up");

      setTimeout(() => {
        typeZone.classList.remove("hidden");
        startTyping(typeText, () => {
          setTimeout(() => {
            typeZone.classList.add("hidden");
            beginCountdown(60); // 1 minuto = 60 segundos
          }, 1000);
        });
      }, 1500);
    }, 2000);
  }

  // Efecto de escritura
  function startTyping(text, cb) {
    let i = 0;
    typewriter.textContent = "";
    const speed = 35;
    const interval = setInterval(() => {
      typewriter.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        if (cb) cb();
      }
    }, speed);
  }

  // Cuenta atrás de 3 minutos
  let countdownInterval = null;
  function beginCountdown(totalSeconds) {
    countdownBar.classList.remove("hidden");
    gameArea.classList.remove("hidden");
    bigError.classList.add("hidden"); // ocultar error cuando aparece el juego
    // ensure audio playing
    tryPlayAudio();

    let remaining = totalSeconds;

    function update() {
      const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
      const ss = String(remaining % 60).padStart(2, "0");
      countdownEl.textContent = `${mm}:${ss}`;

      // Advertencia cuando quedan 30 segundos
      if (remaining <= 30 && remaining > 0) {
        countdownEl.classList.add("countdown-warning");
      }

      // A los 30 segundos: ocultar juego y mostrar fotos
      if (remaining === 30) {
        gameArea.classList.add("hidden");
        photoArea.classList.remove("hidden");
      }

      // Mostrar una foto diferente cada segundo
      if (remaining <= 30 && remaining > 0) {
        const seed = `mars-apocalypse-${remaining}-${Date.now()}`;
        const w = Math.min(window.innerWidth * 0.85, 900) | 0;
        const h = Math.min(window.innerHeight * 0.55, 600) | 0;
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
    countdownBar.classList.add("hidden");
    gameArea.classList.add("hidden");
    photoArea.classList.add("hidden");
    bigError.classList.add("hidden");
    finalMessage.classList.remove("hidden");

    try {
      audio.pause();
    } catch (e) {}
  }

  // Iniciar cuando cargue la página
  window.addEventListener("load", () => {
    bigError.classList.remove("hidden");
    startSequence();

    iframe.addEventListener("load", () => {
      console.log("Game iframe loaded.");
    });

    // Permitir audio con interacción del usuario
    vol.addEventListener("pointerdown", async () => {
      try {
        await audio.play();
      } catch (e) {}
    });

    document.addEventListener(
      "pointerdown",
      async function once() {
        try {
          await audio.play();
        } catch (e) {}
        document.removeEventListener("pointerdown", once);
      },
      { once: true }
    );
  });
})();
