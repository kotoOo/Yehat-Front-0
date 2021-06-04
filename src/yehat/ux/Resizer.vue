<template>
  <div v-touch-pan.prevent.capture.mouse="handleResize" class="resizer" />
</template>

<script>
import { inject, reactive } from "vue";

export default {
  props: {
    item: Object
  },
  setup(props) {
    const zw = inject("zw");

    const state = reactive({
      delta: [ 0, 0 ],
      savedSize: [ 0, 0 ]
    });

    const handleResize = ({ isFirst, isFinal, delta }) => {
      if (isFirst) {
        state.delta = [ 0, 0 ];
        state.savedSize = props.item.located.size 
      }
      
      if (!isFirst && !isFinal) {
        state.delta = [ state.delta[0] + delta.x, state.delta[1] + delta.y ];
        const k = zw.space.grid;

        props.item.located.size = [
          state.savedSize[0] + Math.floor(state.delta[0] / k[0]),
          state.savedSize[1] + Math.floor(state.delta[1] / k[1])
        ];
      }
    };

    return { handleResize };
  }
};
</script>

<style lang="scss" scoped>
.resizer {
  width: 8px;
  height: 8px;
  background: orangered;
  position: absolute;
  right: 0;
  bottom: 0;
  cursor: pointer;
  border-radius: 0 0 3px 0;
}
</style>