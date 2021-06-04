<template>
  <div class="relative-position scroll">
    <div class="poly" :style="polyStyle">
      <svg :height="polyStyle.svgSize[0]" :width="polyStyle.svgSize[1]" class="poly-svg" :viewBox="polyStyle.viewBox.join(' ')">
        <!-- <path 
          v-for="(path, k) of polyStyle.svgCommands" :key="k" :d="path" class="poly" :class="polyStyle.classes[k]" stroke="#000" 
         
        /> -->
        <path 
          v-for="(poly, k) of polyStyle.polys" :key="k" :d="poly.svg" class="poly" :class="poly.classes" stroke="#000"          
        />
        <rect :x="originPosition[0]-1-state.camera[0]" :y="originPosition[1]-1-state.camera[1]" width="3px" height="3px" class="p-center" />
        <text v-for="(item, k) of polyStyle.captions" :key="`cap-${k}`" :x="item.x" :y="item.y" class="small">{{ item.text }}</text>
      </svg>
      <canvas :height="polyStyle.svgSize[0]" :width="polyStyle.svgSize[1]" ref="canvas" class="poly-canvas" />
      <div>
        <div class="caption">Canvas Scale X</div>      
        <q-slider 
          :value="state.canvas.config.scale[0]" @input="v => state.canvas.config.setScale(v)"
          :min="0.125" :max="32" :step="0.125" label-always :label-value="state.canvas.config.scale[0]" 
        />
      </div>
      <div>
        <div class="caption">Angle around Z Axis</div>      
        <q-slider v-model="state.angleZ" :min="0" :max="360" :step="15" label-always :label-value="state.angleZ" />
      </div>
      <div>
        <div class="caption">Origin X</div>      
        <q-slider v-model="state.origin[0]" :min="-64" :max="64" :step="1" label-always :label-value="state.origin[0]" />
      </div>
      <div>
        <div class="caption">Origin Y</div>      
        <q-slider v-model="state.origin[1]" :min="-64" :max="64" :step="1" label-always :label-value="state.origin[1]" />
      </div>
      <div>
        <div class="caption">Origin Z</div>      
        <q-slider v-model="state.origin[2]" :min="-64" :max="64" :step="1" label-always :label-value="state.origin[2]" />
      </div>
      <div>
        <div class="caption">Camera X</div>      
        <q-slider v-model="state.camera[0]" :min="-64" :max="64" :step="1" label-always :label-value="state.camera[0]" />
      </div>
      <div>
        <div class="caption">Camera Y</div>      
        <q-slider v-model="state.camera[1]" :min="-64" :max="64" :step="1" label-always :label-value="state.camera[1]" />
      </div>
      <div>
        <div class="caption">Yehat Position X</div>      
        <q-slider v-model="state.yePos[0]" :min="-64" :max="64" :step="1" label-always :label-value="state.yePos[0]" />
      </div>
      <div>
        <div class="caption">Yehat Position X</div>      
        <q-slider v-model="state.yePos[1]" :min="-64" :max="64" :step="1" label-always :label-value="state.yePos[1]" />
      </div>
      <div>
        <div class="caption">Yehat Position X</div>      
        <q-slider v-model="state.yePos[2]" :min="-64" :max="64" :step="1" label-always :label-value="state.yePos[2]" />
      </div>
      <div class="log">
        <div class="log-size">Log records: {{ state.log.length }}</div>
        <div class="records scroll" style="max-height: 300px">
          <div v-for="(line, key) of state.log" :key="key" class="item">{{ line }}</div>
        </div>
      </div>
      
    </div>
    <Resizer :item="item" />
  </div>
</template>

<script>
import { computed, reactive, watchEffect, watch, ref, inject } from "vue";
import { Component } from "../ecs";
import { Located, Meta, Connections, Item, loadItem } from "../basics0/index";
import Resizer from "../ux/Resizer";

export const box = Component('box', {
  isoPos: [ 0, 0, 0 ] /* Position in isometric coordinate system */
});

