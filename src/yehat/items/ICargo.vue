<template>
  <div class="widget scene cargo column no-wrap">
    <header class="caption col-auto q-mx-xs">Cargo</header>
    <div class="inventory col" @zdrop="onDrop" :class="{
        hovered: zw.hoveredInventory == item, active: !!zw.dragged
      }">      
      <!-- <component 
        v-for="(item, key) of cargo.itemsAvailable" :key="'item'+key" :is="item.item.baseComponent" :style="item.cargoStyle"
        :item="item" :height="zw.space.itemImageSize" @click="itemClick(item)" class="z-item"
        @mousedown.capture.native="(e, a) => take(item, e, a)"
      /> -->
      <component 
        v-if="cargo.activeItem" :is="cargo.activeItem.item.baseComponent" :style="cargo.activeItem.cargoStyle"
        :item="cargo.activeItem" @click="itemClick(cargo.activeItem)" class="z-item"
        @mousedown.capture.native="(e, a) => take(cargo.activeItem, e, a)"
      />

      <!-- <div v-if="cargo.activeItem">{{ cargo.activeItem.cargoStyle }}</div> -->
    </div>
    <div class="cargo-nav col-auto row no-wrap q-mx-xs">
      <q-btn push icon="keyboard_arrow_left" size="10px" dense :class="{ hidden: !item.cargo.cursor }" @click="item.cargo.cursor--" />
      <div class="col">
        <div v-if="cargo.itemsAvailable.length > 1">
          {{ item.cargo.cursor + 1 }} of {{ cargo.itemsAvailable.length }}
        </div>
        <div v-if="cargo.itemsAvailable.length && cargo.itemsAvailable[item.cargo.cursor || 0]">
          {{ cargo.itemsAvailable[item.cargo.cursor || 0].meta.name }}
        </div>
        <div v-if="!cargo.itemsAvailable.length">Empty</div>
      </div>
      <q-btn         
        push icon="keyboard_arrow_right" size="10px" dense :class="{ hidden: item.cargo.cursor >= cargo.itemsAvailable.length - 1 }" 
        @click="item.cargo.cursor++"
      />
    </div>
  </div>
</template>

<script>
import { reactive, computed, inject, watch } from "vue";
import bus from "boot/bus";

export default {
  props: {
    item: Object
  },
  setup(props) {
    const zw = inject("zw");

    const cargo = reactive({
      itemsAvailable: computed(() => {
        const a = zw.itemsTable.filter(item => item.located && item.located.rel == props.item.id).map(item => {
          if (!item.cargoStyle) {
            const cargoStyle = {
              width: '128px',
              height: '128px',
              flex: '0 0 128px',
              overflow: 'hidden'
            };
            
            item['cargoStyle'] = cargoStyle;
          }
          return item;
        });

        return a;
      }),
      activeItem: computed(() => {
        return props.item.cargo.cursor === null ? cargo.itemsAvailable[0] : cargo.itemsAvailable[props.item.cargo.cursor];
      })
    });

    watch(() => cargo.itemsAvailable, a => {
      console.log("watched itemsavaiable recomputed");
      if (a.length && props.item.cargo.cursor == null) props.item.cargo.cursor = 0;
      if (a.length && props.item.cargo.cursor > a.length-1) {
        console.log("watched escape");

        props.item.cargo.cursor--;
      }
    });

    const onDrop = (e) => {
      console.log("DRop!", e);
      //const { item } = e.detail;
      const item = zw.dragged;

      if (item.located) item.located.rel = props.item.id;

      if (item.saveLocal) item.saveLocal.save();

      item.drag.onDrop();
      item.drag.onDrop = () => {};

      console.log("emitting cargo-drop");
      bus.emit("cargo-drop", { cargo: props.item, item, count: cargo.itemsAvailable.length });
    };

    const itemClick = (item) => {
      console.log("Item clicked", item);
    };

    const take = (item, e, a) => {
      console.log("take in ICargo", item, e, a);
      if (item.drag && !zw.dragged) {
        zw.dragged = item;
        item.drag.pos = [ props.item.position[0], props.item.position[1] ];
        item.drag.active = true;
        console.log("Dragging from cargo:", JSON.stringify(item.drag));
      } 
    };

    return { zw, cargo, onDrop, itemClick, take };
  }
};
</script>

<style lang="scss" scoped>
.inventory {
  background: #777;
  height: 128px;
  border: 1px solid transparent;
  overflow: hidden;
}

.hovered {
  // border: 1px solid red;
}

.active {
  border: 1px dashed white;
}

.z-item {
  transform: scale(0.8);

  overflow: hidden;
  position: relative;
}

// .cargo-nav {
//   font-size: 12px;
  
//   .q-btn {
//     opacity: 0;
//     pointer-events: none;
//   }
// }

// .btn { 
//   opacity: 0;
//   pointer-events: none;
// }

.some-items {
  .q-btn {
    opacity: 1;
    pointer-events: all;
  }
}

.inventory ::v-deep(.xs-hidden) {
  display: none;
}
</style>