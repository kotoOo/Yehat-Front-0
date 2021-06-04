<template>
  <div class="widget">
    <q-btn color="primary" dense size="10px" @click="ping">Ping</q-btn>
    <q-btn color="primary" dense size="10px" @click="restart">Restart Yehat Backend</q-btn>
    <q-btn color="primary" dense size="10px" @click="user0">User 0</q-btn>
  </div>
</template>

<style lang="scss" scoped>

</style>

<script>
import { reactive, computed, watch, inject, onMounted, onBeforeUnmount } from "vue";
import { Component } from "../ecs";
import { Located, Meta, Connections, Item, loadItem, SaveLocal } from "../basics0/index";
import Resizer from "../ux/Resizer";

export const makePanel0 = ({ id, rel, pool }) => { 
  return loadItem([
    Located({
      rel,
      pos: [ 40, 40, 0 ],
      size: [ 10, 15 ]
    }),
    Connections([

    ]),
    Item({
      baseComponent: "PLPanel0"
    }),
    Meta({
      type: "Dash",
      name: "Yehat Panel Lvl 1"
    }),
    SaveLocal({
      located: true,
      connections: true,
    })
  ])({ id });//.install(gymbal0Enchantments, pool);
};

export default {
  props: {
    item: Object
  },
  components: { Resizer },
  setup() {
    return {
      ping: () => {
        core.yehat.outbound.push({
          cmd: "ping"
        });
        core.yehat.transmitOutbound({ socket: core.socket });
      },
      restart: () => {
        core.yehat.outbound.push({
          cmd: "restart"
        });
        core.yehat.transmitOutbound({ socket: core.socket });
      },
      user0: () => {
        core.yehat.outbound.push({
          cmd: "user0"
        });
        core.yehat.transmitOutbound({ socket: core.socket });
      }
    };
  }
};
</script>