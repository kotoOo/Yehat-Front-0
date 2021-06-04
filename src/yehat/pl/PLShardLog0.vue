<template>
  <div class="widget q-dark column">
    <header class="widget-header col-auto">
      Yehat - Shard Log
      <!-- .. Users: {{ item.c.userlist ? item.c.userlist.userlist.items.length : '- NOT CONNECTED -' }} -->
    </header>
    
    <div class="col-auto" style="flex: 0 0 24px">
      <q-btn-toggle v-model.modelValue="state.mode" :options="[
        { value: 'all', label: 'All Records' },
        { value: 'byUser', label: 'By User' }
      ]" class="q-mr-xs" size="10px" dense />
    </div>
    <VectorPan 
      v-model="state.cursor" :max="state.showRecords.length-1" class="v-pan-record" h-sens
    />
    
    <q-input 
      v-if="state.mode == 'byUser'" v-model="state.byUser" label="userID" 
      size="10px" dense 
    />
    <!-- <div class="caption">All Records</div>
    <div class="caption">By User</div> -->
    

    <div v-touch-pan.mouse.prevent="() => {}" class="col scroll">
      <div v-if="state.curItem" class="row q-gutter-x-sm"> 
        <div v-if="state.curItem.deviceID && !state.curItem.userName" class="dot" :style="{ background: state.colorMap[state.curItem.deviceID] }" />
        <div v-if="state.curItem.userName" class="userName">{{ state.curItem.userName }}</div>
        <q-space />
        <div><div class="a">Code</div> {{ state.curItem.name }}</div>
        <div><div class="a">VTime</div> {{ state.curItem.vTime }}</div>
        <div><div class="a">SVTime</div> {{ state.curItem.svTime }}</div>
      </div>
      
      <!-- <div><div class="a">Device ID</div> {{ state.curItem.deviceID }}</div> -->
      <div v-if="state.curItem && state.curItem.details">
        <div class="a name">Details</div> {{ state.curItem.details.name }}
        <div class="a">Tail</div> {{ state.curItemTail }}
      </div>

      <!-- <q-list class="scroll full-height">
        <q-item 
          v-for="(item, key) of state.showRecords" :key="key" class="bg-grey-9"
          @click="showJSONBox(item)" clickable
        >
          <q-item-section>
            <div class="row q-gutter-x-sm"> 
              <div v-if="item.deviceID && !item.userName" class="dot" :style="{ background: state.colorMap[item.deviceID] }" />
              <div v-if="item.userName" class="userName">{{ item.userName }}</div>
              <q-space />
              <div><div class="a">Code</div> {{ item.name }}</div>
              <div><div class="a">VTime</div> {{ item.vTime }}</div>
              <div><div class="a">SVTime</div> {{ item.svTime }}</div>
            </div>          
            <div v-if="item.details">
              <div class="a name">Details</div> {{ item.details.name }}
              <div class="a">Tail</div> {{ (({ name, ...rest } = item.details) => rest)() }}
            </div>
          </q-item-section>
        </q-item>
      </q-list> -->
      <!-- <q-table
        :data="state.records" :columns="state.columns" class="bg-grey-9 scroll" dense wrap-cells
      >
        <template #footer>
          <div>Total records: {{ state.records.length }}</div>
        </template>
      </q-table> -->
      <div v-if="state.mode=='byUser'" class="q-mr-xs">Records shown: {{ state.recordsWindow }} of {{ state.showRecords.length }}</div>
      <div v-else class="q-mr-xs">Records shown: {{ state.recordsWindow }} of {{ state.records.length }}</div>
    </div>
    <q-toolbar class="col-auto">
      <q-btn dense color="orange-10" size="10px" @click="request">Request</q-btn> 
      <!-- <q-btn dense color="orange-10" size="10px" @click="connect" class="q-ml-xs">Conn</q-btn/> -->
      <q-space/>
      
      <!-- <div class="io-status">{{ yehat.ioStatus }}</div> -->
      <q-btn dense color="orange-10" size="10px" @click="more">Next</q-btn>
    </q-toolbar>
    <Resizer :item="item" />
    <q-dialog v-model="jsonBox.show">
      <q-card style="max-width: 100%; width: 600px;" class="text-white bg-grey-10">
        <CodeEditor :value="jsonBox.value" autogrow />
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { 
  reactive, computed, watch, inject, onMounted, onBeforeUnmount, watchEffect 
} from "vue";
import { Component } from "../ecs";
import { Located, Meta, Connections, Item, loadItem, SaveLocal } from "../basics0/index";
import Resizer from "../ux/Resizer";
import CodeEditor from "../ux/CodeEditor";
import VectorPan from "../ux/VectorPan0";

export const makeShardLog0 = ({ id, rel, pool, userListID }) => { 
  return loadItem([
    Located({
      rel,
      pos: [ 30, 40, 0 ],
      size: [ 10, 15 ]
    }),
    Connections({
      userlist: userListID
    }),
    Item({
      baseComponent: "PLShardLog0"
    }),
    Meta({
      type: "Dash",
      name: "Yehat ShardLog Lvl 0"
    }),
    SaveLocal({
      located: true,
      connections: true,
    })
  ])({ id });//.install(gymbal0Enchantments, pool);
};

