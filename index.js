'use strict';

const TimerInputElement = class {
  constructor(element) {
    this.dateInput = element.querySelector('input[type="date"]');
    this.timeInput = element.querySelector('input[type="time"]');
    this.setDate(new Date);
    this.onChange = null;
    [this.dateInput, this.timeInput].forEach(input => {
      input.addEventListener("input", () => { this.onChange?.(); });
    });
  }
  setDate(date) {
    const inputYear    = date.getFullYear()   .toString().padStart(4, "0");
    const inputMonth   = (date.getMonth() + 1).toString().padStart(2, "0");
    const inputDate    = date.getDate()       .toString().padStart(2, "0");
    const inputHours   = date.getHours()      .toString().padStart(2, "0");
    const inputMinutes = date.getMinutes()    .toString().padStart(2, "0");
    this.dateInput.value = `${inputYear}-${inputMonth}-${inputDate}`;
    this.timeInput.value = `${inputHours}:${inputMinutes}`;
  }
  getDate() {
    const dateRegex = /^(\d+)[^\d]+(\d+)[^\d]+(\d+)$/;
    const timeRegex = /^(\d+)[^\d]+(\d+)/;
    const dateText = this.dateInput.value;
    const timeText = this.timeInput.value;
    if (!dateRegex.test(dateText) || !timeRegex.test(timeText)) { return null; }
    const [inputYear, inputMonth, inputDate] = dateText.match(dateRegex).slice(1, 4);
    const [inputHours, inputMinutes] = timeText.match(timeRegex).slice(1, 3);
    const date = new Date();
    date.setFullYear(Number(inputYear));
    date.setMonth(Number(inputMonth) - 1);
    date.setDate(Number(inputDate));
    date.setHours(Number(inputHours));
    date.setMinutes(Number(inputMinutes));
    date.setSeconds(0);
    date.setMilliseconds(0);
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
  update(currentDate, endDate) {
    const timeLeft = Math.round((endDate.getTime() - currentDate.getTime()) / 1000);
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
  update(startDate, currentDate, endDate) {
    let progress = (currentDate.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime());
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
  const startTimeInput = TimerInputElement.fromId("start_time_input");
  const endTimeInput = TimerInputElement.fromId("end_time_input");
  const timerText = TimerTextElement.fromId("timer_text");
  const timerGraph = TimerGraphElement.fromId("timer_graph");
  endTimeInput.setDate((() => {
    const date = endTimeInput.getDate();
    date.setHours(date.getHours() + 3);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  })());
  [startTimeInput, endTimeInput].forEach(input => {
    input.onChange = () => {
      const currentDate = new Date();
      const startDate = startTimeInput.getDate();
      const endDate = endTimeInput.getDate();
      timerText.update(currentDate, endDate);
      timerGraph.update(startDate, currentDate, endDate);
    };
  });
  const loop = () => {
    const currentDate = new Date();
    const startDate = startTimeInput.getDate();
    const endDate = endTimeInput.getDate();
    timerText.update(currentDate, endDate);
    timerGraph.update(startDate, currentDate, endDate);
    let timeout = 1000 - (new Date).getMilliseconds();
    if (timeout < 100) { timeout += 1000; }
    setTimeout(loop, timeout);
  };
  loop();
});

