import { boot } from 'quasar/wrappers';
import bus from "boot/bus";

/* GRAYYYCOPY from ./yehat/yehat.js, because we're here earlier. */
/* --[ LVL 2 - Yehat Local Logger ]--------------------------------[ Colors [Yehat] in console output ]-------------- */
export const log = (([ color1, color2 ]) => (s, ...r) => console.log(
  `${s.replace('[', '[%c').replace(']', '%c]')}`, `color: ${color1}`, `color: ${color2}`, ...r
))([ "#ffc700", "#ffffff" ]);
/* --------------------------------------------------------------------------------------------------------------------*/

export const progressStep = (a = {}) => {
  const dt = performance.now();

  bus.emit("progress-step", { ...a, dt });
};

export default boot(({ app, router, store }) => {
  console.log("Boot Yehat", app, router, store);

  const webpackContext = require.context(
    '../yehat/items', true, /[A-Z]\w+\.(vue|js)$/
  );

  const webpackContextPL = require.context(
    '../yehat/pl', true, /[A-Z]\w+\.(vue|js)$/
  );

  let compo1 = {}, compo2 = {};
  let c = 0, ca = [];

  try {
    compo1 = webpackContext.keys().map(filename => {
      console.log("Filename:", filename);
      const file = require(/* webpackChunkName: "yehat-items" */ "../yehat/items/"+filename.slice(2)).default; 
      const name = filename.slice(2).split(".")[0];
      c++;
      ca.push(name);
      return { [name]: file };
    }).reduce((a, v) => ({ ...a, ...v }), {});

    compo2 = webpackContextPL.keys().map(filename => {
      const file = require(/* webpackChunkName: "yehat-pl" */ "../yehat/pl/"+filename.slice(2)).default; 
      const name = filename.slice(2).split(".")[0];
      c++;
      ca.push(name);
      return { [name]: file };    
    }).reduce((a, v) => ({ ...a, ...v }), {});  
  } catch(e) {
    console.log("Exception in autoloader!", e);
  }

  const components = {
    ...compo1,
    ...compo2
  };
    
  let c1 = 0
  for(let key in components) {
    try {
      app.component(key, components[key]);
      c1++;
      // console.log("Autoloaded: "  +key);    
    } catch(e) {
      console.log("Error registering component", key, e);
    }

    progressStep({ stage: "Loading Components" });
  }

  log(`--[ Autoloader ]--[ ${ c } Items loaded, ${ c1 } Components Registered`);
  log(`--[ Autoloader ]--[ ${ ca.join(", ") }`);


});