export const makeISOBox = ({ id, rel }) => { 
  return loadItem([
    Located({
      rel,
      pos: [ 10, 0, 0 ],
      size: [ 10, 15 ],
      isoPos: [ 0, 0, 0 ]
    }),
    Connections([

    ]),
    Item({
      baseComponent: "ISOBox0"
    }),
    // NavConfig({
    //   showJSON: false
    // }),
    Meta({
      type: "IsoBox",
      name: "IsoBox 0"
    })
  ])({ id });
};

// import { Matrix3 } from "../iso/matrix3.js";

const matxv = (mat, v) => [
  mat[0] * v[0] + mat[1] * v[1] + mat[2] * v[2],
  mat[3] * v[0] + mat[4] * v[1] + mat[5] * v[2],
  mat[6] * v[0] + mat[7] * v[1] + mat[8] * v[2]
];

const matURotationX = (a) => [
  1, 0,             0,
  0, Math.cos(a), - Math.sin(a),
  0, Math.sin(a),   Math.cos(a)
];

const matURotationY = (a) => [
    Math.cos(a), 0, Math.sin(a),
    0,           1, 0,
  - Math.sin(a), 0, Math.cos(a)
];

const matURotationZ = (a) => [
  Math.cos(a), - Math.sin(a), 0,
  Math.sin(a),   Math.cos(a), 0,
  0,             0,           1
];

const sq2 = Math.sqrt(2);
const sq3 = Math.sqrt(3);


/* Original */
const matrixScreenToIso = [
  sq3, -1, -1 / sq2, /* Xx, Xy, Xz - is the screenspace proejection of vector (1, 0, 0) of isometric space */
  -sq3, -1, -1 / sq2, /* Yx, Yy, Yz - is the screenspace proejection of vector (0, 1, 0) of isometric space */
  0, 2, -1 / sq2     /* Zx, Zy, Zz - is the screenspace proejection of vector (0, 0, 1) of isometric space */
                            /* Z coord part gives us screenspace depth */
];

const screenToIso = (x, y, z) => {
  const m = matrixScreenToIso;
  const ix = x * m[0] + x * m[1] + x * m[2];
  const iy = y * m[3] + y * m[4] + y * m[5];
  const iz = z * m[6] + z * m[7] + z * m[8];

  return [ ix, iy, iz ];
};

/*



                                                      [ cube[5].path[0].start: X=0,Y=0,Z=0 ]

                                                         o-
                                                       --  --
                                                     --      --
                                                   --          --
                                                 o-             -o  [ cube[5].path[0].end: X=1,Y=0,Z=0 ] */

const matrixIsoToScreen = [
  1, 0.5, -0.5, /* Xx, Xy, Xz - is the screenspace proejection of vector (1, 0, 0) of isometric space */
  -1, 0.5, -0.5, /* Yx, Yy, Yz - is the screenspace proejection of vector (0, 1, 0) of isometric space */
  0, -1, 0     /* Zx, Zy, Zz - is the screenspace proejection of vector (0, 0, 1) of isometric space */
                            /* Z coord part gives us screenspace depth */
];



const isoToScreen = ([ ix, iy, iz ]) => {
  const m = matrixIsoToScreen;
  const x = ix * m[0] + iy * m[3] + iz * m[6];
  const y = ix * m[1] + iy * m[4] + iz * m[7];
  const d = ix * m[2] + iy * m[5] + iz * m[8];
  return [ x, y, d ];
};

const translate3 = ([ tx, ty, tz ]) => item => {
  item.path = item.path.map(point => {
    return [
      point[0] + tx,
      point[1] + ty,
      point[2] + tz
    ];
  });
  return item;
};

const scale3 = ([ sx, sy, sz ], [ ox, oy, oz ] = [ 0, 0, 0 ]) => item => {
  item.path = item.path.map(point => {
    return [
      (point[0] - ox) * sx + ox,
      (point[1] - oy) * sy + oy,
      (point[2] - oz) * sz + oz
    ];
  });
  return item;
};

const sc3 = ([ sx, sy, sz ], [ ox, oy, oz ] = [ 0, 0, 0 ]) => (p) => {
  return [
    (p[0] - ox) * sx + ox,
    (p[1] - oy) * sy + oy,
    (p[2] - oz) * sz + oz
  ];
};

