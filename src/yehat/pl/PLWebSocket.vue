<template>
  <div class="widget q-dark">
    <header class="widget-header">Yehat - Websocket Configuration</header>
    <div v-touch-pan.mouse.prevent="() => {}">
      <div class="caption">Standard Yehat Beta I WebSockets Server</div>
      <q-input v-model="item.websocketConfig.host" label="Host" dense />
      <q-input v-model.number="item.websocketConfig.port" label="Port" dense />

      <q-toolbar>
        <q-btn dense color="orange-10" size="10px" @click="save">Save</q-btn> 
        <q-btn dense color="orange-10" size="10px" @click="connect" class="q-ml-xs">Conn</q-btn>
        <q-space />
        <div class="io-status">{{ yehat.ioStatus }}</div>
      </q-toolbar>
    </div>
    <Resizer :item="item" />
  </div>
</template>


<script>
import { reactive, watch, inject, onMounted, onBeforeUnmount } from "vue";
import { Component } from "../ecs";
import { Located, Meta, Connections, Item, loadItem, SaveLocal } from "../basics0/index";
import Resizer from "../ux/Resizer";

const WebsocketConfig = Component("websocketConfig", {
  host: "54.237.227.39",
  port: 80
});

export const makePLWebSocket = ({ id, rel, pool }) => { 
  return loadItem([
    Located({
      rel,
      pos: [ 20, 40, 0 ],
      size: [ 10, 15 ]
    }),
    Connections([

    ]),
    Item({
      baseComponent: "PLWebSocket"
    }),
    WebsocketConfig(),
    Meta({
      type: "Dash",
      name: "Yehat Websocket MK 1"
    }),
    SaveLocal({
      websocketConfig: true,
      located: true,
      connections: true,
    })
  ])({ id });//.install(gymbal0Enchantments, pool);
};

export default {
  props: {
    item: Object,
  },
  components: { Resizer },
  setup(props) {
    const state = reactive({
      unwatches: []
    });

    const save = () => {
      props.item.saveLocal.save();      
    };

    const connect = () => {
      core.yehat.connectIO();
    };

    onMounted(() => {
      state.unwatches.push(
        watch(props.item.websocketConfig, save, { deep: true })
      )
    });

    onBeforeUnmount(() => {
      state.unwatches.map(fn => fn());
    });

    return { yehat: core.yehat, save, connect };
  }
}

</script>

<style lang="scss" scoped>
.widget {
  background: $grey-10;
  color: white;
  padding: 8px;
  font-size: 12px;

  .widget-header {
    font-weight: 500;
    opacity: 0.5;
    height: 34px;
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }

  .q-input ::v-deep(input) {
    color: white;
  }

  .q-input ::v-deep(.q-field__label) {
    color: $orange-7;
  }

  .q-toolbar {
    min-height: 32px;

    padding-left: 0;
    padding-right: 0;
  }
}

.caption {
  font-weight: 500;
}
</style>