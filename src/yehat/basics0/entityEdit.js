import { Component } from "../ecs";
import { Located, Meta, Connections, Item, loadItem, SaveLocal } from "./index";

// export const EditEntityConfig = Component('config', {
//   showJSON: false
// });

export const useEntityEdit = ({ id, rel }) => { 
  return loadItem([
    Located({
      rel,
      pos: [ 0, 15, 0 ],
      size: [ 40, 25 ]
    }),
    Connections({
      target: null
    }),
    Item({
      baseComponent: "IEntityEdit"
    }),
    // NavConfig({
    //   showJSON: false
    // }),
    Meta({
      type: "Entity Editor",
      name: "Entity Editor"
    }),
    SaveLocal({
      connections: true
    })
  ])({ id });
};