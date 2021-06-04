import { Component } from "../ecs";
import { Located, Meta, Connections, Item, loadItem, SaveLocal } from "./index";

// ---
function rotateZ(p, origin, angleZ) { /*  origin[ x, y ] p[ x, y, z ]? */
  let x = p[0] - origin[0];
  let y = p[1] - origin[1];

  return [
    Math.round(x * Math.cos(angleZ) - y * Math.sin(angleZ) + origin[0]), /* X */
    Math.round(x * Math.sin(angleZ) + y * Math.cos(angleZ) + origin[1]), /* Y */
    p[2]                                                                 /* Z remains constant, we're rotating around world Z axis */
  ];
};
// ---

export const Point3 = Component('p', [ 0, 0, 0 ]);

export const Path = Component('path', {
  points: [], /* Array of Point3 */
  origin: [ 0, 0, 0 ]
});

export const Unit = Component('unit', {
  paths: [],
  colors: [],
  origin: [ 0, 0, 0 ],
  polyCount: 0,
  rotation: [ 0, 0, 0 ],
  size: 128, /* pixel size, important factor how coordinates will be interpreted. Or is it? */

  /* Выясняется, что такой метод мы написать не можем, поскольку в рендере будут принимать участие и другие компоненты,
  так что это действительно система в терминах ECS. */
  // svgV0: (item) => ({ camera }) => {

  // }
  addPath: (unit) => (origin = [ 0, 0, 0 ]) => {
    const newPath = Path({ origin });
    unit.unit.paths.push(newPath);
    return newPath;
  }
});

// export const EditEntityConfig = Component('config', {
//   showJSON: false
// });

export const makeUnit = ({ id, rel }) => { 
  return loadItem([
    Located({
      rel,
      pos: [ 0, 0, 0 ],
      size: [ 10, 15 ]
    }),
    Connections({
      
    }),
    Item({
      baseComponent: "IUnit"
    }),
    // NavConfig({
    //   showJSON: false
    // }),
    Unit({}),
    Meta({
      type: "Unit",
      name: "No-Name-0"
    }),
    SaveLocal({
      connections: true,
      unit: true
    })
  ])({ id });
};

export const ItemPropConfig = Component("itemPropConfig", {
  activePath: null,
  activeNode: null,
  activeEdge: null
});

export const makeItemProperties = ({ id, rel, target = null, gymbal = null }) => { 
  return loadItem([
    Located({
      rel,
      pos: [ 0, 0, 0 ],
      size: [ 10, 15 ]
    }),
    Connections({
      target, gymbal
    }),
    Item({
      baseComponent: "IProperties"
    }),
    ItemPropConfig({}),
    // NavConfig({
    //   showJSON: false
    // }),
    // Unit({}), /* Maybe it will have its own unit in the future! */
    Meta({
      type: "Entity Editor",
      name: "Isometric Unit"
    }),
    SaveLocal({
      connections: true,
      unit: true,
      itemPropConfig: true
    })
  ])({ id });
};