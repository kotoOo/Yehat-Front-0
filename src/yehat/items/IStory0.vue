<template>
  <div class="scene story column no-wrap">
    <div class="col-auto caption q-mx-xs">Story</div>
    <q-list v-if="!item.story.done" class="col scroll" dense>
      <q-item v-for="(frame, key) of item.story.frames" :key="key" dense style="padding-left: 2px; padding-right: 2px;">
        <q-item-section 
          v-if="frame.duration" side style="flex: 0 0 60px" class="justify-center xs-hidden"
        >{{ toTimerData(frame.duration)[2] }} : {{ toTimerData(frame.duration)[1] }}</q-item-section>
        <q-item-section v-else side style="flex: 0 0 60px" class="justify-center xs-hidden">
          <q-icon name="keyboard_arrow_right" :style="{ opacity: key == item.story.stage ? 1 : 0 }" />
        </q-item-section>
        <q-item-section>{{ frame.caption || "- No caption " }}</q-item-section>
        <q-item-section v-if="item.timer.state == 1 || item.timer.state == 2" side>
          <q-checkbox v-model="frame.done" dense size="md" keep-color color="amber-8" style="pointer-events: none" />
        </q-item-section>
      </q-item>
    </q-list>
    <q-space />
    <div class="col-auto column no-wrap q-pb-xs">      
      <div class="timer" v-if="!item.story.done">
        <div class="row justify-center items-end">
          <div class="seconds q-mr-xs">{{ state.elapsed[2] }} : {{ state.elapsed[1] }}</div>
          <div class="ms">{{ state.elapsed[0] }}</div>
        </div>
      
        <q-toolbar dense style="min-height: 20px" class="justify-center">
          <template v-if="item.timer.state == 0">
            <q-btn @click="start" dense size="12px" color="amber-9">Start</q-btn>
          </template>
          <template v-else-if="item.timer.state == 1">
            <q-btn @click="item.timer.pause" dense size="12px">Pause</q-btn>
            <q-btn @click="item.timer.stop" dense size="12px">Stop</q-btn>
          </template>
          <template v-else-if="item.timer.state == 2">
            <q-btn @click="item.timer.resume" dense size="12px">Resume</q-btn>
            <q-btn @click="stop" dense size="12px">Stop</q-btn>
          </template>
          <template v-else-if="item.timer.state == 3">
            <q-btn @click="restart" dense size="12px">Restart</q-btn>
          </template>
        </q-toolbar>
      </div>
      <div v-else>
        <div class="text-center">
          <div class="q-mb-xs">WELL DONE</div>
          <div class="text-grey-1">
            Your time: 
            <span class="text-white">{{ toTimerData(item.story.duration)[2] }}</span> : 
            <span class="text-white">{{ toTimerData(item.story.duration)[1] }}</span>
          </div>
        </div>

        <q-toolbar dense style="min-height: 20px" class="justify-center">
          <q-btn @click="restart" dense size="12px">Restart</q-btn>
        </q-toolbar>
      </div>
      
      <Resizer :item="item" />
    </div>
  </div>
</template>

<script>
import Resizer from "../ux/Resizer";
import { reactive, watch, inject, computed, onMounted, onBeforeUnmount, watchEffect } from "vue";
import bus from "boot/bus";

export default {
  props: {
    item: Object
  },
  components: { Resizer },
  setup(props) {
    const zw = inject("zw");

    const to2Digits = (n) => {
      let s = "" + n;
      while (s.length < 2) s = '0'+s;
      return s;
    };

    const to3Digits = (n) => {
      let s = "" + n;
      while (s.length < 3) s = '0'+s;
      return s;
    };

    const toTimerData = (a) => {
      const b = Math.floor(a / 1000);
      const sec = b % 60;
      const c = (b - sec) / 60;
      const min = c % 60;
      const d = (c - min) / 60;


      return [ to3Digits(a % 1000), ...[ sec, min, d ].map(to2Digits) ];
    };
    
    const state = reactive({
      stageA: 0,
      stageB: 0,
      cargoID: null,
      cargoItems: computed(() => zw),
      elapsed: computed(() => toTimerData(props.item.timer.elapsedCom))
    });

    const storyStepDone = ({ now = +new Date() } = {}) => {
      const { stage } = props.item.story;
      if (stage >= props.item.story.frames.length) return;
      
      const completedStagesDuration = props.item.story.frames.reduce((a, v) => {
        if (!v.done) return a;
        return a + v.duration;
      }, 0);

      props.item.story.frames[stage].done = true;
      props.item.story.frames[stage].dtDone = now;
      props.item.story.frames[stage].duration = props.item.timer.elapsed({ now }) - completedStagesDuration;
      if (stage < props.item.story.frames.length - 1) {
        props.item.story.frames[stage+1].dtStart = now;
        props.item.story.stage++;
      } else {
        props.item.story.done = true;        
        props.item.story.duration = props.item.timer.elapsed({ now });        
        props.item.timer.stop({ now });
      }
    };

    watch(() => zw.panning, v => {
      if (props.item.story.stage == 0 && props.item.timer.state == 1) {
        if (v && state.stageA == 0) state.stageA = 1;
        if (!v && state.stageA == 1) {
          storyStepDone();

          state.stageA = 2; /* ? */
        }
      }
    });

    watch(() => zw.dragged, v => {
      // console.log("v", v);
      if (props.item.story.stage == 1 && props.item.timer.state == 1) {
        if (v && state.stageB == 0) state.stageB = 1;
        if (!v && state.stageB == 1) {
          storyStepDone();

          state.stageB = 2; /* ? */
        }
      }
    });

    watch(() => zw.cargo, v => {
      state.cargoID = v.id;
      console.log("[IStory0] Cargo detected: "+v.id);
    }, { immediate: true });

    const cargoDrop = ({ cargo, item, count } ) => {
      console.log("[card-drop]", item, count);
      if (props.item.story.stage == 2) {
        storyStepDone();
        return;
      };

      if (props.item.story.stage == 3 && count == 2) {
        storyStepDone();
        return;
      };
    };

    watchEffect(onCleanup => {
      bus.on("cargo-drop", cargoDrop);

      onCleanup(() => bus.off("cargo-drop", cargoDrop));
    });

    const start = () => {
      // console.log("item", props.item);
      const now = +new Date();
      props.item.timer.start({ now });
      props.item.story.frames[0].dtStart = now;
    }

    const restart = () => {
      props.item.timer.state = 0;
      props.item.story.stage = 0;
      props.item.story.done = false;
      props.item.story.frames.forEach(frame => {
        frame.done = false
        frame.dtStart = null;
        frame.dtEnd = null;
        frame.duration = null;
      });

      props.item.timer.start();
    };

    return { zw, state, start, restart, toTimerData, story: props.item.story };
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

.timer {
  font-size: 12px;


  .ms {
    font-size: 9px;
    margin-bottom: 1px;
  }
}
</style>