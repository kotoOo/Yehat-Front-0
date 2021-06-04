import { Component } from "../ecs";
import { Located, Meta, Connections, Item, loadItem } from "./index";
import { Timer } from "./timer";

export const Story = Component("story", {
  frames: [], /* StoryFrame */
  stage: 0,
  done: false,
  duration: null
});

export const StoryFrame = Component("storyFrame", {
  caption: "- No caption -",
  done: false,
  dtDone: null,
  dtStart: null,
  duration: null
});

export const useStory0 = ({ id, rel }) => { 
  return loadItem([   
    Located({
      rel,
      pos: [ 20, 0, 0 ],
      size: [ 20, 15 ]
    }),
    Connections([

    ]),
    Item({
      baseComponent: "IStory0"
    }),
    Meta({
      type: "Questline",
      name: "ToDo"
    }),
    Story({
      frames: [
        StoryFrame({
          caption: "Try panning the camera.",
          done: false
        }).storyFrame,
        StoryFrame({
          caption: "Try dragging an object.",
          done: false
        }).storyFrame,
        StoryFrame({
          caption: "Drop stuff to the Cargo.",
          done: false
        }).storyFrame,
        StoryFrame({
          caption: "Drop more stuff to the Cargo.",
          done: false
        }).storyFrame
      ]
    }),
    Timer()
  ])({ id });
};