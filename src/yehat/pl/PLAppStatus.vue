<template>
  <div class="widget">
    <header class="widget-header">Property Leads - App CI/CD configuration</header>
    <div v-touch-pan.mouse.prevent="() => {}">
      <div class="caption">App Mode</div>

      <!-- <q-option-group 
        :options="appModeOptions" :value="yehat.useAppMode" @input="v => setAppMode(v)" dense left-label 
        color="white" class="option-group"
      /> -->
      <q-list dense>
        <q-item v-for="({ label, value }, key) of appModeOptions" :key="key" tag="label" v-ripple dense style="padding: 0;">
          <q-item-section style="padding: 0 10px 0 0" side>
            <q-radio :modelValue="yehat.manualAppMode" @input="v => setAppMode(v)" :val="value" color="green" dense />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ label }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
    <Resizer :item="item" />
  </div>
</template>

<script>
import { inject, onMounted, onBeforeUnmount } from "vue";
import { Component } from "../ecs";
import { Located, Meta, Connections, Item, loadItem, SaveLocal } from "../basics0/index";
import Resizer from "../ux/Resizer";

const AppConfig = Component("appConfig", {
  manualAppMode: null
});

export const makePLAppStatus = ({ id, rel, pool }) => { 
  return loadItem([
    Located({
      rel,
      pos: [ 10, 40, 0 ],
      size: [ 10, 15 ]
    }),
    Connections([

    ]),
    Item({
      baseComponent: "PLAppStatus"
    }),
    AppConfig(),
    Meta({
      type: "Dash",
      name: "PL App Status MK 1"
    }),
    SaveLocal({
      appConfig: true,
      located: true,
      connections: true,
    })
  ])({ id });//.install(gymbal0Enchantments, pool);
};

export default {
  props: {
    item: Object,
  },
  components: { Resizer },
  setup(props) {
    const appModeOptions = [
      {
        label: "Automatic",
        value: null
      },
      {
        label: "Development",
        value: "development"
      },
      {
        label: "Production",
        value: "production"
      },
      {
        label: "ListAbility",
        value: "listability"
      }
    ];

    const setAppMode = (v) => {
      console.log("set manual app mode", v);
      core.yehat.manualAppMode = v;
      props.item.appConfig.manualAppMode = v;
      props.item.saveLocal.save();
    };

    onMounted(() => {
      console.log("Enabled manual app mode: ", props.item.appConfig.manualAppMode);
      core.yehat.manualAppMode = props.item.appConfig.manualAppMode;
    });

    onBeforeUnmount(() => {
      // core.yehat.manualAppMode = null;
      console.log("Manual app mode disabled.");
    });

    return { yehat: core.yehat, appModeOptions, setAppMode };
  }
};
</script>

<style lang="scss" scoped>
.widget {
  background: $grey-10;
  color: white;
  padding: 8px;
  font-size: 12px;

  .widget-header {
    font-weight: 500;
    opacity: 0.5;
    height: 34px;
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }
}

.caption {
  font-weight: 500;
}

.option-group {
  ::v-deep(svg) {
    color: white;
  }
}

::v-deep(.q-radio__inner) {
   color: white;
}
</style>