<template>
  <div class="widget loader">
    <div class="scene column no-wrap">
      <div class="la-loader"></div>
      <q-space />
      <div class="timer row justify-center items-end">
        <div class="seconds q-mr-xs">{{ state.elapsed[2] }} : {{ state.elapsed[1] }}</div>
        <div class="ms">{{ state.elapsed[0] }}</div>
      
        <q-toolbar dense style="min-height: 20px" class="justify-center">
          <template v-if="item.timer.state == 0">
            <q-btn @click="start" dense size="12px">Start</q-btn>
          </template>
          <template v-else-if="item.timer.state == 1">
            <q-btn @click="pause" dense size="12px">Pause</q-btn>
            <q-btn @click="stop" dense size="12px">Stop</q-btn>
          </template>
          <template v-else-if="item.timer.state == 2">
            <q-btn @click="resume" dense size="12px">Resume</q-btn>
            <q-btn @click="stop" dense size="12px">Stop</q-btn>
          </template>
          <template v-else-if="item.timer.state == 3">
            <q-btn @click="restart" dense size="12px">Restart</q-btn>
          </template>
        </q-toolbar>
      </div>
      <q-linear-progress v-if="item.timer.state == 1" indeterminate class="progress-ind" />
      <div v-else style="flex: 0 0 4px" />
      <q-toggle v-model="app.loader.dontClose" class="color-mask" style="font-size: 8px" label="Don't close" size="8px" />
    </div>    
  </div>
</template>


<script>
// import { useARI } from "/src/compo/ari";
import { inject, computed, reactive } from "vue";

export default {
  props: {
    item: Object
  },
  setup(props) {
    const app = inject("app");

    app.loader.start = () => {
      app.loader.show = true;
      app.loader.dtStart = +new Date();
    };    

    app.loader.stop = () => {
      app.loader.dtStop = +new Date();
    };

    app.loader.close = () => {
      app.loader.show = false;
      console.log("Loader closed.");
    };

    app.loader.save = () => {
      const { dontClose } = app.loader;

      localStorage.laLoader = JSON.stringify({
        dontClose
      });
    };

    const onClose = () => {
      app.loader.stop();
      app.loader.close();      
    };

    const dontClose = computed({
      get: () => app.loader.dontClose,
      set: v => {
        app.loader.dontClose = v;
        app.loader.save();
      }
    });

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

    const state = reactive({
      elapsed: computed(() => {
        const a = props.item.timer.elapsedCom;
        
        const b = Math.floor(a / 1000);
        const sec = b % 60;
        const c = (b - sec) / 60;
        const min = c % 60;
        const d = (c - min) / 60;


        return [ to3Digits(a % 1000), ...[ sec, min, d ].map(to2Digits) ];
      })
    });

    const start = () => {
      console.log("item", props.item);
      props.item.timer.start();
    }

    const pause = () => {
      props.item.timer.pause();
    };

    const stop = () => {
      props.item.timer.stop();
    };

    const resume = () => {
      props.item.timer.resume();
    };

    const restart = () => {
      props.item.timer.state = 0;

      props.item.timer.start();
    };

    return { app, onClose, state, start, pause, stop, resume, restart };
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
}

.la-loader {
  width: 128px;
  height: 128px;
  flex: 0 0 128px;
  // background: url("~assets/la-progress-01.gif") no-repeat right center / contain;
  image-rendering: pixelated;
  margin: 0 auto;  
}

.la-loader-show {
  animation: showloader forwards 0.4s;
}

.progress-ind {
  margin: 0 auto;
  width: 100px;
}

.color-mask {
  opacity: 0.1;
  color: white;
}

.timer {
  font-size: 12px;


  .ms {
    font-size: 9px;
    margin-bottom: 1px;
  }
}

@keyframes {
  0% {
    transform: translateY(100vh);
  }

  100% {
    transform: translateY(0);
  }
}
</style>