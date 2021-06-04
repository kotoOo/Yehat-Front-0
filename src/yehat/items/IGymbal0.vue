<template>
  <div class="scene column">
    <header class="col-auto">GYMBAL MK 1</header>
    <div class="col row">
      <div class="row col working-area" v-touch-pan.mouse="pan">

        <div class="pitch-gauge row full-width">
          <div class="text-center">
            <div class="caption">Pitch</div>
            {{ item.gymbal.pitch }}
          </div>
          <q-space />
          <div class="text-center" style="width: 40px">
            <div class="caption">Yaw</div>
            {{ item.gymbal.yaw }}
          </div>
          <div 
            v-for="(item, key) of pitchGauge" :key="key" 
            :class="{ filled: item.filled, active: item.active, odd: item.odd }" class="pitch-gauge-cell"
            :style="{ transform: `translateX(${item.pos[0]}px) translateY(${item.pos[1]}px)` }"
          >
            {{ item.deg }}
          </div>
        </div>
      </div>

      <div style="flex: 0 0 40px; padding: 0 10px" v-touch-pan.mouse="panYaw">
        <div 
          v-for="(item, key) of yawGauge" :key="key" :class="{ filled: item.filled, active: item.active }" class="gauge-cell"
          :style="{ background: item.color }"
        >
          {{ item.deg }}
        </div>
      </div>
    </div>
    <div class="row">
      <div class="text-center">
        <div class="caption">Distance to Move</div>
        {{ item.gymbal.distance }}
      </div>
      <q-space />
      
    </div>

    <div class="distance-gauge" v-touch-pan.mouse="panDistance" style="flex: 0 0 40px">
      <div 
          v-for="(item, key) of distanceGauge" :key="key" :class="{ active: item.active }" class="distance-gauge-cell"
          :style="{ background: item.color, transform: `translateX(${item.pos[0]}px)` }"
        >
          {{ item.dist }}
        </div>
    </div>

    <Resizer :item="item" />
  </div>
</template>

<script>
import Resizer from "../ux/Resizer";
import { computed, reactive } from "vue";

