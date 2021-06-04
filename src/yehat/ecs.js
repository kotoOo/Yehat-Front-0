import { reactive } from "vue";

/* The ONE and THE ONLY TRUE AUTHENTHIC ENTITY FACTORY in ZII ECS */
export const Entity = (a = {}) => reactive({
  id: core.uuid(),
  ...a
});
/* --[ Lvl 3 ] -------------------------------------------------- */

export const Entity1 = (a = []) => {
  let b = {};
  for(let key in a) {
    let component = a[key];
    if (Object.keys(component) == 1) {
      let name = Object.keys(component)[0];
      b[name] = component[name];
    } else {
      b = { ...b, ...component }; /* wrong, components are not only objects */
    }
  }

  return reactive({
    id: core.uuid(),
    ...b
  });
};

export const loadEntity = (a = []) => ({ id, prefix = "yehat1", /* methods = {}, */ exclude = [] }) => {
  const initial = JSON.parse(localStorage[`${prefix}-${id}`] || "{}");
  let b = { id };
  let fn = [];
  for(let key in a) { /* For each component passed */
    let component = a[key];

    for (let name in component) { /* iterating its keys, in 99% there'll be 1 key with the component name itself */
      if (typeof component[name] == 'object' && !Array.isArray(component[name])) {
        b[name] = { ...(b[name] || {}), ...component[name], ...(initial[name] || {}) }; /* Many mentions of the same component merged */
      } else if (typeof component[name] == 'object' && Array.isArray(component[name])) {
        b[name] = initial[name] || component[name];
      } else {
        b[name] = initial[name] || component[name];
      }
    }
  }

  const en = reactive(b);

  bindMethods({ entity: en, exclude });

  // console.log("Methods bound for", en.meta.name, en);

  // for(let name in methods) {
  //   set(en, name, methods[name](en));
  // }  

  return en;
};

/* Components LVL 1 - should work in simple cases, pre component base stage. */
export const Component = (name, structure) => {
  if (typeof structure == 'object') {
    if (Array.isArray(structure)) { /* Array-style component. class B- */
      return (a = []) => ({ 
        [name]: [ ...structure, ...a ] /* naive! should be pureClone */ /* probably very wrong */
      });
    } else { /* Object-style component. class B+ */
      return (a = {}) => ({ 
        [name]: { ...structure, ...a } /* naive! should be pureClone */
      });
    }
  } else {
    return (v) => ({ /* Non-structured component. not too much explored, class D-. */      
      [name]: v || structure
    });
  }
};
/* --[ Lvl 1 ] ------------------------------------------------------------------------------------------------------ */

/* 
   Install enchantments from a[] into Entity e. Enchantments are to land in the Entity itself, be aware not to overwrite
   components: you are within the same namespace with them.

   This is a battle-tested version, was used in Yehat pre Beta I stage. Officially we are yet to introduce enchantments
   in ECS.
*/

const install = (e) => (a, pool) => { /* <= e - Entity to be enchanted                                                */
  a.forEach(fn => {                   /*    a - Array of Enchants (each of those follows the protocol:                */
/*                                                                                                                    */
/* ..[ ZII ECS Enchant Protocol LVL 3 ]..............................................................................  
    ArrowFunction(item: <Entity>) => Object                                                                           
    
    SINGLE PROPERTY [name]: [value] 
      WHERE 
        name = key on the Entity to become a new property, 
        value = computed - OR - FN(item) ) 

    - OR - 

    MULTIPLE PROPERTIES (experimental)

   ---[ Example ]----------------------------------------------------------------------------------------------------
      const ItemEnhancements = [ 
                    -- Without these enchants Entities cannot be presented on ZIITable 3 in a 
                    -- standard way. Of course there're a few non-standard. So we intended to dress everybody in 
                    -- these. 
        (item) => ({
          position: computed({
            get: () => {
              if (item.drag && item.drag.active) {
                return item.drag.pos;
              } else {
                const x = item.located.pos[0] * (zw.space.grid[0] + zw.space.grid[2]);
                const y = item.located.pos[1] * (zw.space.grid[1] + zw.space.grid[3]);

                return [ x - zw.camera.cx, y - zw.camera.cy ];
              }
            },
            set: ([ x, y ]) => {
              item.located.pos[0] = Math.round((x  + zw.camera.cx) / (zw.space.grid[0] + zw.space.grid[2]));
              item.located.pos[1] = Math.round((y  + zw.camera.cy) / (zw.space.grid[1] + zw.space.grid[3]));
            }
          }),
        }),
        ...
      ];
*/
    const chant = fn(e, pool);
    // console.log("fn(e)", fn(e));
    for(let i in chant) {
      e[i] = chant[i];
    }
    return e;
    //Object.assign(e, fn(e)); /* should be deepmerge */
  });
  
  return e;
};

export const bindMethods = ({ entity, exclude = [] }) => {
  /* hard built-in methods */
  [ { install } ].map(enchantMethod => {
    const name = Object.keys(enchantMethod)[0];
    const fn = enchantMethod[name];
    entity[name] = fn(entity);
  });  

  /* component methods */
  let c = 0;
  for(let k in entity) {
    if (~exclude.indexOf(k)) continue;

    let component = entity[k];  
    if (typeof component != 'object' || Array.isArray(component)) continue;    
    
    for (let key in component) {      
      let v = component[key];
      if (typeof v == 'function') {
        //entity[k][key] = v(entity);
        entity[k][key] = v(entity);
        c++;
      }
    }
  }

  console.log("[ECS]Entity", entity.meta.name, "methods bound", c);

  return entity;
};