export default {
  props: {
    item: Object
  },
  components: { Resizer },  
  setup() {
    const pool0 = inject("pool0");
    const gymbal = pool0["44a4feb2-c146-4886-9b8c-1f0a3055acbc"];


    const makeCube = ([ w, h, d ], [ tx, ty, tz ] = [ 0, 0, 0 ]) => [
      { 
        path: [ /* Bottom */
          [ 0, 0, 0 ], 
          [ w, 0, 0 ],
          [ w, d, 0 ],
          [ 0, d, 0 ],
        ], classes: "bottom",
        color: "#130623"
      }, 
      { 
        path: [ /* Top */
          [ 0, 0, h ], 
          [ w, 0, h ],
          [ w, d, h ],
          [ 0, d, h ],
        ], classes: "top",
        color: "#a54dca"
      },
      { 
        path: [ /* Left */
          [ 0, 0, 0 ], 
          [ 0, d, 0 ],
          [ 0, d, h ],
          [ 0, 0, h ],
        ], classes: "left",
        color: "#7824b9"
      },
      { 
        path: [ /* Right */
          [ w, 0, 0 ], 
          [ w, d, 0 ],
          [ w, d, h ],
          [ w, 0, h ],
        ], classes: "right",
        color: "#7824b9"
      },
      { 
        path: [ /* Back */
          [ 0, 0, 0 ], 
          [ w, 0, 0 ], /* To the highest point she fiyed */
          [ w, 0, h ],
          [ 0, 0, h ],
        ], 
        classes: "back",
        color: "#2c0b4f"
      },
      { 
        path: [ /* Front */
          [ 0, d, 0 ], 
          [ w, d, 0 ], /* A company she don't missing, even the same birds as she is. */
          [ w, d, h ], /* She Beacon is aligned to the sky. */
          [ 0, d, h ], /* Her feathers ain't got no specific color. */
        ], classes: "front",
        color: "#50177b" 
      },                                       /* And she signs very silently. */
    ].map(translate3([ tx, ty, tz ]));

    const makeArrow = ([ w, h, d ], [ tx, ty, tz ] = [ 0, 0, 0 ]) => [
      { 
        path: [ /* Bottom */
          [ 0, 0, 0 ], 
          [ w, d/2, 0 ],
          [ 0, d, 0 ],
        ], classes: "bottom", color: "#130623"
      }, 
      { 
        path: [ /* Top */
          [ 0, 0, h ], 
          [ w, d/2, h ],
          [ 0, d, h ],
        ], classes: "top", color: "#a54dca"
      },
      { 
        path: [ /* Left */
          [ 0, 0, 0 ], 
          [ 0, d, 0 ],
          [ 0, d, h ],
          [ 0, 0, h ],
        ], classes: "left", color: "#7824b9"
      },
      // { 
      //   path: [ /* Right */
      //     [ w, 0, 0 ], 
      //     [ w, d, 0 ],
      //     [ w, d, h ],
      //     [ w, 0, h ],
      //   ], classes: "right"
      // },
      { 
        path: [ /* Back */
          [ 0, 0, 0 ], 
          [ w, d/2, 0 ], /* To the highest point she fiyed */
          [ w, d/2, h ],
          [ 0, 0, h ],
        ], 
        classes: "back", color: "#2c0b4f"
      },
      { 
        path: [ /* Front */
          [ 0, d, 0 ], 
          [ w, d/2, 0 ], /* A company she don't missing, even the same birds as she is. */
          [ w, d/2, h ], /* She Beacon is aligned to the sky. */
          [ 0, d, h ], /* Her feathers ain't got no specific color. */
        ], classes: "front", color: "#50177b"
      },                                       /* And she signs very silently. */
    ].map(translate3([ tx, ty, tz ]));

    const viewBox = [
      0, 0, 256, 256 /* maxPoint[0] - minPoint[0], maxPoint[1] - minPoint[1], */
    ];

    /* STATE */
    /* ----- */

    const canvas = ref(null);
    const state = reactive({
      ipos: [ 1, 0, 0 ],
      size2D: [ 0, 0, 0 ],
      angleZ: 0,
      origin: [ 0, 0, 10 ],
      log: '',
      camera: [ -64, -64 ],
      yePos: [ 20, 20, 0 ],
      canvas: {
        config: {
          scale: [ 2, 2, 2 ],
          setScale: (v) => state.canvas.config.scale = [ v, v, v ]
        }
      }
    });

    function rotateZ(p, origin, angleZ) { /*  origin[ x, y ] p[ x, y, z ]? */
      let x = p[0] - origin[0];
      let y = p[1] - origin[1];

      return [
        Math.round(x * Math.cos(angleZ) - y * Math.sin(angleZ) + origin[0]), /* X */
        Math.round(x * Math.sin(angleZ) + y * Math.cos(angleZ) + origin[1]), /* Y */
        p[2]                                                                 /* Z remains constant, we're rotating around world Z axis */
      ];
    };

    function rotateX(p, origin = [ 0, 0, 0 ], angleX) { 
      const v = [
        p[0] - origin[0],
        p[1] - origin[1],
        p[2] - origin[2],
      ];

      const r = matxv(matURotationX(angleX), v);

      return [
        r[0] + origin[0],
        r[1] + origin[1],
        r[2] + origin[2]
      ];
    }

    function rotateY(p, origin = [ 0, 0, 0 ], angleY) { 
      const v = [
        p[0] - origin[0],
        p[1] - origin[1],
        p[2] - origin[2],
      ];

      const r = matxv(matURotationY(angleY), v);

      return [
        r[0] + origin[0],
        r[1] + origin[1],
        r[2] + origin[2]
      ];
    }

    const rotate3Z = (origin, angleZ) => (item) => {
      item.path = item.path.map(point => rotateZ(point, origin, angleZ));
      return item;
    };

    const rotate3X = (origin, angleX) => (item) => {
      item.path = item.path.map(point => rotateX(point, origin, angleX));
      return item;
    };

    const rotate3Y = (origin, angleY) => (item) => {
      item.path = item.path.map(point => rotateY(point, origin, angleY));
      return item;
    };

    const angleZ = computed(() => state.angleZ * Math.PI / 180);

    const polyStyle = computed(() => {
      const logLines = [];

      const log = (...a) => {
        const s = [ "", ...a ].reduce((a, v) => a ? (a + " " + v) : v, "")
        logLines.push(s);
      };

      const ip = state.ipos;
      const [ cix, ciy, ciz ] = [ 0, 0, 0 ];
      const [ c2dx, c2dy ] = isoToScreen([ cix, ciy, ciz ]);
      log("For AngleZ: ", angleZ.value);

      const size = 20;
      const aCube = {
        origin: [ 0, 0, 0 ],
        sides: makeCube([ 4, 4, 4 ], [ -2, -2, -2 ])
      };
      // const xAxisArrow = {
      //   origin: [ 0, 0, 0 ],
      //   sides: makeArrow([ 1 * size, 0.5 * size, 1 * size ], [ 20 + 5, 0, 0 ]),
      // };

      const xArrow = {
        origin: [ 0, 0, 0 ],
        sides: [
          ...makeCube([ 1 * size, 0.5 * size, 0.5 * size ], [ 0 + 5, -0.25 * size, 0]),
          ...makeArrow([ 1 * size, 0.5 * size, 1 * size ], [ 20 + 5, -0.5 * size, 0 ])
        ],
        caption: {
          at: [ 50, 10, 0 ],
          text: "X"
        }
      };

      /* Originally here, but Vue's complaining */
      // const pool0 = inject("pool0");
      // const gymbal = pool0["44a4feb2-c146-4886-9b8c-1f0a3055acbc"];
      const pitch = gymbal.gymbal.pitch / 180 * Math.PI;
      const yaw = gymbal.gymbal.yaw / 180 * Math.PI;
      /* --- */

      const yArrow = {
        origin: [ 0, 0, 0 ],
        sides: [
          ...makeCube([ 1 * size, 0.5 * size, 0.5 * size ], [ 0 + 5, -0.25 * size, 0]),
          ...makeArrow([ 1 * size, 0.5 * size, 1 * size ], [ 20 + 5, -0.5 * size, 0 ])
        ].map(item => {
          item.path = item.path.map(p => rotateZ(p, [ 0, 0, 0 ], 90 * Math.PI / 180));
          return item;
        }),
        caption: {
          at: [ 0, 50, 0 ],
          text: "Y"
        }
      };

      const way = matxv(matURotationY(-yaw), [ gymbal.gymbal.distance || 1, 0, 0 ]);

      const wayFwd = matxv(matURotationZ(pitch), way);

      const targetPos = [
        state.yePos[0] + wayFwd[0],
        state.yePos[1] + wayFwd[1],
        state.yePos[2] + wayFwd[2],
      ];


      const ye = {
        origin: [ 0, 0, 0 ],
        sides: [
          ...makeCube([ 1, 1, 1 ], [ -0.5, -0.5, -0.5 ])
          .map(scale3([ 4, 4, 4 ]))
          .map(rotate3Y([ 0, 0, 0 ], -yaw))
          .map(rotate3Z([ 0, 0, 0 ], pitch))
          .map(translate3([ state.yePos[0], state.yePos[1], state.yePos[2] ])),
          ...makeCube([ 1, 1, 1 ], [ 0, -0.5, -0.5 ])
          .map(scale3([ (gymbal.gymbal.distance || 1), 1, 1 ]))
          .map(rotate3Y([ 0, 0, 0 ], -yaw))
          .map(rotate3Z([ 0, 0, 0 ], pitch))
          .map(translate3([ state.yePos[0], state.yePos[1], state.yePos[2] ])),
          
          ...makeArrow([ 1 * size/4, 1 * size/4, 1 * size/4 ], [ 0, -0.5 * size/4, -0.5 * size/4 ])
          .map(rotate3Y([ 0, 0, 0 ], -yaw))
          .map(rotate3Z([ 0, 0, 0 ], pitch))
          // .map(rotate3Y([ 0, 0, 0 ], -yaw))
          .map(translate3(targetPos))
          
          
        ]
      };

      log("YE", JSON.stringify(ye, null, 2));
      // console.log("ye", ye);

      // console.log("yarrow", yArrow);

      const output = [];
      const captions = [];

      

      /* Stage first: 
        Every polygons on the pipeline are transformed: 
          - apply rotation around their own origin in Isometric space
          - transform to screen coordinates
          - screen camera transformation
          - calculate average Depth in screen-space
          - generate SVG commands

        ... on the next stage we'll only have to sort them all together by av. depth and output to browser */
      /* ---- */
      [ aCube, xArrow, yArrow, ye ].map(item => { /* input: array of items to render
                                             output: array of SVG paths to display */
        const { origin, sides, caption } = item;
        // const origin = [ state.origin[0] + size / 2, state.origin[1] + size / 2, state.origin[2] + size / 2 ];        

        for (let i in sides) {
          let side = sides[i];
          if (side.noRender) continue;

          let totalDepth = 0, avDepth;
          let svg = 'M';

          let path = [];
          
          
          for(let i in side.path) {
            let p0 = rotateZ(side.path[i], [ state.origin[0] + origin[0], state.origin[1] + origin[1] ], angleZ.value); /* We've got cube corner points in ISO coords, lets' turn them */
                                                                      /* around Zero Point by the current angle. */
            let p1 = isoToScreen(p0); /* 2dx, 2dy, depth */
            
            path.push(p1);

            // pipe0(p1);    
            let p2 = [ p1[0]/* - minPoint[0] */ - state.camera[0], p1[1] - state.camera[1]/*  - minPoint[1]*/, p1[2] ]; /* Apply screen camera */

            
      
            totalDepth += p1[2];

            svg +=  p2[0] + "," + p2[1];
            if (i != side.path.length-1) {
              svg += ' L';
            } else {
              svg += ' Z';
            }
          }   
          
          // let svgs = `M${ p2.map(p => p[0] + "," + p[1]).join(" L") } Z`;
          output.push({
            svg,
            avDepth: totalDepth / side.path.length,
            classes: side.classes,
            path, /* Points 2D transformed with respect to screen camera?. Needed for canvas rendering */    
                 /* Actually we can branch the pipeline by passing different stages datasets to the next nodes!! */
            color: side.color
          });
        }

        if (caption) {
          const p0 = rotateZ(caption.at, [ state.origin[0], state.origin[1] ], angleZ.value);
          
          const p1 = isoToScreen([ p0[0], p0[1], 10 ]);

          const [ x, y ] = [ p1[0]/* - minPoint[0] */ - state.camera[0], p1[1] - state.camera[1]/*  - minPoint[1]*/, p1[2] ];

          captions.push({
            text: caption.text,
            x, y
          });
        }

        /* 
          {
            svgCommands: "..."
            avDepth: 34,
            classes: "..."
          }

          -- for all polygons

        /* Sort output by avDepth and we're done. */

      });

      output.sort((itemA, itemB) => itemB.avDepth - itemA.avDepth);

      const tr3 = (t = [ 0, 0, 0 ]) => p => ([ p[0] + t[0], p[1] + t[1], p[2] + t[2] ]);

      const renderToCanvas = (polys) => {
        if (!canvas.value) return;

        const canvasSize = [ 512, 512 ];
        const ctx = canvas.value.getContext("2d");
        ctx.clearRect(0, 0, canvasSize[0], canvasSize[1]);

        for (let i1 in polys) {
          let poly = polys[i1];
          let pathStarted = false;

          ctx.fillStyle = poly.color;
          ctx.beginPath();
          for (let i2 in poly.path) {
            let p1 = poly.path[i2];
            let p2 = sc3(state.canvas.config.scale, [ 0, 0, 0 ])(p1);
            let p3 = tr3([ 256, 256, 0 ])(p2);

            if (!pathStarted) {
              ctx.moveTo(p3[0], p3[1]);
              pathStarted = true;
            } else {
              ctx.lineTo(p3[0], p3[1]);
            }
          }
          ctx.closePath();
          ctx.fill();
        }        
      };

      renderToCanvas(output);

      return {
        svgSize: [ `${viewBox[2] * 2}px`, `${viewBox[3] * 2}px` ],
        polys: output,
        viewBox,
        captions
      };
    });

    const originPosition = computed(() => {
      
      const shift = [ viewBox[2]/2, viewBox[3]/2, 0 ];
      const [ c2dx, c2dy ] = isoToScreen(state.origin);

      return [ c2dx, c2dy ];
    });

    // watchEffect(() => {
    //   const [ cx, cy ] = isoToScreen(state.yePos);
    //   state.camera = [
    //     -64 + cx,
    //     - 64 + cy
    //   ]
    // });

    watch(() => state.yePos, v => {
      const size = 20;
      const [ cx, cy, cz ] = 
        isoToScreen(
          rotateZ([ state.yePos[0] * size, state.yePos[1] * size, state.yePos[2] * size ], [ 0, 0, 0 ], state.angleZ)
        );

      state.camera = [
        cx - 64,
        cy - 64,
        cz
      ]
    });

    // const pool0 = inject("pool0");
    // const gymbal = pool0["44a4feb2-c146-4886-9b8c-1f0a3055acbc"];
    // console.log("pool0", pool0);
    // watch(() => gymbal.gymbal.pitch, () => {

    // });

    return { state, polyStyle, originPosition, canvas };
  }
};


