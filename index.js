'use strict';

const TimerInputElement = class {
  constructor(element) {
    const inputs = Array.from(element.querySelectorAll("input"));
    inputs.forEach(input => { input.type = "number"; });
    this.inputs = {
      "FullYear": inputs[0],
      "Month"   : inputs[1],
      "Date"    : inputs[2],
      "Hours"   : inputs[3],
      "Minutes" : inputs[4],
      "Seconds" : inputs[5],
    };
    this.onChange = null;
    inputs.forEach(input => {
      input.addEventListener("input", () => {
        this.onChange?.(new Date(), this.getDate());
      });
    });

    const date = new Date();
    date.setHours(date.getHours() + 3);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    this.setDate(date);
  }
  setDate(date) {
    Object.entries(this.inputs).forEach(([key, input]) => {
      let valueNumber = date[`get${key}`]();
      if (key === "Month") { valueNumber += 1; }
      let valueString = valueNumber.toString();
      if (key !== "FullYear") { valueString = valueString.padStart(2, "0"); }
      input.value = valueString;
    });
  }
  getDate() {
    const date = new Date();
    date.setMilliseconds(0);
    Object.entries(this.inputs).forEach(([key, input]) => {
      let value = Number(input.value);
      if (key === "Month") { value -= 1; }
      date[`set${key}`](value);
    });
    return date;
  }
  static fromId(elementId) {
    const element = document.getElementById(elementId);
    return new TimerInputElement(element);
  }
};

const TimerTextElement = class {
  constructor(element) {
    this.element = element;
  }
  update(currentDate, targetDate) {
    const timeLeft = Math.round((targetDate.getTime() - currentDate.getTime()) / 1000);
    const timeLeftSign = timeLeft >= 0 ? "" : "-";
    const timeLeftAbs = Math.abs(timeLeft);
    const timeLeftHours = Math.floor(timeLeftAbs / (60 * 60)).toString().padStart(2, "0");
    const timeLeftMinutes = (Math.floor(timeLeftAbs / 60) % 60).toString().padStart(2, "0");
    const timeLeftSeconds = (timeLeftAbs % 60).toString().padStart(2, "0");
    this.element.textContent = `${timeLeftSign}${timeLeftHours}:${timeLeftMinutes}:${timeLeftSeconds}`;
  }
  static fromId(elementId) {
    const element = document.getElementById(elementId);
    return new TimerTextElement(element);
  }
};

const TimerGraphElement = class {
  constructor(element) {
    this.element = element;
  }
  update(startDate, currentDate, targetDate) {
    let progress = (currentDate.getTime() - startDate.getTime()) / (targetDate.getTime() - startDate.getTime());
    progress = Math.max(0, Math.min(1, progress));
    const startDeg = 270 - 16;
    const endDeg = -90 + 16;
    const middleDeg = startDeg * (1 - progress) + endDeg * progress;
    const width = 0.2;
    const radius = 1 - width * 0.5;
    const startX  = Math.cos(-  startDeg * Math.PI / 180.0) * radius;
    const startY  = Math.sin(-  startDeg * Math.PI / 180.0) * radius;
    const endX    = Math.cos(-    endDeg * Math.PI / 180.0) * radius;
    const endY    = Math.sin(-    endDeg * Math.PI / 180.0) * radius;
    const middleX = Math.cos(- middleDeg * Math.PI / 180.0) * radius;
    const middleY = Math.sin(- middleDeg * Math.PI / 180.0) * radius;
    const path1LargeArcFlag = Math.abs(endDeg - middleDeg) < 180 ? 0 : 1;
    const path1 =
      `<path fill-opacity="0" stroke-width="${width * 0.5}" stroke="#0F3460" stroke-linecap="round" d="` +
        `M ${middleX} ${middleY} A ${radius} ${radius} 0 ${path1LargeArcFlag} 1 ${endX} ${endY}` +
      `" />`;
    const path2LargeArcFlag = Math.abs(middleDeg - startDeg) < 180 ? 0 : 1;
    const path2 =
      `<path fill-opacity="0" stroke-width="${width * 0.5}" stroke="#E94560" stroke-linecap="round" d="` +
        `M ${startX} ${startY} A ${radius} ${radius} 0 ${path2LargeArcFlag} 1 ${middleX} ${middleY}` +
      `" />`;
    this.element. innerHTML = path1 + "\n" + path2;
  }
  static fromId(elementId) {
    const element = document.getElementById(elementId);
    return new TimerGraphElement(element);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const startDate = new Date();
  const timerInput = TimerInputElement.fromId("timer_input");
  const timerText = TimerTextElement.fromId("timer_text");
  const timerGraph = TimerGraphElement.fromId("timer_graph");
  timerInput.onChange = (currentDate, targetDate) => {
    timerText.update(currentDate, targetDate);
    timerGraph.update(startDate, currentDate, targetDate);
  };
  const loop = () => {
    // クエリの有無で設定画面とタイマー画面を切り替え
    // inputの表示をもうちょっとマシにする
    const currentDate = new Date();
    const targetDate = timerInput.getDate();
    timerText.update(currentDate, targetDate);
    timerGraph.update(startDate, currentDate, targetDate);
    let timeout = 1000 - (new Date).getMilliseconds();
    if (timeout < 100) { timeout += 1000; }
    setTimeout(loop, timeout);
  };
  loop();
});

