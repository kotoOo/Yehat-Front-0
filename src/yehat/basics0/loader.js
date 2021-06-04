import { Located, Meta, Connections, Item, loadItem } from "./index";
import { Timer } from "./timer";

export const useLoader = ({ id, rel }) => { 
  return loadItem([
    Located({
      rel,
      pos: [ 0, 0, 0 ],
      size: [ 10, 15 ]
    }),
    Connections({
      
    }),
    Item({
      baseComponent: "ILoader"
    }),    
    Meta({
      type: "Loader",
      name: "Loader"
    }),
    Timer()
  ])({ id });
};