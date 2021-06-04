import { Component } from "../ecs";
import { Located, Meta, Connections, Item, loadItem } from "./index";

export const NavConfig = Component('config', {
  showJSON: false
});

export const useNavigation0 = ({ id, rel }) => { 
  return loadItem([
    Located({
      rel,
      pos: [ 10, 0, 0 ],
      size: [ 10, 15 ]
    }),
    Connections([

    ]),
    Item({
      baseComponent: "INavigation"
    }),
    NavConfig({
      showJSON: false
    }),
    Meta({
      type: "NavDash",
      name: "Info Dash"
    })
  ])({ id });
};