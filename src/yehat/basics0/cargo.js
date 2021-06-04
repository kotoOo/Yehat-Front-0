import { Component } from "../ecs";
import { Located, Meta, Connections, Item, loadItem } from "./index";

const Cargo = Component("cargo", {
  cursor: null
});

export const useCargo = ({ id, rel }) => { 
  return loadItem([
    Located({
      rel,
      pos: [ 10, 0, 0 ],
      size: [ 10, 15 ]
    }),
    Connections([

    ]),
    Item({
      baseComponent: "ICargo"
    }),
    Meta({
      type: "Cargo",
      name: "Info Panel"
    }),
    Cargo() 
  ])({ id });
};