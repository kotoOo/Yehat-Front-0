import bus from "boot/bus";

/* --[ LVL 2 - Yehat Local Logger ]--------------------------------[ Colors [Yehat] in console output ]-------------- */
export const log = (([ color1, color2 ]) => (s, ...r) => console.log(
  `${s.replace('[', '[%c').replace(']', '%c]')}`, `color: ${color1}`, `color: ${color2}`, ...r
))([ "#ffc700", "#ffffff" ]);
/* --------------------------------------------------------------------------------------------------------------------*/

export const progressStep = (a = {}) => {
  const dt = performance.now();

  bus.emit("progress-step", { ...a, dt });
};
/* Beta I Yehat with commented out ECS and SocketIO integrations. It is pure 
Yehat, so be it. */
/* Vue Composition API over Vue 2 edition. */
import { reactive, computed } from "vue";

// import yehat from "./run-yehat";

const io = require("../libs/socket.io.min.js");
window.io = io;

/* Custom XHR pre-installed */
export class ZXHRAbstractException extends Error {};
export class ZXHRStatusException extends ZXHRAbstractException {};
export class ZXHRServerException extends ZXHRAbstractException {
  constructor(code, details) {
    super(`API error. Code: ${code}. Details: ${details}`);
  }
};



export const xhr = async ({ url, body }) => {
  const res = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...core.yehat.zxhr.headers
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (res.status != 200) throw new ZXHRStatusException(`${res.status} ${res.statusText}`);
  const { code, details, ...rest } = await res.json();
  if (code != "ok") throw new ZXHRServerException(code, details);
  return rest;
};

export const setToken = (token) => {
  if (token) {
    core.yehat.zxhr.headers["Authorization"] = token;
    localStorage.ziiToken = token;
  } else {
    delete core.yehat.zxhr.headers["Authorization"];
    delete localStorage.ziiToken;
  }
};



window.core = {
  uuid: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  }),
  today: () => new Date().toISOString().split('T')[0],
  ms: (delay) => new Promise(resolve => setTimeout(resolve, delay)),
  log: (...rest) => console.log(
    ...rest.reduce((a, v) => (typeof v == "string") ? [ ...a, ...core.colorParse(v) ] : [ ...a, v], [])
  ),
  colorParse: s => {
    const add = [];

    return [ s.replaceAll(/\^c(.+?)\^/g, (match, cap, index, s) => {
      // console.log("match, cap, index, s", match, cap, index, s);
      add.push(`color: #${cap}`);
      return "%c";
    }), ...add ];
  },
  epochStart: 18761,
  to2Digits: (v) => {
    let a = "" + v;
    if (a.length < 2) a = '0'+a;
    return a;
  },
  to3Digits: (v) => {
    let a = "" + v;
    while (a.length < 3) a = '0'+a;
    return a;
  },
  dtToVTime: (dt, short = false) => {
    const ms = dt % 1000;
    const a1 = Math.floor(dt / 1000);
    const s = a1 % 60;
    const a2 = Math.floor(a1 / 60);
    const m = a2 % 60;
    const a3 = Math.floor(a2 / 60);
    const h = a3 % 24;
    const a4 = Math.floor(a3 / 24);
    const d = a4 / 10;
    if (short) return `${core.to2Digits(h)}:${core.to2Digits(m)}:${core.to2Digits(s)}.${core.to3Digits(ms)}`;
    return `Day ${a4 - core.epochStart} Time ${core.to2Digits(h)}:${core.to2Digits(m)}:${core.to2Digits(s)}.${core.to3Digits(ms)}`;
  },
};

export const runYehat = ({ appMode } = { appMode: "production" }) => {
  console.log("Running yehat...");
  core.yehat = core.yehat || reactive({
    log,
    auth: {
      memberID: null,
      name: "guest",
      avatar: "/images/default-av.png",
      keys: [],
      getStatus: () => {
        return Promise.reject();
      },
      logout: () => {
        delete localStorage.ziiToken;
        setToken(null);
        yehat.auth.getStatus();
      },
      hasKey: (key) => !!~yehat.auth.keys.indexOf(key)
    },
    zxhr: {
      headers: {},
      xhr
    },
    lang: localStorage.lang || "ru",
    appMode,
    manualAppMode: null,
    useAppMode: computed(() => core.yehat.manualAppMode || core.yehat.appMode),
    ioStatus: "down",
    outbound: [], /* Messages will be piped from here to remote Yehat Beta I server asynchronously as it's possible */
                  /* Until then they are to be stored locally and listed here. */
                  /* Simple messages are adviced to be sent in form of IP0 protocol passing (??) headers. */
    emit: ({ cmd, ...a }) => {

    },
    transmitOutbound: async ({ socket }) => {
      if (!socket && !socket.connected) return;

      while (core.yehat.outbound.length) {
        const message = core.yehat.outbound[0];
        const { cmd, ...rest } = message;
        await new Promise((resolve, reject) => {
          log("[Socket] => ", cmd, rest);
          socket.emit(cmd, rest, (...response) => {
            
            log("[    ...] <= ", response);
            resolve();
          });
        });

        core.yehat.outbound.splice(0, 1);
      }
    },
    connectIO: () => {
      const plWebSocket = Object.assign({ /* Loading configuration from ECS */
        websocketConfig: { host: null, port: null }
      }, JSON.parse(localStorage["yehat1-b7526e1b-064f-4fa1-b1de-2daf75a5cacb"] || '{ "websocketConfig": { "host": "https://pl.rb9.ru", "port": 443 } }'));

      const { host, port } = plWebSocket.websocketConfig;
      core.yehat.ioStatus = "connecting";
      log("[Yehat]Connecting to Yehat Beta I WebSocket Server", host, port);
      const socket = io(`${host}:${port}`, { transports: [ 'websocket' ] });

      socket.on("connect", (/* no parameters =Oo= */) => {
        log("[Yehat]Connected!");
        core.yehat.ioStatus = "connected";
        yehat.reportDeviceID({ socket });
        yehat.transmitOutbound({ socket });
      });
      socket.on("connect_error", (a, b, c) => {
        log("[Yehat]Socket IO Error", a, a.message);
        core.yehat.ioStatus = "error";
      });
      socket.on("server", (a, b, c) => {
        log("[Socket] <= server", a, b, c);
      });
      console.log("socket", socket);

      //yehat.socket = socket;
      core.socket = socket;
    },
    reportDeviceID: ({ socket }) => {
      socket.emit("deviceID", { deviceID: localStorage.deviceID, userObject: JSON.parse(localStorage.userObj || '{}') }, ack => console.log("ack", ack));
    }
  });
  window.yehat = core.yehat;

  let deviceID = localStorage.deviceID;
  if (!deviceID) {
    deviceID = core.uuid();
    localStorage.deviceID = deviceID;
  }
  core.deviceID = deviceID;
  yehat.zxhr.headers.deviceID = deviceID;

  if (localStorage.ziiToken) setToken(localStorage.ziiToken);
  yehat.connectIO();

  return core.yehat;
};

export const Yehat = {
  render(yehat) {
    //console.log("h", h);
    return () => h('div', { 'class': "yehat-core" }, this.$slots.default);
  },
  setup() {
    core.log("^cffc700^Yehat. Reporting in.");
  }
};