<template>
  <div class="relative-position" :style="state.taStyle">
    <textarea 
      v-model="state.code" class="code-input" @keydown.capture="taKeydown" @input="taKeydown" @scroll="taScroll" @keyup="taKeypress"
      @mousedown.capture.stop ref="ta"
    >

    </textarea>
    <pre class="code-output" ref="output">
      <code class="language-javascript" v-html="state.output" />
    </pre>
  </div>
</template>

<style lang="scss" scoped>
  .code-input, .code-output{
    position:absolute;
    top:0;
    left:0;
    width:100%;
    height:100%;
    border:none;
    font-family:'PT Mono', monospace;
    background:transparent;
    white-space:pre-wrap;
    line-height:1.5em;
    word-wrap: break-word;
  }
  
  .code-input{
    opacity: 1;
    margin: 0;
    resize: none;
    outline: none;
    color: transparent;
    caret-color: #ffc700;

    &::selection {
      color: transparent;
      background: rgb(44, 44, 44);
    }
  }
  
  .code-output{
    pointer-events:none;
    z-index:3;
    margin:0;
    overflow-y:auto;
    
    code {
      position:absolute;
      top:0;
      left:0;
      margin:0;
      display:block;
      color:#666;
      font-family:'PT Mono', monospace;

      ::v-deep(.token.punctuation) {
        color: #79737e;
      }

      ::v-deep(.token.string) {
        color: #e99507;
      }

      ::v-deep(.token.number) {
        color: #728203;
      }

      ::v-deep(.token.keyword) {
        color: #0146c9;
        font-weight: 600;
      }

      ::v-deep(.token.boolean) {
        color: #c9010b;
        font-weight: 600;
      }
    }
  }

  // code[class*="language-"],
  // pre[class*="language-"] {
  //   color: black;
  //   background: none;
  //   text-shadow: 0 1px white;
  //   font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
  //   font-size: 1em;
  //   text-align: left;
  //   white-space: pre;
  //   word-spacing: normal;
  //   word-break: normal;
  //   word-wrap: normal;
  //   line-height: 1.5;

  //   -moz-tab-size: 2;
  //   -o-tab-size: 2;
  //   tab-size: 2;

  //   -webkit-hyphens: none;
  //   -moz-hyphens: none;
  //   -ms-hyphens: none;
  //   hyphens: none;
  // }

  // pre[class*="language-"]::-moz-selection, pre[class*="language-"] ::-moz-selection,
  // code[class*="language-"]::-moz-selection, code[class*="language-"] ::-moz-selection {
  //   text-shadow: none;
  //   background: #b3d4fc;
  // }

  // pre[class*="language-"]::selection, pre[class*="language-"] ::selection,
  // code[class*="language-"]::selection, code[class*="language-"] ::selection {
  //   text-shadow: none;
  //   background: #b3d4fc;
  // }

  // @media print {
  //   code[class*="language-"],
  //   pre[class*="language-"] {
  //     text-shadow: none;
  //   }
  // }

  // /* Code blocks */
  // pre[class*="language-"] {
  //   padding: 1em;
  //   // margin: .5em 0;
  //   overflow: auto;
  // }

  // :not(pre) > code[class*="language-"],
  // pre[class*="language-"] {
  //   background: #f5f2f0;
  // }

  // /* Inline code */
  // :not(pre) > code[class*="language-"] {
  //   padding: .1em;
  //   border-radius: .3em;
  //   white-space: normal;
  // }

  // .token.comment,
  // .token.prolog,
  // .token.doctype,
  // .token.cdata {
  //   color: slategray;
  // }

  // .token.punctuation {
  //   color: #999;
  // }

  // .token.namespace {
  //   opacity: .7;
  // }

  // .token.property,
  // .token.tag,
  // .token.boolean,
  // .token.number,
  // .token.constant,
  // /deep/ .token.symbol,
  // .token.deleted {
  //   color: #905;
  // }

  // .token.selector,
  // .token.attr-name,
  // .token.string,
  // .token.char,
  // .token.builtin,
  // .token.inserted {
  //   color: #690;
  // }

  // /deep/ .token.operator,
  // .token.entity,
  // .token.url,
  // .language-css .token.string,
  // .style .token.string {
  //   color: #9a6e3a;
  //   /* This background color was intended by the author of this theme. */
  //   // background: hsla(0, 0%, 100%, .5);
  // }

  // .token.atrule,
  // .token.attr-value,
  // .token.keyword {
  //   color: #07a;
  // }

  // .token.function,
  // .token.class-name {
  //   color: #DD4A68;
  // }

  // .token.regex,
  // .token.important,
  // .token.variable {
  //   color: #e90;
  // }

  // .token.important,
  // .token.bold {
  //   font-weight: bold;
  // }
  // .token.italic {
  //   font-style: italic;
  // }

  // .token.entity {
  //   cursor: help;
  // }
</style>

<script>
import { reactive, computed, ref, nextTick, watchEffect } from "vue";
import Prism from "../../libs/prism.min.js";

export default {
  props: {
    value: String,
    autogrow: Boolean,
    watch: Boolean
  },
  setup(props) {
    const output = ref(null);
    const ta = ref(null);

    const state = reactive({
      code: props.value || "",
      scrollTop: computed({
        set: v => output.value.scrollTop = v,
        get: () => output.value.scrollTop
      }),
      output: computed(() => {
        // if (typeof state.code == 'undefined') return '- undefined -'; 
        const code = state.code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "\n";
        return Prism.highlight(code, Prism.languages.js, 'js');
      }),
      taStyle: computed(() => {
        if (ta.value && state.code) {
          const h = Math.min(Math.max(ta.value.scrollHeight, 46), 240);
          return { height: `${h}px` };
        } else {
          return { height: `46px` };
        }
      })  
    });

    if (props.watch) watchEffect(() => {
      state.code = props.value || "";
    });

    const taKeydown = (e) => {
      const input = e.target,
      selStartPos = input.selectionStart,
      inputVal = input.value;

      if (e.keyCode === 9) {
        state.code = inputVal.substring(0, selStartPos) + "  " + inputVal.substring(selStartPos, input.value.length);
        nextTick(() => {
          input.setSelectionRange(selStartPos + 2, selStartPos + 2);
        });
        
        // input.selectionStart = selStartPos + 2;
        // input.selectionEnd = selStartPos + 2;
        e.preventDefault();
        console.log("prevented", selStartPos, input.selectionStart, input.selectionEnd);
      }

      Prism.highlightAll();      
    };

    // watchEffect(() => {
    //   if (ta.value && state.code) {
    //     const h = Math.min(Math.max(ta.value.scrollHeight, 20), 240);
    //     state.taStyle.height = `${h}px`;
    //   }      
    // });

    const taKeypress = (e) => {
      if (e.keyCode === 9) {
        e.preventDefault();
        console.log("prevented!");
      }
    };

    const taScroll = (e) => {
      state.scrollTop = e.target.scrollTop;
    };

    return { state, taKeydown, output, taScroll, taKeypress, ta };
  }
};
</script>
