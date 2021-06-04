/* EP0 - Entity Protocol Zero, a factory supply some Entities to you if you pass ECS environment,
currently <s>Entity constructor</s> plus component base. */
import { computed, reactive } from "vue";
import { bindMethods, Component, loadEntity } from "../ecs.js";
/* ...>... zii-ecs.rc1.js                                         */
/* The ONE and THE ONLY TRUE AUTHENTHIC ENTITY FACTORY in ZII ECS */
export const Entity = (a) => reactive({
  id: core.uuid(),
  ...a
});
/* --[ Lvl 3 ] -------------------------------------------------- */

export const Located = Component('located', {
  rel: null,
  pos: [ 0, 0, 0 ]
});

export const Connections = Component('connections', { /* keys - "handles", or "slot names", values: enitity IDs */
  
});

export const Item = Component('item', {
  baseComponent: "ZIIItem3",
  cargoStyle: null,
  style: null
});

export const Drag = Component('drag', {
  active: false,
  pos: [ 0, 0 ],
  onDrop: (item) => () => {}
});

export const Meta = Component('meta', {
  type: "Unknown",
  name: "No name"
});

export const Activity = Component("activity", {
  dtLastTouched: null,
  count: 0,
  z: 0
});

export const SaveLocal = Component("saveLocal", {
  /* ... DYNAMIC Key: component name, Value: True = save all fields, Array = save some fields */
  save: (item) => ({ prefix = "yehat1" } = {}) => {
    const a = {};
    for (let key in item.saveLocal) {
      let v = item.saveLocal[key];

      if (Array.isArray(v)) {
        a[key] = {};
        v.forEach(name => a[key][name] = item[key][name]);
      } else if (v === true) {
        a[key] = item[key];
      } else if (typeof v == "function") {
        /* That's a method, don't save */
      }
    }

    localStorage[`${prefix}-${item.id}`] = JSON.stringify(a);
    console.log(`[ECS]Saved locally ${item.meta.name}.`);
  }
});

export const loadItem = (a = []) => loadEntity([
  Located(),
  Item(),
  Drag(),
  Activity(),
  SaveLocal({
    located: true
  }),  
  ...a
]);

export { useLoader } from "./loader";
export { useCargo } from "./cargo";
export { useStory0 } from "./story0";
export { useNavigation0 } from "./navigation0";
export { useEntityEdit } from "./entityEdit";