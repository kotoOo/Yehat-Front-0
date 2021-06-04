<template>
  <div class="slot inventory" @zdrop="onDrop" :class="{
      hovered: zw.hoveredInventory == item, active: !!zw.dragged
    }">      
    <!-- <component 
      v-for="(item, key) of cargo.itemsAvailable" :key="'item'+key" :is="item.item.baseComponent" :style="item.cargoStyle"
      :item="item" :height="zw.space.itemImageSize" @click="itemClick(item)" class="z-item"
      @mousedown.capture.native="(e, a) => take(item, e, a)"
    /> -->
    <component 
      v-if="item" :is="item.item.baseComponent" :item="item"
      class="z-item" @mousedown.capture.native="(e, a) => take(item, e, a)"
    />

    <!-- <div v-if="cargo.activeItem">{{ cargo.activeItem.cargoStyle }}</div> -->
  </div>
</template>

<script>
import { inject } from "vue";

export default {
  props: {
    owner: Object,
    item: Object
  },
  setup(props, { emit }) {
    const zw = inject("zw");

    const onDrop = (e) => {
      console.log("Drop to slot.", e);

      if (props.item) {
        console.log("dropped", props.item);
        props.item.located.rel = zw.tableID;
        props.item.located.pos = [ ...zw.dragged.located.pos ];
        if (props.item.saveLocal) props.item.saveLocal.save();
      }

      //const { item } = e.detail;
      const item = zw.dragged;

      if (item.located) item.located.rel = props.owner.id;
      if (item.saveLocal) item.saveLocal.save();

      emit("added", item);

      // console.log("emitting cargo-drop");
      // bus.emit("cargo-drop", { cargo: props.item, item, count: cargo.itemsAvailable.length });
    };

    const take = (item, e, a) => {
      console.log("take in slot", item, e, a);
      if (item.drag && !zw.dragged) {
        zw.dragged = item;
        item.drag.pos = [ props.owner.position[0], props.owner.position[1] ];
        item.drag.active = true;
        item.drag.onDrop = () => emit("clear");
        console.log("Dragging from slot:", JSON.stringify(item.drag));
      } 
    };

    return { zw, onDrop, take };
  } 
}
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
  width: 128px;
  height: 128px;
  flex: 0 0 128px;
  overflow: hidden;

  transform: scale(0.8);

  overflow: hidden;
  position: relative;
}
</style>