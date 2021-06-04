<template>
  <div class="vector-pan row" ref="self">
    <div ref="self" class="col" v-touch-pan.mouse.prevent="pan" >
      <div v-for="(item, key) of vPan.items" :key="key" class="n" :style="item.style">
        {{ item.caption }}
      </div>
      <div class="n value text-center" :style="vPan.current.style">{{ vPan.current.caption }}</div>
      <q-resize-observer @resize="({ width }) => vPan.width = width" />
    </div>
    <div v-if="hSens" class="col-auto q-pl-sm" v-touch-pan.mouse.prevent="panHS" >
      H.SENS
    </div>
  </div>
</template>

<script>
import { reactive, computed, onMounted, ref } from "vue";

export default {
  props: {
    min: { type: Number, default: 0 },
    max: Number,
    value: Number,
    hSens: Boolean
  },
  setup(props, { emit }) {
    const self = ref(null);
    const vPan = reactive({
      width: 0,
      size: computed(() => props.max - props.min + 1),
      items: computed(() => {
        if (!vPan.size) return [];

        const steps = Math.min(Math.floor(vPan.width / 30), 2);
        const count = Math.min(vPan.size, steps);
        const step = vPan.size / count;

        console.log("vPan size, steps, count, step", vPan.size, steps, count, step);

        return [ ...Array(count) ].map((nothing, index) => {
          //const vHere = Math.round(step * (index + index/(count-1) ));

          //lerp(0, props.max, index / (count-1))
          const vHere = index ? Math.round(props.max * index / (count-1)) : props.min;
          

          let opacity = (index == 0 || vHere == props.max || vHere == props.value) ? 1 : 0.2;

          if (opacity != 1 && Math.abs(vHere - props.value) < step) {
            opacity = 1 - (Math.abs(vHere - props.value) / step) * 0.8;
          }

          const xMax = vPan.width - 20;
          const x = Math.round(vHere / props.max * xMax * 16) / 16;

          return {
            caption: vHere,
            style: {
              opacity, transform: `translateX(${x}px)`
            }
          };
        });
      }),
      active: false,
      panStartValue: null,
      current: computed(() => {
        if (!vPan.size) return [];
        const xMax = vPan.width - 20;
        const x = props.value / props.max * xMax;
        return {
          caption: ""+props.value,
          style: {
            transform: `translateX(${x}px)`,
            border: "1px solid #8f2b00",
            background: "#cc4b00"
          },          
        };
      })
    });

    const pan = ({ isFirst, isFinal, offset }) => {
      if (isFirst) {
        vPan.panStartValue = props.value;
        vPan.active = true;
      }
      
      const newValue = Math.floor(vPan.panStartValue + offset.x / 8);
      if (newValue != props.value) {
        if (newValue > props.max) {
          emit("input", props.max);
        } else if (newValue < props.min) {
          emit("input", props.min);
        } else {
          emit("input", newValue);
        }
      }

      if (isFinal) {
        vPan.active = false;
      }

      // console.log("offset", offset);
    };

    const panHS = ({ isFirst, isFinal, offset }) => {
      if (isFirst) {
        vPan.panStartValue = props.value;
        vPan.active = true;
      }
      
      const newValue = Math.floor(vPan.panStartValue + offset.x);
      if (newValue != props.value) {
        if (newValue > props.max) {
          emit("input", props.max);
        } else if (newValue < props.min) {
          emit("input", props.min);
        } else {
          emit("input", newValue);
        }
      }

      if (isFinal) {
        vPan.active = false;
      }

      // console.log("offset", offset);
    };

    onMounted(() => {
      const { width } = self.value.getBoundingClientRect();
      vPan.width = width - (props.hSens ? 56 : 0);
    });

    return { vPan, pan, panHS, self };
  } 
}
</script>

<style lang="scss" scoped>
.vector-pan {
  display: relative;
  cursor: pointer;
  height: 20px;

  .n {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #11119c;
    background: #2626ba;
    color: white;
    width: 20px;
    height: 20px;
  }
}
</style>