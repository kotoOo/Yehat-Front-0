<template>
  <div class="widget column">
    <header class="widget-header col-auto">Users</header>    
    <div class="col-auto row q-gutter-x-sm">
      <div>Total: {{ state.total }}</div>
      <div>User: {{ state.user }}</div>
      <div>Guest: {{ state.guest }}</div>
    </div>
    <VectorPan v-model="state.active" :max="item.userlist.items.length - 1" />
    <div 
      class="widget-body col" v-touch-pan.mouse.prevent="() => {}" ref="box" 
      @mousewheel="mousewheel"
    >
      <div 
        v-for="({ user, style, key, online }) of state.renderUsers" :key="key" 
        class="user" :style="style" @click="onUserClick(user, key)"
      >
        <div class="online-indicator" :class="{ online }" />
        <div class="name" v-if="user">{{ user.user0.name }}</div>
      </div>
      
      <q-resize-observer @resize="resize" />
      <!-- <q-list class="fit scroll" dense>
        <q-item v-for="(item, key) of item.userlist.items" :key="key" dense>
          <q-item-section side>
            <div class="dot" :class="{ online: item.user0vtm.online }" />
          </q-item-section>
          <q-item-section>
            <div>Name: {{ item.user0.name }}</div>
            <div>UserID: {{ item.id }}</div>
            <div>DeviceIDs: {{ item.user0.deviceIDs }}</div>
          </q-item-section>
        </q-item>
      </q-list> -->
    </div>

    <Resizer :item="item" />
  </div>
</template>

<script>
import { reactive, computed, onMounted, watchEffect, ref } from "vue";
import { Notify } from "quasar";

import { Component } from "../ecs";
import { Located, Meta, Connections, Item, loadItem, SaveLocal } from "../basics0/index";
import Resizer from "../ux/Resizer";
import VectorPan from "../ux/VectorPan0";
import bus from "boot/bus";

const UserList = Component("userlist", {
  items: []
});

export const makePLUserList = ({ id, rel, pool }) => { 
  return loadItem([
    UserList(),
    Located({
      rel,
      pos: [ 10, 55, 0 ],
      size: [ 10, 15 ]
    }),
    Connections([

    ]),
    Item({
      baseComponent: "PLUserList"
    }),
    Meta({
      type: "Dash",
      name: "PropertyList Area UserList Lvl 1"
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
  components: { Resizer, VectorPan },
  setup(props) {
    const box = ref(null);
    const state = reactive({
      total: 0,
      user: 0,
      guest: 0,
      active: 0,
      boxHeight: null,
      renderUsers: computed(() => {
        // const y = 

        const capa = Math.floor(state.boxHeight / 40);

        const start = state.active - Math.floor((capa-1)/2);
        const end = state.active + Math.floor((capa-1)/2);
        
        const a = [];
        const currentStyle = {
          // border: "1px solid #8f2b00",
          background: "#cc4b00"
        };
        const commonStyle = {
          // border: "1px solid #11119c",
          background: "#2626ba"
        };
        const nullStyle = {
          // border: "1px dotted #11119c",
          background: "transparent"
        };
        for(let i = start; i <= end; i++) {
          if (i < 0 || i >= props.item.userlist.items.length) {
            a.push({
              user: null,
              style: i == state.active ? currentStyle : nullStyle,
              key: i,
              online: false
            });
            continue;
          }

          a.push({
            user: props.item.userlist.items[i],
            style: i == state.active ? currentStyle : commonStyle,
            key: i,
            online: props.item.userlist.items[i].user0vtm.online
          });
        }

        // a.sort((a, b) => {
        //   if (a.online && !b.online) return 1;
        //   if (!a.online && b.online) return -1;
        //   return 0;
        // });

        return a;
      })
    });

    onMounted(() => {
      const { height } = box.value.getBoundingClientRect();
      state.boxHeight = height;

      core.socket.emit("userlist", {}, ({ code, details, items }) => {
        console.log("<= userlist", items);
        if (code == "ok") {
          props.item.userlist.items = items;
        } else {
          Notify.create(details);
        }
      });
    });

    const resize = ({ height }) => {
      state.boxHeight = height;
    };

    const onStat0 = ({ name, value }) => {
      if (name == "online0") {
        state.total = value.total;
        state.user = value.user;
        state.guest = value.guest;
      }

      console.log("stat0 update", value.total, value.user);
    };

    watchEffect(onCleanup => {
      core.socket.on("stat0", onStat0);
      core.socket.emit("rjoin", { room: "online0" }, () => {});

      onCleanup(() => {
        core.socket.off("stat0", onStat0);
        core.socket.emit("rleave", { room: "online0" }, () => {});
      });
    });

    const onUserClick = (user, key) => {
      if (key < 0 || key >= props.item.userlist.items.length) return;

      if (state.active != key) {
        state.active = key;
      }
      bus.emit("showEntity", { id: user.id });
    };
    
    const mousewheel = (e) => {
      const delta = Math.sign(event.deltaY);
      const na = state.active + delta;
      if (na < 0 || na >= props.item.userlist.items.length) return;
      state.active = na;
    };
    
    return { state, box, resize, onUserClick, mousewheel };
  }  
};
</script>

<style lang="scss" scoped>
.widget {
  color: white;

  .dot {
    width: 8px;
    height: 8px;
    display: inline-block;
    background: #3f454a;
  }

  .user {
    height: 40px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;

    .name {
      position: relative;
      z-index: 1;
    }
    
    .online-indicator {
      position: absolute;
      width: 22px;
      height: 100%;
      top: 0;
      left: -22px;
      transform: skewX(-45deg);
      -webkit-backface-visibility: hidden;

      background: rgb(58, 58, 58);

      &.online {
        background: #3e8500;
      }
    }

    
  }
}
</style>