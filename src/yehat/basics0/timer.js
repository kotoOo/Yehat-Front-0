import { Component } from "../ecs.js";

export const Pause = Component("pause", {
  dtStart: null,
  dtEnd: null,
  duration: 0
});

export const Timer = Component("timer", {
  state: 0, /* 1 running 2 pause 3 stopped */
  dtStart: null,
  dtPause: null,
  dtEnd: null,
  pauses: [],
  interval: 40,
  t: null,
  elapsedCom: null,
  tick: (item) => () => {
    if (item.timer.state == 1) {
      item.timer.elapsedCom = item.timer.elapsed();
    }

    item.timer.t = setTimeout(item.timer.tick, item.timer.interval);
  },
  start: (item) => ({ now = +new Date() } = {}) => {
    if (item.timer.t) {
      console.log("[Timer]Timer already running.");
      return;
    }
    item.timer.dtStart = now;
    item.timer.dtEnd = null;
    item.timer.pauses = [];
    item.timer.state = 1;

    item.timer.t = setTimeout(item.timer.tick, item.timer.interval);
    console.log(`[${item.meta.name}][Timer]Started`);
  },
  pause: (item) => () => {
    if (item.timer.state != 1) {
      console.log("[Timer]Cannot pause, timer is not ruunning.");
      return;
    }

    item.timer.state = 2;
    const now = +new Date();
    item.timer.pauses.push(
      new Pause({ dtStart: now }).pause
    );
    item.timer.elapsedCom = item.timer.elapsed({ now });
  },
  resume: (item) => () => {
    if (item.timer.state != 2 || !item.timer.pauses.length) {
      console.log("[Timer]Cannot resume, not paused.");
      return;
    }

    const pause = item.timer.pauses[item.timer.pauses.length-1];
    const now = +new Date();
    pause.dtEnd = now;
    pause.duration = pause.dtEnd - pause.dtStart;

    item.timer.state = 1;
    item.timer.elapsedCom = item.timer.elapsed({ now });
  },
  stop: (item) => ({ now = +new Date() } = {}) => {
    if (item.timer.t) {
      clearTimeout(item.timer.t);
      item.timer.t = null;
    }

    if (item.timer.state == 2) {
      const pause = item.timer.pauses[item.timer.pauses.length-1];
      pause.dtEnd = now;
      pause.duration = pause.dtEnd - pause.dtStart;
    }
    
    item.timer.dtEnd = now;
    item.timer.elapsedCom = item.timer.elapsed({ now });
    item.timer.state = 3;
  },
  elapsed: (item) => ({ now = +new Date() } = {}) => {
    const pausedTime = item.timer.pauses.reduce((a, v) => {
      const interval = v.dtEnd === null ? ((item.timer.dtEnd || now) - v.dtStart) : (v.dtEnd - v.dtStart);
      return a + interval;
    }, 0);

    return (item.timer.dtEnd || now) - item.timer.dtStart - pausedTime;
  } 
});