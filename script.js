(function () {
  const screen = document.querySelector(".launch-screen");
  const palmPad = document.getElementById("palmPad");
  const statusLine = document.getElementById("statusLine");
  const progressText = document.getElementById("progressText");
  const resetButton = document.getElementById("resetButton");

  const messages = [
    { at: 0, text: "جاري تفعيل بصمة التدشين", progress: 8 },
    { at: 520, text: "توثيق لحظة التدشين", progress: 28 },
    { at: 1160, text: "اعتماد التدشين", progress: 57 },
    { at: 1780, text: "إطلاق الجائزة", progress: 82 },
    { at: 2380, text: "اكتمل الاعتماد", progress: 100 },
  ];

  let isRunning = false;
  let timers = [];
  let audioContext;

  function setProgress(value) {
    palmPad.style.setProperty("--progress", value);
    progressText.textContent = value >= 100 ? "100%" : `${value}%`;
  }

  function clearTimers() {
    timers.forEach((timer) => window.clearTimeout(timer));
    timers = [];
  }

  function tone(frequency, start, duration, gainValue) {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + start);
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(gainValue, audioContext.currentTime + start + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + start + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(audioContext.currentTime + start);
    oscillator.stop(audioContext.currentTime + start + duration + 0.02);
  }

  function playLaunchSound() {
    try {
      audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      audioContext.resume();
      tone(392, 0, 0.28, 0.045);
      tone(523.25, 0.24, 0.3, 0.05);
      tone(659.25, 0.5, 0.42, 0.055);
      tone(987.77, 2.32, 0.74, 0.07);
    } catch (error) {
      audioContext = null;
    }
  }

  function requestFullScreen() {
    const root = document.documentElement;
    if (!document.fullscreenElement && root.requestFullscreen) {
      root.requestFullscreen().catch(() => {});
    }
  }

  function beginLaunch(event) {
    if (isRunning) return;
    isRunning = true;
    event.preventDefault();
    requestFullScreen();
    playLaunchSound();
    screen.dataset.state = "scanning";
    setProgress(0);

    messages.forEach((message) => {
      timers.push(
        window.setTimeout(() => {
          statusLine.textContent = message.text;
          setProgress(message.progress);
        }, message.at)
      );
    });

    timers.push(
      window.setTimeout(() => {
        screen.dataset.state = "complete";
        statusLine.textContent = "تم التدشين";
      }, 3000)
    );
  }

  function resetLaunch(event) {
    event.preventDefault();
    clearTimers();
    isRunning = false;
    screen.dataset.state = "idle";
    statusLine.textContent = "بتشريف سموكم يبدأ التدشين";
    progressText.textContent = "جاهز";
    palmPad.style.setProperty("--progress", 0);
  }

  palmPad.addEventListener("pointerdown", beginLaunch, { passive: false });
  palmPad.addEventListener("touchstart", beginLaunch, { passive: false });
  resetButton.addEventListener("pointerdown", resetLaunch, { passive: false });

  document.addEventListener(
    "gesturestart",
    (event) => {
      event.preventDefault();
    },
    { passive: false }
  );
})();