</script>

<style lang="scss" scoped>
.poly-svg {
  /*
    fill
    stroke
    stop-color
    flood-color
    lighting-color

    */
  fill: #11119c;
  /* stroke: transparent !important; */
  stroke-linejoin: bevel;
  
  
  path {
    stroke-mode: inside;
    stroke-linecap: butt !important;
  }

  .front {
    fill: #092346;
    stroke-mode: inside;
    stroke:  #092346;
    opacity: 1;
  }

  .top {
    fill: #438cc4;
    stroke:  #092346;
    opacity: 1;
  }

  .right {
    fill: #264e70;
    stroke:  #092346;
    opacity: 1;
  }

  .back {
    fill: #8f2b00;
    stroke:  #8f2b00;
    opacity: 1;
  }

  .bottom {
    fill: #ff7900;
    stroke:  #8f2b00;
    opacity: 1;
  }

  .left {
    fill: #cc4b00;
    stroke: #8f2b00;
    opacity: 1;
  }
}

.poly-canvas {
  border: 1px solid green;
  margin-top: -512px;
}

.p-center {
  stroke: orangered;
}

.small {
  font-size: 6px;
  font-weight: 700;
  text-shadow: 0 2px 2px white, 
               0 -2px 2px white,
               2px 0 2px white, 
               -2px 0 2px white;
}
</style>