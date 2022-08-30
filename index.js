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
        this.onChange?.(this.getDate());
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

const TimerDisplayElement = class {
  constructor(element) {
    this.element = element;
  }
  update(targetDate) {
    const timeLeft = Math.round((targetDate.getTime() - (new Date()).getTime()) / 1000);
    const timeLeftSign = timeLeft >= 0 ? "" : "-";
    const timeLeftAbs = Math.abs(timeLeft);
    const timeLeftHours = Math.floor(timeLeftAbs / (60 * 60)).toString().padStart(2, "0");
    const timeLeftMinutes = (Math.floor(timeLeftAbs / 60) % 60).toString().padStart(2, "0");
    const timeLeftSeconds = (timeLeftAbs % 60).toString().padStart(2, "0");
    this.element.textContent = `${timeLeftSign} ${timeLeftHours} : ${timeLeftMinutes} : ${timeLeftSeconds}`;
  }
  static fromId(elementId) {
    const element = document.getElementById(elementId);
    return new TimerDisplayElement(element);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const timerInput = TimerInputElement.fromId("timer_input");
  const timerText = TimerDisplayElement.fromId("timer_display");
  timerInput.onChange = date => { timerText.update(date); };
  const loop = () => {
    // クエリの有無で設定画面とタイマー画面を切り替え
    // inputの表示をもうちょっとマシにする
    // 円形のタイマーを表示する
    const targetDate = timerInput.getDate();
    timerText.update(targetDate);
    let timeout = 1000 - (new Date).getMilliseconds();
    if (timeout < 100) { timeout += 1000; }
    setTimeout(loop, timeout);
  };
  loop();
});
