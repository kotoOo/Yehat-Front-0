<template>
  <div>
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
</template>

<script>
export default {
  setup(props, { emit }) {
    /* PURE FUNCTIONS */
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
    /* -- */

    /* STATE */
    const state = reactive({
      elapsed: computed(() => toTimerData(props.item.timer.elapsedCom))
    });    

    return { state };
  }
};
</script>
