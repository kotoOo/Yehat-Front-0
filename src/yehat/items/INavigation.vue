<template>
  <div class="navigation scene column no-wrap q-pa-sm">
    <div class="col-auto caption">CAMERA</div>
    <div class="col-auto row">
      <div class="col-6">X {{ zw.camera.cx }}</div>
      <div class="col-6">Y {{ zw.camera.cy }}</div>
    </div>

    <q-toggle v-model="item.config.showJSON" class="col-auto" size="small">
      JSON
    </q-toggle>
    <div v-if="item.config.showJSON" class="scroll col-4">
      {{ zw.camera }}
    </div>
    <div class="scroll col">
      {{ zw.debug }}
      {{ zw.dtLastTouchRange }}
    </div>
    <Resizer :item="item" />
  </div>
</template>

<script>
import Resizer from "../ux/Resizer";
import { inject, computed } from "vue";

export default {
  props: {
    item: Object,
  },
  components: { Resizer },
  setup() {
    const zw = inject("zw");

    return { zw };
  }
};
</script>

<style lang="scss" scoped>
.scene {
    background: #0e051f;
  // width: 264px;
  // height: 376px;
  width: 100%;
  height: 100%;
  border-radius: 3px;
  box-shadow: 1px 1px 9px 3px rgba(0, 0, 0, 0.34);
  color: white;

  font-size: 12px;
}
</style>