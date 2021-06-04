<template>
  <div class="widget scene column no-wrap">    
    <header v-if="state.target" class="widdet-header col-auto">Entity {{ state.target.meta.name }}: {{ state.target.meta.type }}</header>
    <header v-else class="widdet-header col-auto">NO ENTITY</header>
    <div class="col">
      <div class="row q-col-gutter-xs full-height">
        <div class="col-auto full-height">          
          <Slot0 :owner="item" :item="state.target" @added="item => setTarget(item)" @clear="setTarget(null)" />
        </div>

        <div class="col scroll full-height">
          <q-list v-if="state.target" dense>
            <q-item v-for="(com, key) of state.coms" :key="key">
              <q-item-section v-if="com != 'id'">
                <div><i class="component "/> {{ com }}</div>
              </q-item-section>
              <q-item-section v-if="com != 'id'">
                <CodeEditor :value="JSON.stringify(item.c.target[com], null, 2)" autogrow />
              </q-item-section>
              <q-item-section v-if="com == 'id'">
                ID {{ item.c.target.id }}
              </q-item-section>
            </q-item>
          </q-list>          
        </div>
      </div>
    </div>

    <q-toolbar class="col-auto" :style="{ height: '20px' }">
      <Resizer :item="item" />
    </q-toolbar>
  </div>
</template>

<script>
import Slot0 from "../ux/Slot0.vue";
import Resizer from "../ux/Resizer";
import CodeEditor from "../ux/CodeEditor";
import { reactive, computed } from "vue";

export default {
  props: {
    item: Object
  },
  components: { Slot0, Resizer, CodeEditor },
  setup(props) {
    const state = reactive({
      coms: computed(() => Object.keys(props.item.c.target)),
      target: computed(() => props.item.c.target)
    });

    // console.log("state.target", state.target, props.item);

    const setTarget = (item) => {
      console.log("setTarget", item, props.item);
      props.item.connections.target = item ? item.id : null;
    };

    return { state, setTarget };
  }
};
</script>

<style lang="scss" scoped>
.slot {
  width: 136px;
  height: 164px;
  flex: 0 0 134px;
}

i.component {
  display: inline-block;
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  background: url("./noun_component_1101497.svg") no-repeat center center / contain;
  margin-right: 10px;
}
</style>