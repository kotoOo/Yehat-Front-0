import { Component } from "../ecs";
import { Located, Meta, Connections, Item, loadItem } from "./index";
import { computed } from "vue";

export const Gymbal = Component('gymbal', {
  pitch: 0,
  yaw: 0,
  roll: 0,
  origin: [ 0, 0, 0 ],
  distance: 0
});

const matURotationX = (a) => [
  1, 0,             0,
  0, Math.cos(a), - Math.sin(a),
  0, Math.sin(a),   Math.cos(a)
];

const matURotationZ = (a) => [
  Math.cos(a), - Math.sin(a), 0,
  Math.sin(a),   Math.cos(a), 0,
  0,             0,           1
];

const matURotationPitchYaw = (pitch, yaw) => [
  Math.cos(pitch) * Math.cos(yaw), - Math.sin(pitch) * Math.cos(yaw), 0,
  Math.sin(pitch) * Math.cos(yaw),   Math.cos(pitch) * Math.cos(yaw), 0,
  0,                                 0,                               Math.sin(yaw)
];

const matxv = (mat, v) => [
  mat[0] * v[0] + mat[1] * v[1] + mat[2] * v[2],
  mat[3] * v[0] + mat[4] * v[1] + mat[5] * v[2],
  mat[6] * v[0] + mat[7] * v[1] + mat[8] * v[2]
];

const addv = (v1, v2) => [
  v1[0] + v2[0],
  v1[1] + v2[1],
  v1[2] + v2[2],
];

const gymbal0Enchantments = [
  (item) => ({ /* [ Enchantment LVL 1 ] - copy/paste to create new enchantments */
    approaching: computed(() => {
      const { gymbal } = item;
      const { origin, pitch, yaw, distance } = gymbal;

      return matxv(matURotationPitchYaw(pitch, yaw), [ distance, 0, 0 ]) 
    })
  }) /* ----------------------------------------------------------------------- */
];

export const useGymbal0 = ({ id, rel, pool }) => { 
  const gymb0 = loadItem([
    Located({
      rel,
      pos: [ 10, 30, 0 ],
      size: [ 20, 15 ]
    }),
    Connections([

    ]),
    Item({
      baseComponent: "IGymbal0"
    }),
    Gymbal({
      
    }),
    Meta({
      type: "Control",
      name: "Gymbal MK 1"
    })
  ])({ id }).install(gymbal0Enchantments, pool);

  console.log("gymb0", gymb0);

  return gymb0;
};