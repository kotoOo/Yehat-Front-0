<template>
  <div class="zii-widget-space draggable all-pointer-events" ref="space" :style="self.style" v-touch-pan.mouse="handlePanTable"
    @mousemove.passive="mousemove" @mouseup.passive="mouseup">
    <canvas ref="mainViewRef" :width="mainView.width" :height="mainView.height" :style="mainView.style" class="main-view" /> 
    <component 
      v-for="item in zw.itemsTableStill" :key="item.id" :is="item.item.baseComponent" :style="item.style"
      :item="item" :height="zw.space.itemImageSize" @click.native="e => itemClick(item, e)"
      class="z-item" :class="{
        'z-dragged': item.drag && item.drag.active, 
        'all-pointer-events': !(item.drag && item.drag.active),
        'no-pointer-events': item.drag && item.drag.active,
      }"
      @take.native="(e, a) => take(item, e, a)"
    />
    <component
      v-if="zw.dragged" :is="zw.dragged.item.baseComponent" key="dragged" :item="zw.dragged" :style="zw.draggedStyle"      
    />
  </div>
  <!-- <div 
    class="zii-widget-space hoverable draggable" ref="zwSpace" 
    
    @touchstart="tableTouchStart" @touchmove="tableTouchMove" @touchend="tableTouchEnd" @touchcancel="tableTouchCancel"
    @mousedown="tableMousedown" @mousemove="tableMousemove" @mouseup="tableMouseup" @dragend="tableMouseup"

    @hover="desktopHover" @unhover="desktopUnhover" @drag="desktopDrag" @take="desktopTake"
  >
    <component v-for="(widget, key) of zw.items" :key="key" :is="'ZIIWidgetTable'" :class="widget.classes" :style="widget.style"
      @close="closeBox(key, widget)" :item="widget"
    >
      <component 
        v-if="widget.nestedComponent" v-bind="widget.props" :is="widget.nestedComponent" :class="widget.nestedClasses"
        @wdgtResize="v => widgetResize({ ...v, item: widget, key })"
        @addWidget="onAddWidget" :item="widget" :entity="root.tracked[widget.id]"
        @activate="onActivate(key)" 
        :ref="v => zw.widgetRefs[widget.id] = v"
      />
    </component>

    <component 
      v-for="(item, key) of zw.itemsTable" :key="'item'+key" :is="item.baseComponent" :style="item.style"
      :item="item.item" :height="zw.space.itemImageSize" @click="itemClick(item)"
    />
    <component 
      v-if="zw.drag.active" :is="zw.drag.baseComponent" :style="zw.placeholderStyle" :item="zw.drag.item" 
      :height="zw.space.itemImageSize"
      isPlaceholder
    />
    
    <div class="row no-wrap justify-between hoverable" :style="zw.inventoryStyle">
      <div class="col-auto">
        <YehatBrand />
      </div>
      <div class="col">
        <ZIIInventory :item="zw.inventory" :items="zw.desktop"  @addWidget="onAddWidget">

        </ZIIInventory>
      </div>
      <div class="col-auto">
        <YehatAuth />
      </div>
    </div>

    <q-resize-observer @resize="onSpaceResize" />
  </div> -->
</template>

<script>
/* Vue 3 Edition, originates to PropertyLeads Vue 2 +  Vue Composition Api Edition */
import { useEP0, SaveLocal, Meta, useLoader, useCargo, useStory0, useNavigation0, useEntityEdit } from "./basics0";
import { useGymbal0 } from "./basics0/gymbal0";
import { makeUnit, makeItemProperties } from "./basics0/isometrics";
import "./loader";
import { ref, reactive, computed, provide, watch, watchEffect, onMounted, onBeforeUnmount } from "vue";
import { Entity, Component, bindMethods, loadEntity } from "./ecs.js";
import { makeISOBox } from "./items/ISOBox0";
import { makePLAppStatus } from "./pl/PLAppStatus.vue";
import { makePLWebSocket } from "./pl/PLWebSocket.vue";
import { makeShardLog0 } from "./pl/PLShardLog0.vue";
import { makePanel0 } from "./pl/PLPanel0.vue";
import { makeRoom0 } from "./items/IRoom0.vue";
import { makePLUserList } from "./pl/PLUserList.vue";

