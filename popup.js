let timerId = null;
let timeLeft = 0;
let isBreak = false;
let isPaused = false;

const setupArea = document.getElementById('setup-area');
const timerArea = document.getElementById('timer-area');
const timerDisplay = document.getElementById('timer');
const modeText = document.getElementById('mode-text');
const focusInput = document.getElementById('focusInput');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const resetBtn = document.getElementById('resetBtn');
const stopAlarmBtn = document.getElementById('stopAlarmBtn');
const startBreakBtn = document.getElementById('startBreakBtn');
const detachBtn = document.getElementById('detachBtn');

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startTimer(minutes, modeName) {
  if (!isPaused) {
    timeLeft = minutes * 60;
  }
  isPaused = false;
  modeText.textContent = modeName;
  updateDisplay();

  setupArea.classList.add('hidden');
  timerArea.classList.remove('hidden');
  stopAlarmBtn.classList.add('hidden');
  startBreakBtn.classList.add('hidden');
  resumeBtn.classList.add('hidden');
  pauseBtn.classList.remove('hidden');

  timerId = setInterval(() => {
    timeLeft--;
    updateDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerId);
      onTimerComplete();
    }
  }, 1000);
}

function onTimerComplete() {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: '時間です！',
    message: isBreak ? '休憩終了です！' : '集中終了！休憩しましょう。',
    priority: 2
  });

  if (!isBreak) {
    stopAlarmBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
  } else {
    resetUI();
  }
}

function resetUI() {
  clearInterval(timerId);
  timerId = null;
  isPaused = false;
  isBreak = false;
  setupArea.classList.remove('hidden');
  timerArea.classList.add('hidden');
}

// --- イベントリスナー ---

startBtn.addEventListener('click', () => {
  const mins = parseInt(focusInput.value);
  if (mins > 0) startTimer(mins, "集中タイム中...");
});

pauseBtn.addEventListener('click', () => {
  clearInterval(timerId);
  isPaused = true;
  pauseBtn.classList.add('hidden');
  resumeBtn.classList.remove('hidden');
  modeText.textContent = "一時停止中";
});

resumeBtn.addEventListener('click', () => {
  startTimer(timeLeft / 60, isBreak ? "休憩中☕" : "集中タイム中...");
});

resetBtn.addEventListener('click', () => {
  if (confirm("リセットして最初の画面に戻りますか？")) {
    resetUI();
  }
});

stopAlarmBtn.addEventListener('click', () => {
  stopAlarmBtn.classList.add('hidden');
  startBreakBtn.classList.remove('hidden');
});

startBreakBtn.addEventListener('click', () => {
  isBreak = true;
  isPaused = false;
  startTimer(5, "休憩中☕");
});

// ★追加：別ウィンドウで開く機能
detachBtn.addEventListener('click', () => {
  chrome.windows.create({
    url: chrome.runtime.getURL("popup.html"),
    type: "popup",
    width: 320,
    height: 450
  });
});