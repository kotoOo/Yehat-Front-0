<template>
  <div class="scene widget">
    <header class="widget-caption">Unit DS</header>
    <div>[ Connected ]: {{ item.c.target.meta.name }}</div>
    <div class="row">
      <q-btn style="background: #346a99" push>MOVE</q-btn>
      <q-space/>
      <div v-if="state.approaching">APPR <span v-html="formatV3Lvl2(state.approaching)" /></div>
    </div>
    <div>
      <div class="caption">Paths</div>

      <div class="path-gauge q-mb-xs" v-touch-pan.mouse="panPath" style="flex: 0 0 40px">
        <div 
            v-for="(item, key) of pathGauge" :key="key" :class="{ active: item.active }" class="path-gauge-cell"
            :style="{ background: item.color, transform: `translateX(${item.pos[0]}px)` }"
          >
          {{ item.n }}
        </div>
      </div>
      <q-btn icon="add" color="primary" dense push size="10px" @click="addPath" />
    </div>
    <div>
      <div class="caption">Points</div>

      <div class="path-gauge q-mb-xs" v-touch-pan.mouse="pointsGauge.pan" style="flex: 0 0 40px">
        <div 
            v-for="(item, key) of pointsGauge.items" :key="key" :class="{ active: item.active }" class="path-gauge-cell"
            :style="{ background: item.color, transform: `translateX(${item.pos[0]}px)` }"
          >
          {{ item.n }}
        </div>
      </div>
      <q-btn icon="add" color="primary" dense push size="10px" @click="addPoint" />
    </div>
  </div>
</template>

<script>
import { reactive, computed } from "vue";
import { Notify } from "quasar";

const formatV3 = (v, { dig } = { dig: 1 }) => {
  return v.map(x => {
    const k = Math.pow(10, dig);
    return Math.floor(x * k) / k;
  });
};

const formatV3Lvl2 = (v, { dig } = { dig: 1 }) => formatV3(v, { dig }).map(n => `<span class="ye-co">${n}</span>`).join("");

export default {
  props: {
    item: Object
  },
  filters: { formatV3 },
  setup(props) {
    const target = props.item.c.target;

    const state = reactive({ /* we don't yet powerful to refactor a gauge into a separate control, eh? */
      panPathStartAt: null,
      panPointStartAt: null,
      approaching: computed(() => props.item.c.gymbal.approaching)
    });

    /* Path Gauge */
    const pathGaugeF = (r, key, collectionR, collectionKey) => computed(() => {
      const max = collectionR[collectionKey].length;

      return Array.from(Array(max || 1).keys()).map(n => {
        return {
          n,
          color: "#701c22",
          pos: [
            n * 6, 0
          ],
          active: n == r[key]
        };
      }).filter(item => {
        if (item.n == 0) return true;
        if (item.n == max-1) return true;
        if (item.n <= r[key]) return true;
        return false;
      });
    });

    const panPath = (a) => {
      const { distance, offset, isFinal, isFirst } = a;      

      if (isFirst) {
        state.panPathStartAt = props.item.itemPropConfig.activePath;
      }

      let newN = state.panPathStartAt + Math.round(offset.x / 8);
      if (newN > target.unit.paths.length-1) newN = target.unit.paths.length-1;
      if (newN < 0) newN = 0;

      props.item.itemPropConfig.activePath = newN;
    };

    

    /* Points Gauge */
    const pointsGaugeF = (r, key, collectionR, collectionKey) => computed(() => {
      const max = collectionR[collectionKey].length;

      const pan = (a) => {
        const { distance, offset, isFinal, isFirst } = a;      

        if (isFirst) {
          state.panPointsStartAt = props.item.itemPropConfig.activePoint;
        }

        let newN = state.panPointsStartAt + Math.round(offset.x / 8);
        if (newN > max-1) newN = max-1;
        if (newN < 0) newN = 0;

        props.item.itemPropConfig.activePath = newN;
      };

      return {
        pan, 
        items: Array.from(Array(max || 1).keys()).map(n => {
          return {
            n,
            color: "#701c22",
            pos: [
              n * 6, 0
            ],
            active: n == r[key]
          };
        }).filter(item => {
          if (item.n == 0) return true;
          if (item.n == max-1) return true;
          if (item.n <= r[key]) return true;
          return false;
        })
      };
    });    

    /* Instanciation */
    const pathGauge = pathGaugeF(props.item.itemPropConfig, 'activePath', props.item.c.target.unit, 'paths');
    const pointsGauge = computed(() => {
      const activePath = props.item.itemPropConfig.activePath;
      if (activePath == null) {
        return [];
      } else {
        return pointsGaugeF(props.item.itemPropConfig, 'activePoint', props.item.c.target.unit.paths[activePath], 'points');
      }
    });

    const addPath = () => {
      target.unit.addPath();
      props.item.itemPropConfig.activePath = target.unit.paths.length-1;

      Notify.create("Path added.");
    };

    const addPoint = () => {
      console.log("Soon.");
    };

    return { pathGauge, panPath, addPath, pointsGauge, addPoint, state, formatV3, formatV3Lvl2 };
  }
};
</script>

<style lang="scss" scoped>
.path-gauge {
  position: relative;
  height: 24px;

  .path-gauge-cell {
    width: 24px;
    height: 24px;

    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    position: absolute;
    top: 0;
    left: 0;
    
    background: #701c22 !important;
    border: 1px solid #380a11;

    // transition: transform 0.3s;
    left: 0;
    top: 0;

    // &.odd {
    //   background: #346a99 !important;
    // }

    &.active {
      background: #ebb01c !important;
      border: 1px solid #fff;

      color: #50177b;
      z-index: 1;
    }
  }
}

::v-deep(.ye-co) {
  display: inline-block;
  width: 30px;
  height: 24px;

  background: #2c0b4f;
  text-align: right;
}
</style>