// Moved to boot/yehat
// // import { Vue } from "vue";
// import { log, progressStep } from "./yehat";

// const webpackContext = require.context(
//   './items', true, /[A-Z]\w+\.(vue|js)$/
// );

// const webpackContextPL = require.context(
//   './pl', true, /[A-Z]\w+\.(vue|js)$/
// );

// let compo1 = {}, compo2 = {};
// let c = 0, ca = [];

// try {
//   compo1 = webpackContext.keys().map(filename => {
//     console.log("Filename:", filename);
//     const file = require(/* webpackChunkName: "yehat-items" */ "./items/"+filename.slice(2)).default; 
//     const name = filename.slice(2).split(".")[0];
//     c++;
//     ca.push(name);
//     return { [name]: file };
//   }).reduce((a, v) => ({ ...a, ...v }), {});

//   compo2 = webpackContextPL.keys().map(filename => {
//     const file = require(/* webpackChunkName: "yehat-pl" */ "./pl/"+filename.slice(2)).default; 
//     const name = filename.slice(2).split(".")[0];
//     c++;
//     ca.push(name);
//     return { [name]: file };    
//   }).reduce((a, v) => ({ ...a, ...v }), {});  
// } catch(e) {
//   console.log("Exception in autoloader!", e);
// }

// export const components = {
//   ...compo1,
//   ...compo2
// };
  
// let c1 = 0
// for(let key in components) {
//   try {
//     Vue.component(key, components[key]);
//     c1++;
//     // console.log("Autoloaded: "  +key);    
//   } catch(e) {
//     console.log("Error registering component", key, e);
//   }

//   progressStep({ stage: "Loading Components" });
// }

// log(`--[ Autoloader ]--[ ${ c } Items loaded, ${ c1 } Components Registered`);
// log(`--[ Autoloader ]--[ ${ ca.join(", ") }`);