const tableID = "27df4209-e8d8-41ca-8a48-951ae9d077c6";

console.log("useLoader", useLoader);

/* We don't provide a standard strict way to create instances.

No have

const Item = ....

and then

if (a = b) Item({ msg: "abcde" }); // Create!

No. Instead we are ending up with create yehat items like this:

const Loader = Entity({
  ...Located({
    rel: tableID,
    pos: [ 0, 0, 0 ]
  }),
  ...Connections([

  ])
})
*/

const install = (e, a, pool) => a.forEach(fn => {
  const chant = fn(e, pool);
  // console.log("fn(e)", fn(e));
  for(let i in chant) {
    e[i] = chant[i];
  }
  //Object.assign(e, fn(e)); /* should be deepmerge */
});




/* ...>... MeawModem Paw-F0 protocol end. */


export default {
  setup() {
    const space = ref(null);

    

    const zw = reactive({
      itemsTable: [],
      itemsTableStill: computed(() => {
        const a = zw.itemsTable.filter(item => {
          return item.located && item.located.rel == tableID;
        });

        return a;
      }),
      space: { /* These should be input from some navigation sub-system */
        padding: [ 10, 10 ],
        size: [ null, null ],
        margin: [ 60, 0, 0, 0 ],
        grid: [ 10, 10, 4, 4 ],
        itemSize: [ 10, 15 ],
        itemImageSize: computed(() => zw.space.itemSize[0] * zw.space.grid[0] + (zw.space.itemSize[0] - 1) * zw.space.grid[2]),
      },
      camera: computed(() => self.camera),
      info: null,
      panning: false,
      debug: null,
      dragging: null, /* =Oo= */
      dragged: null,
      draggedStyle: computed(() => {
        const item = zw.dragged;
        if (!zw.dragged) return null;
        const w = item.located.size[0] * zw.space.grid[0] + (item.located.size[0] - 1) * zw.space.grid[2];
        const h = item.located.size[1] * zw.space.grid[1] + (item.located.size[1] - 1) * zw.space.grid[3];       
        
        const [ x, y ] = item.position ? item.position : [ 0, 0 ];

        // const pointerEvents = (item.drag && item.drag.active) ? 'none' : 'all'; // 'all'; // trying again
        const opacity = 0.5;

        const z = zw.itemsTableStill.length + 10;

        return {
          position: "absolute",
          width: `${w}px`,
          height: `${h}px`,
          transform: `translateX(${x}px) translateY(${y}px) translateZ(${z}px)`,          
          zIndex: 100,
          pointerEvents: "none",
          opacity
        };
      }),
      hovering: null, /* Element crossed with panning while dragging =) */ 
      hoveredInventory: null,
      cargo: null,
      tableID
    });

    provide("zw", zw);

    const ItemEnhancements = [ /* Without these enchants Entities cannot be presented on ZIITable 3 in a 
    standard way. Of course there're a few non-standard. So we intended to dress everybody in these. */
      (item) => ({
        position: computed({
          get: () => {
            if (item.drag && item.drag.active) {
              return item.drag.pos;
            } else {
              const x = item.located.pos[0] * (zw.space.grid[0] + zw.space.grid[2]);
              const y = item.located.pos[1] * (zw.space.grid[1] + zw.space.grid[3]);

              return [ x - zw.camera.cx, y - zw.camera.cy ];
            }
          },
          set: ([ x, y ]) => {
            item.located.pos[0] = Math.round((x  + zw.camera.cx) / (zw.space.grid[0] + zw.space.grid[2]));
            item.located.pos[1] = Math.round((y  + zw.camera.cy) / (zw.space.grid[1] + zw.space.grid[3]));
          }
        }),
      }),
      (item) => ({
        style: computed(() => {
          const w = item.located.size[0] * zw.space.grid[0] + (item.located.size[0] - 1) * zw.space.grid[2];
          const h = item.located.size[1] * zw.space.grid[1] + (item.located.size[1] - 1) * zw.space.grid[3];       
          
          const [ x, y ] = item.position ? item.position : [ 0, 0 ];

          const pointerEvents = (item.drag && item.drag.active) ? 'none' : 'all'; // 'all'; // trying again
          const opacity = (item.drag && item.drag.active) ? 0 : 1;

          const z = item.activity ? item.activity.z : 0;

          return {
            position: "absolute",
            width: `${w}px`,
            height: `${h}px`,
            transform: `translateX(${x}px) translateY(${y}px) translateZ(${z}px)`,
            zIndex: item.drag.active ? 100 : 0,
            pointerEvents,
            opacity
          };
        })
      }),
      (item) => {
        item.intersectsPoint = ({ point }) => {
          const w = zw.space.itemSize[0] * zw.space.grid[0] + (zw.space.itemSize[0] - 1) * zw.space.grid[2];
          const h = zw.space.itemSize[1] * zw.space.grid[1] + (zw.space.itemSize[1] - 1) * zw.space.grid[3];

          const [ x, y ] = item.position ? item.position : [ 0, 0 ];

          const [ x0, y0 ] = point;
          return x0 >= x && x0 < x + w && y0 >= y && y0 < y + h;
        };
      },
      (item) => {
        item.act = () => {
          if (item.activity) {
            item.activity.dtLastTouched = +new Date();
            item.activity.count++;
            item.activity.z = zw.itemsTableStill.length - 1;            

            zw.itemsTableStill.forEach(z => {
              if (z !== item && z.activity) z.activity.z--;
            });
          }
        };
      },
      (item, pool) => {
        if (item.connections) {
          item.c = computed(() => {
            console.log("recompute connections", item.meta.name, Object.keys(item.connections).length);
            const a = {};
            for(let key in item.connections) {
              a[key] = pool[item.connections[key]];
            }
            return a;
          });
        }
      }
    ];

    /* PIPING IN!!! that's definitely LVL 2 upgrade that takes understanding of ZII system to the next level. */
    /* Before this step Entities were created right here in this manner: [Legacy Link] */

    const pool0 = reactive({});
    provide("pool0", pool0);

    const pipeIn = (entities, pool) => { /* call with group of Entities to dress and show them on ZIITable 3 */
      entities.map(entity => {
        pool[entity.id] = entity;
        install(entity, ItemEnhancements, pool); /* Without these enchants Entities cannot be presented on ZIITable 3 in a 
    standard way. Of course there're a few non-standard. */
        zw.itemsTable.push(entity);        
      })
    };

    const loader0 = useLoader({ id: "74a10e4a-1201-4c9a-b4d9-cc66a03c35ef", rel: tableID });
    const cargo0 = useCargo({ id: "dc36c3a4-41b3-44dc-91bc-586f90da4734", rel: tableID });
    const story0 = useStory0({ id: "20d60a53-ee95-49fc-906a-2df8cce3c5de", rel: tableID });
    const navigation0 = useNavigation0({ id: "2aba9eb2-f9e0-4cfe-a757-3deedd9f0cf6", rel: tableID });
    const entityEdit = useEntityEdit({ id: "090424fe-1b68-48d2-adde-09336a44c40a", rel: tableID });
    const gymbal0 = useGymbal0({ id: "44a4feb2-c146-4886-9b8c-1f0a3055acbc", rel: tableID });
    const isoBox0 = makeISOBox({ rel: tableID }); /* We allowed to create entities, don't care about their ID (Transient+) */
                                                  /* ID will be autogenerated by underlying mechanisms of ZII ECS */
    const unit0 = makeUnit({ id: "6cafc2e2-523e-4965-a72e-0962d4a16945", rel: tableID })
    const itemProps0 = makeItemProperties({ 
      id: "c62fb1d4-78c4-44fc-8361-676d5c8f5427", rel: tableID, target: unit0.id,
      gymbal: gymbal0.id
    });

    const plAppStatus0 = makePLAppStatus({ id: "6f2a06d9-7473-4a1b-8657-91bdda2da710", rel: tableID });
    const PLWebSocket0 = makePLWebSocket({ id: "b7526e1b-064f-4fa1-b1de-2daf75a5cacb", rel: tableID });
    
    const panel0 = makePanel0({ id: "9fed8c8b-0b5b-4412-a022-6c42544e8e71", rel: tableID });
    const room0 = makeRoom0({ id: "6d217dc9-96da-4dcb-9a1d-c182a0a3b9fe", rel: tableID });
    const userList0 = makePLUserList({ id: "08c154de-4a8e-4644-b293-44f689e3685b", rel: tableID });
    const shardLog0 = makeShardLog0({ 
      id: "a188f08c-490b-4d0b-8a09-33128b6fd88f", rel: tableID, userListID: userList0.id
    });

    // const isoBox0 = makeISOBox({ rel: tableID });

    loader0.located.rel = tableID;

    if (~[ "7a3429f2-d77b-4cb8-9824-10a2521bfa3b", "5da66ddb-7cf4-4160-9fda-762e5d915779" ].indexOf(localStorage.deviceID)) {
      pipeIn([ /* loader0 ,*/ cargo0, story0, navigation0, entityEdit, isoBox0, gymbal0, unit0, itemProps0, plAppStatus0, PLWebSocket0, shardLog0, panel0, room0, userList0 ], pool0);
      /*entityEdit,*/
      // pipeIn([ loader0, cargo0, story0, navigation0, entityEdit, isoBox0, gymbal0, unit0, itemProps0, plAppStatus0, PLWebSocket0 ], pool0);
    } else {
      pipeIn([ plAppStatus0, PLWebSocket0, shardLog0, panel0, room0 ], pool0);
    }

    zw.cargo = cargo0;


    const ZIITable = Component("ziiTable", {
      show: false,
      activated: false
    });

    const Camera = Component("camera", {
      x: 0, y: 0, /* target position */
      px: 0, py: 0, /* source position */
      cx: 0, cy: 0, /* displayed position */
      startMove: 0,
      dragged: false,
      start: [ null, null ],
      point: [ null, null ],
    });

    const self = loadEntity([      
      ZIITable(),  
      Camera(),   
      SaveLocal({
        ziiTable: true,
        camera: [ 'x', 'y', 'px', 'py', 'cx', 'cy' ]
      }), 
      Meta({ 
        type: "ZII Table",
        name: "ZII Table 3",
      })            
    ])({ 
      id: tableID      
    });    
    
    install(self, [
      item => ({
        style: computed(() => {
          const opacity = self.ziiTable.show ? 1 : 0;
          const pointerEvents = self.ziiTable.show ? "all" : "none !important";
          const transform = self.ziiTable.show ? undefined : "scale(0)";

          return {
            width: '100vw',
            height: '100vh',
            background: 'transparent',
            position: 'fixed',
            zIndex: 2000,
            opacity, pointerEvents, transform
          };
        })
      })
    ]);

    const seq = "yehat";
    let at = 0;

    const keydown = (e) => {
      const { keyCode, ctrlKey, key } = e;
      if (keyCode == 27 && (self.ziiTable.show || self.ziiTable.activated)) {
        self.ziiTable.show = !self.ziiTable.show;
        self.saveLocal.save();
      }

      if (ctrlKey && key == seq[at] && !self.ziiTable.activated) {
        at++;
        if (at == seq.length) {
          console.log("Yehat activated.");
          self.ziiTable.show = true;
          self.ziiTable.activated = true;
          self.saveLocal.save();
          at = 0;
        }

        e.preventDefault();
      }

      // console.log("key", e);
    };

    core.yehat.deactivate = () => {
      self.ziiTable.activated = false;
      self.saveLocal.save();
    };

    window.runYehat = () => {
      self.ziiTable.show = true;
      self.ziiTable.activated = true;
      self.saveLocal.save();
    };

    watchEffect(onCleanUp => {
      document.addEventListener("keydown", keydown);

      onCleanUp(() => {
        document.removeEventListener("keydown", keydown);
      })
    });
    
    const updateMousePos = ({ clientX, clientY, target }) => {
      // console.log(document.elementsFromPoint(clientX, clientY));
      const $m = `MOUSE ${clientX},${clientY}`;

      const elements = document.elementsFromPoint(clientX, clientY);
      const ele = document.elementFromPoint(clientX, clientY);

      const $el = `STACKED: ${elements.length}`;// TARGET: ${ele ? ele.className : 'NULL' }`;

      if (!elements.length) {
        zw.debug = [ $m, $el, "NOT HOVERING" ].join(" ");
        return;
      }

      let index = 0, scanned = 0, skipped = [], done = false;
      elements.forEach(element =>  {
        if (done) return;

        if (element.classList.contains("z-dragged")) { /* dragged items not taking part in picking */
          index++;
          skipped.push(element.className);
          return;
        }

        if (element.classList.contains("inventory")) {
          //element.style.border = '1px solid red';
          zw.debug = [ $m, $el, "HOVERING" ].join(" ");

          done = true;          
          return;
        } else {
          //console.log("skipped", index, element);
          skipped.push(element.className);
        }

        index++;
        scanned++;
      });

      if (!done) zw.debug = [ $m, $el, "NOT HOVERING"/*, `SCANNED:${scanned}`, `SKIPPED:${skipped.join(",")} `*/ ].join(" ");
    };

    const toHoverable = (el) => {
      let a = el;
      while (a) {
        if (a.classList.contains('hoverable')) return a;
        a = a.parentElement;
      }
      return null;
    };

    const maybeDispatchTake = ({ position }) => {
      let element = document.elementFromPoint(position.left, position.top);

      while (!element.classList.contains("z-item")) {
        element = element.parentElement;
        if (!element) return false;
      }

      element.dispatchEvent(new CustomEvent("take", { detail: { position } }));
      return true;
    };

    const startPanning = () => {
      if (zw.dragged) {
        console.log("Can't start panning while drag.");
        return;
      }      
      zw.panning = true;
      console.log("[Camera]Panning started.");
    };

    const stopPanning = () => {
      zw.panning = false;
      console.log("[Camera]Panning stopped.");
    };
    
    const handlePanTable = ({ isFirst, isFinal, delta, position }) => {
      if (zw.panning && !isFirst) {
        zw.camera.cx -= delta.x;
        zw.camera.cy -= delta.y;

        self.saveLocal.save();
      }

      if (isFirst) {
        if (!maybeDispatchTake({ position })) {
          startPanning();
        }
      }

      if (isFinal) {
        if (zw.dragged) {
          if (zw.hovering) {
            let el = zw.hovering;
            while(el) {
              if (el.classList.contains('widget')) {
                console.log("Vue for cargo", el.__vue__);
                break;
              }

              el = el.parentElement;
            }

            
            zw.hovering.dispatchEvent(new CustomEvent("zdrop", { detail: { position, item: { ...zw.dragged } } }));
            
            zw.dragged.position = [ ...zw.dragged.drag.pos ];
            zw.dragged.drag.active = false;
            zw.dragged.drag.onDrop();
            zw.dragged.drag.onDrop = () => {};
            zw.dragged = null;            

            return;
          }

          zw.dragged.position = [ ...zw.dragged.drag.pos ];
          zw.dragged.drag.active = false;

          // let element = document.elementFromPoint(position.left, position.top);
          // if (element && element.classList.contains("inventory")) {
          //   console.log(`Dropping to Cargo: ${zw.dragged.meta.name}.`);
          //   element.dispatchEvent(new CustomEvent("zdrop", { detail: { position, item: { ...zw.dragged } } }));
          // } else {
            /* drop to table */
          if (zw.dragged.located != tableID) {
            zw.dragged.located.rel = tableID;
            zw.dragged.act();
          }
          console.log(`Dropped to table: ${zw.dragged.meta.name}.`, zw.dragged.position);            
          //}
          if (zw.dragged.saveLocal) zw.dragged.saveLocal.save();

          console.log("zw onDRop", zw.dragged.drag);

          zw.dragged.drag.onDrop();
          zw.dragged.drag.onDrop = () => {};          
          zw.dragged = null;
        }

        if (zw.panning) stopPanning();
      }

      if (zw.dragged) {
        zw.dragged.drag.pos = [ zw.dragged.drag.pos[0] + delta.x, zw.dragged.drag.pos[1] + delta.y ];

        let element = document.elementFromPoint(position.left, position.top);
        let f = false;
        while (element) {
          if (element.classList.contains("inventory")) {
            zw.debug = [ "HOVERING", element.className ].join(" ");
            zw.hovering = element;
            f = true;
            break;
          }

          if (element.classList.contains("widget")) {
            zw.debug = [ "HOVERING WIDGET", element.className ].join(" ");
            f = true;
            break;
          }

          element = element.parentElement;
        }

        if (!f) {
          zw.debug = [ "NOT HOVERING" ].join(" ");
          zw.hovering = null;
        }
      }
    };

    const resetHoverables = () => {
      const a = document.getElementsByClassName("hoverable");
      a.forEach(item => item.style.border = 'none');
    };

    const mousemove = ({ clientX, clientY }) => {      
      updateMousePos({ clientX, clientY });
    };

    const mouseup = ({}) => {
      setTimeout(() => {
        if (zw.dragged) {
          zw.dragged.drag.active = false;
          zw.dragged = null;
        }
      }, 100);
    };

    const itemClick = (item, e) => {

    };

    const take = (item, e, a) => {
      // console.log("take", item, e, a);
      if (item.drag && !zw.dragged) {      
        zw.dragged = item;

        item.drag.pos = [ item.position[0], item.position[1] ];
        item.drag.active = true;

        console.log(`ZII Table 3: Dragging ${item.meta.name}`);
      } 
    };

    const mainViewRef = ref(null);
    const mainView = reactive({ /* Not yet an entity */
      mainViewRef,
      width: 576,
      height: 320,
      style: computed(() => {
        return {
          position: "absolute",
          width: "100%",
          height: "!00%"
        };
      }),
      render: () => {      
        const { width, height, mainViewRef } = mainView;
        const ctx = mainViewRef.getContext("2d");

        ctx.clearRect(0, 0, width, height);

        ctx.fillRect(0, 0, width/2, height/2);

      }
    });

    onMounted(() => {
      mainView.render();
    });
   
    return { space, zw, self, handlePanTable, mousemove, mouseup, itemClick, take, mainView, mainViewRef };
  } 
};
</script>

<style lang="scss" scoped>
.zii-widget-space {
  -webkit-font-smoothing: subpixel-antialiased;
  // * {
  //   
  //   backface-visibility: hidden;
  // }

  ::-webkit-scrollbar {}
  ::-webkit-scrollbar-track {
    background: transparent
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 0;
    border: 0;
    background: #7824b9;
  }

  // /deep/ .q-btn--dense {
  //   border-radius: 0;
  // }

  .scene {
    background: #0e051f;
    width: 100%;
    height: 100%;
    border-radius: 3px;
    box-shadow: 1px 1px 9px 3px rgba(0, 0, 0, 0.34);
    color: white;
  }

  .widget {
    border: 1px solid #181a1c;
    background: #0e051f;
  }
}

.z-dragged {
  // border: 1px solid #ffc700;
  
}

.z-item {
  // transition: transform 0.2s, opacity 0.4s;
}

.z-item.all-pointer-events ::v-deep(.inventory) {
  pointer-events: all !important;  
}

.main-view {
  opacity: 0;
  pointer-events: none;
  transform: scale(0);
}
</style>