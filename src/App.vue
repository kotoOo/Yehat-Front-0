<template>
  <ZIITable />
  <Yehat />
  <router-view />
</template>
<script>
import { runYehat, Yehat } from "./yehat/yehat.js";
import ZIITable from "./yehat/ZIITable3";
import { defineComponent, provide, reactive } from 'vue';

export default defineComponent({
  name: 'App',
  components: { ZIITable, Yehat },
  setup() {
    runYehat({ addMode: "orbit0" });

    const app = reactive({

    });
    provide("app", app);
  }
});
</script>
