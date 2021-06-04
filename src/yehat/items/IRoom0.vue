<template>
  <div class="widget column no-wrap">
    <header class="widget-header">
      <div class="row no-wrap items-center q-col-gutter-x-sm">
        <div class="col-auto">@</div>
        <div class="col row">
          <q-input v-model="item.room0.at" dense class="col-shrink col-grow full-width" />
        </div>
      </div>
    </header>
    <div class="main col column">
      <div style="display: flex;" class="col-auto">
        <div class="col-auto">
          <div class="caption">Total</div>
          <div>{{ state.total }}</div>
        </div>
        <q-list dense style="display: flex; flex-direction: row" class="col-auto">
          <q-item v-for="(count, name) of state.types" :key="name">
            <q-item-section>{{ name }}: {{ count }}</q-item-section>
          </q-item>
        </q-list>
        <q-list dense style="display: flex; flex-direction: row" class="col-auto">
          <q-item v-for="(count, name) of state.compos" :key="name" class="col-auto">
            <q-item-section>{{ name }}: {{ count }}</q-item-section>
          </q-item>
        </q-list>
      </div>
      <div style="display: flex">
        <div v-for="(item, key) of state.top" :key="key" class="col">
          <div class="row col-auto">
            <div class="caption">{{ key }}</div>
            <q-toggle v-model="state.showTop[key]" size="20px" color="amber-7" />
            <q-btn dense color="negative" size="10px" @click="eDelete(item)" label="Delete Entity" />
          </div>
        </div>
      </div>
      <div v-if="state.showTop[0]" class="column col relative-position full-width">
        <CodeEditor :value="state.top0JSON" watch style="position: absolute; height: 100%; max-height: 100%; min-height: 100%;" class="col full-width" />
      </div>
    </div>
    <Resizer :item="item" />
  </div>
</template>

<script>
import { reactive, computed, watch, watchEffect, inject, onMounted, onBeforeUnmount } from "vue";
import { Component } from "../ecs";
import { Located, Meta, Connections, Item, loadItem, SaveLocal } from "../basics0/index";
import Resizer from "../ux/Resizer";
import CodeEditor from "../ux/CodeEditor";
import bus from "boot/bus";
import { Notify, Dialog } from "quasar";

export const Room0 = Component('room0', {
  at: null
});

export const makeRoom0 = ({ id, rel, at, pool }) => { 
  return loadItem([
    Room0({ at }),
    Located({
      rel,
      pos: [ 0, 55, 0 ],
      size: [ 10, 15 ]
    }),
    Connections([

    ]),
    Item({
      baseComponent: "IRoom0"
    }),
    Meta({
      type: "Dash",
      name: "Yehat Direct Entity Browser"
    }),
    SaveLocal({
      located: true,
      connections: true,
      room0: true
    })
  ])({ id });//.install(gymbal0Enchantments, pool);
};

export default {
  props: {
    item: Object
  },
  components: { Resizer, CodeEditor },
  setup(props) {
    const state = reactive({
      types: {},
      compos: {},
      top: [],
      showTop: [ true, false, false, false ],
      total: 0,
      top0JSON: computed(() => {
        if (state.top.length == 0) return '----[ NO ENTITY ]----'
        return JSON.stringify(state.top[0], null, 2);
      })
    });

    const showEntity = ({ id }) => {
      props.item.room0.at = id;
    };

    const update = () => {
      const target = props.item.room0.at;
      
      core.socket.emit("room0", { at: target }, ({ types, compos, total, top }) => {
        console.log("room0 <=", { types, compos, total, top });
        state.types = types;
        state.compos = compos;
        state.total = total;
        state.top = top;
      });
    };

    watchEffect(onCleanup => {
      

      update();

      bus.on("showEntity", showEntity);

      onCleanup(() => {
        bus.off("showEntity", showEntity);
      });
    });

    const eDelete = async ({ id }) => {
      await new Promise((resolve) =>
        Dialog.create({
          title: 'Confirm',
          message: `Delete Entity ${id}?`,
          cancel: true,
          persistent: false,
          style: "background: #1c1c1c; color: white;"
        }).onOk(resolve)
      );

      core.socket.emit("e-delete", { id }, ({ code, details }) => {
        if (code == "ok") {
          update();
        } else {
          Notify.create(details);
        }
      });
    };

    return { state, eDelete };
  }
}
</script>

<style lang="scss" scoped>
.widget {
  color: white;

  .q-field ::v-deep(.q-field__native) {
    color: white;
  }
}
</style>