export default {
  props: {
    item: Object,
  },
  components: { Resizer, CodeEditor, VectorPan },
  setup(props) {
    console.log("setup PLShardLog0");
    const state = reactive({
      unwatches: [],
      records: [],
      columns: [
        // { label: "id", field: "id", name: "id" },
        { label: "sessionID", field: "sessionID", name: "sessionID" },
        { label: "vTime", field: "vTime", name: "vTime" },
        { label: "log0", field: "details", name: "details" }
      ],
      recordsWindow: 20,
      totalRecords: computed(() => state.records.length),
      showRecords: computed(() => {
        if (state.mode == 'all') {
          return state.records;
        } else if (state.mode == "byUser") {
          return state.records.filter(
            item => item.userID == state.byUser
          );
        }
      }),
      allShown: computed(() => state.recordsWindow >= state.totalRecords),
      colorMap: {},
      mode: "all",
      byUser: null,
      cursor: 0,
      curItem: computed(() => {
        if (state.mode == 'all') {
          if (state.totalRecords == 0) return null;
          if (state.cursor >= 0 && state.cursor < state.totalRecords) {
            return state.records[state.cursor];
          }
          return null;
        } else if (state.mode == "byUser") {
          if (state.showRecords.length == 0) return null;
          if (state.cursor >= 0 && state.cursor < state.showRecords.length) {
            return state.showRecords[state.cursor];
          }
          return null;
        }
      }),
      curItemTail: computed(() => {
        if (!state.curItem || !state.curItem.details) return "- No data -";
        return JSON.stringify(
          (({ name, ...rest } = state.curItem.details) => rest)()
        );
      })
    });

    const prepare = (entities) => {
      const knownDeviceIDs = [];

      const users = props.item.c.userlist ? props.item.c.userlist.userlist.items : [];

      const arr = entities.map(e => {
        // console.log("prepare log record", e);
        const a = { ...e.log0, id: e.id || core.uuid() };
        if (typeof a.details == 'string') a.details = JSON.parse(a.details); /* Exceptions! */

        if (a.deviceID && !~knownDeviceIDs.indexOf(a.deviceID)) {
          knownDeviceIDs.push(a.deviceID);
        }

        users.map(user => {
          if (~user.user0.deviceIDs.indexOf[e.log0.deviceID]) {
            // console.log("user mached", user.user0.name);
            a.userID = user.id;
            a.userName = user.user0.name;
          }
        });

        return a;
      });

      const colors = [ "#438cc4", "#a54dca", "#f06c60", "#b5c1c9", "#2fcc4e" ];
      const colorMap = {};
      for(let i in knownDeviceIDs) {
        let id = knownDeviceIDs[i];
        console.log("id,i", id, i, i % colors.length);
        let color = colors[i % colors.length];
        colorMap[id] = color;
      }

      console.log("colormap", colorMap);

      state.colorMap = colorMap;

      return arr;
    };

    const request = () => {
      core.socket.emit("read", {}, ({ code, entities }) => {
        console.log("read <=", code, entities);
        state.records = prepare(entities);
      })
    };

    const save = () => {
      props.item.saveLocal.save();      
    };

    const connect = () => {
      // core.yehat.connectIO();
    };

    onMounted(() => {
      // state.unwatches.push(
      //   watch(props.item.websocketConfig, save, { deep: true })
      // )
      // core.socket.emit("read", {}, (a, b, c) => {
      //   console.log("read <=", a, b, c)
      // })
      request();
      console.log("shardlog userlist", props.item.c.userlist);
    });

    onBeforeUnmount(() => {
      // state.unwatches.map(fn => fn());
    });

    const more = () => {
      state.recordsWindow += 20;
    };

    const onE = (entity) => {
      state.records = [ ...prepare([ entity ]), ...state.records ];
    };

    watchEffect(onCleanup => {
      core.socket.on("e", onE);
      core.socket.emit("rjoin", { room: "log0" }, () => {});

      onCleanup(() => {
        core.socket.off("e", onE);
        core.socket.emit("rleave", { room: "log0" }, () => {});
      });
    });

    const jsonBox = reactive({
      show: false,
      r: null,
      key: null,
      //value: computed(() => jsonBox.r ? jsonBox.r[jsonBox.key] : ""),
      value: null,
      start: ({ value }/*{ r, key }*/) => {
        jsonBox.value = value;
        jsonBox.show = true;
      }
    });

    const showJSONBox = (item) => {
      jsonBox.start({ value: JSON.stringify(item, null, 2) });
    };

    return { yehat: core.yehat, save, connect, request, state, more, showJSONBox, jsonBox };
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
    height: 12px;
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

  ::v-deep(.q-table tr) {
    background: #1c1c1c;
    color: #eee;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: inline-block;
    margin-right: 10px;
    vertical-align: -2px;
  }

  .q-btn-group {
    white-space: nowrap;
  }
}

.caption {
  font-weight: 500;
}

.a {
  color: $grey-7;
  display: inline-block;
}

.v-pan-record {
  height: 20px;
}
</style>