export default {
  props: {
    item: Object
  },
  components: { Resizer },
  setup(props) {
    const gauge = (r, key) => computed(() => {
      return [ /* 13-positioned gymbal: half-sphere in front with zero at the central position, [ -90 .. 90 ] values 
                  output with 15 degree step */
        {
          color: "#70c624",
          deg: 90,
        },
        {
          color: "#70c624",
          deg: 75,
        },
        {
          color: "#70c624",
          deg: 60,
        },
        {
          color: "#3e8500",
          deg: 45,
        },
        {
          color: "#3e8500",
          deg: 30,
        },
        {
          color: "#3e8500",
          deg: 15,
        },
        {
          color: "#206100",
          deg: 0,
        },
        {
          color: "#0d4200",
          deg: -15,
        },
        {
          color: "#0d4200",
          deg: -30,
        },
        {
          color: "#0d4200",
          deg: -45,
        },
        {
          color: "#0b2400",
          deg: -60,
        },
        {
          color: "#0b2400",
          deg: -75,
        },
        {
          color: "#0b2400",
          deg: -90,
        }    
      ].map(item => {
        item.filled = r[key] >= item.deg;
        item.active = r[key] === item.deg;
        return item;
      })
    });

    const yawGauge = gauge(props.item.gymbal, 'yaw');

    const pitchGaugeF = (r, key) => computed(() => {
      return [ 
        0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345 
      ].map(deg => {
        // const d = (deg % 6) == 0 ? (
        //   (deg % 90) == 0 ? 80 : 70
        // ) : (
        //   75
        // );

        const d = 90;

        // const x = Math.round(Math.cos((deg - r[key]) / 180 * Math.PI + Math.PI/8) * d) + 100;
        // const y = Math.round(Math.sin((deg - r[key]) / 180 * Math.PI + Math.PI/8) * d) + 110;
        const x = Math.round(Math.cos((deg) / 180 * Math.PI + Math.PI/4) * d) + 100;
        const y = Math.round(Math.sin((deg) / 180 * Math.PI + Math.PI/4) * d) + 110;
        const item = {
          deg,        
          pos: [ x, y ],
          active: r[key] === deg,
          odd: deg % 30 == 15
        };
        return item;
      });
    });

    const pitchGauge = pitchGaugeF(props.item.gymbal, 'pitch');

    const state = reactive({
      panPitchStartAt: null,
      panYawStartAt: null,
      panDistanceStartAt: null
    });

    /*
      delta: { x: 3, y: 0 },
      direction: "right",
      distance: { x: 37, y: 3 },
      duration: 278,      
      isFinal: false,
      isFirst: false,      
      offset: { x: 37, y: -3 },
      position: { top: 651, left: 455 },
      mouse: true,
      touch: false,
      evt: MouseEvent,
    */
    const pan = (a) => {
      const { distance, offset, isFirst, isFinal } = a;

      if (isFirst) {
        state.panPitchStartAt = props.item.gymbal.pitch;
      }

      let newPitch = (Math.round((state.panPitchStartAt + offset.x / 2) / 15) * 15 + 360) % 360;
      // if (newPitch < -90) newPitch = -90;
      // if (newPitch > 90) newPitch = 90;

      props.item.gymbal.pitch = newPitch;
      
      if (isFinal) {
        console.log("pan", a);
        console.log("distance", distance);
      }
    };

    const panYaw = (a) => {
      const { distance, offset, isFinal, isFirst } = a;      

      if (isFirst) {
        state.panYawStartAt = props.item.gymbal.yaw;
      }

      let newYaw = Math.round((state.panYawStartAt - offset.y) / 15) * 15;
      if (newYaw < -90) newYaw = -90;
      if (newYaw > 90) newYaw = 90;

      props.item.gymbal.yaw = newYaw;
      
      if (isFinal) {
        console.log("pan", a);
        console.log("distance", distance);
      }
    };

    const distanceGaugeF = (r, key) => computed(() => {
      return Array.from(Array(33).keys()).map(dist => {

        return {
          dist,
          color: "#701c22",
          pos: [
            dist * 6, 0
          ],
          active: dist == r[key]
        };
      }).filter(item => {
        if (item.dist == 0) return true;
        // if (item.dist == 31) return true;
        if (item.dist <= r[key]) return true;
        return false;
      });
    });

    const distanceGauge = distanceGaugeF(props.item.gymbal, 'distance');

    const panDistance = (a) => {
      const { distance, offset, isFinal, isFirst } = a;      

      if (isFirst) {
        state.panDistanceStartAt = props.item.gymbal.distance;
      }

      let newDistance = state.panDistanceStartAt + Math.round(offset.x / 8);
      if (newDistance > 32) newDistance = 32;
      if (newDistance < 0) newDistance = 0;

      props.item.gymbal.distance = newDistance;
      
      if (isFinal) {
        console.log("pan", a);
        console.log("distance", distance);
      }
    };

    return { pan, yawGauge, panYaw, pitchGauge, distanceGauge, panDistance };
  }
};
</script>

<style lang="scss" scoped>
.scene {
  background: #0e051f;
  width: 100%;
  height: 100%;
  border-radius: 3px;
  box-shadow: 1px 1px 9px 3px rgba(0, 0, 0, 0.34);
  color: white;

  font-size: 12px;

  .working-area {
    user-select: none;
  }
}

.gauge-cell {
  width: 20px;
  height: 16px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;

  &.active {
    background: #ebb01c !important;
    border: 1px solid #fff;

    color: #50177b;
  }
}

.pitch-gauge-cell {
  width: 24px;
  height: 24px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;

  position: absolute;
  background: #438cc4 !important;
  border: 1px solid #092346;
  border-radius: 12px;

  transition: transform 0.3s;
  left: 0;
  top: 0;



  &.odd {
    background: #346a99 !important;
  }

  &.active {
    background: #ebb01c !important;
    border: 1px solid #fff;

    color: #50177b;
  }
}

.distance-gauge {
  position: relative;

  .distance-gauge-cell {
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
    }
  }
}
</style>