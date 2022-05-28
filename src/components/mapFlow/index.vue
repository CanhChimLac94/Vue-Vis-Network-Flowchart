<template>
  <div class="row">
    <div class="col map-acions">
      <button
        class="drag"
        draggable="true"
        v-for="(btn, bindex) in btnNodes"
        :class="isActionMode(btn.mode) ? 'active' : ''"
        :key="bindex"
        v-html="btn.title"
        @mousedown="addNodeClick(btn.mode)"
        @mouseup="refreshSelectedNode"
      ></button>

      <button
        :class="isActionMode(MODE.ADD_CONTACT) ? 'active' : ''"
        @click="addContactClick"
      >
        Link
      </button>
    </div>
    <!-- <img alt="Vue logo" src="../../assets/bg.png" /> -->
    <div
      class="col map-flow"
      :style="{
        backgroundImage: `url(${bg_img})`,
      }"
    >
      <network
        ref="msp_flow"
        :nodes="nodes"
        :edges="edges"
        :options="options"
        @click="onClickMap"
        @select-node="selectNode"
        @edges-add="edgesEvent"
        @before-drawing="drawBg"
        @control-node-dragging="controlNodeDragging"
        @dragging="dragging"
        @hover-edge="hoverEdge"
        @on-drop="ondropMap"
      ></network>
      <!-- @after-drawing="drawBg" -->

      <div
        class="context-menus"
        :class="isShowContextMenu ? 'show' : ''"
        :style="contextMenuPosition"
      >
        <ul class="node-actions">
          <li>Edit Node</li>
          <li @click="deleteSelect">Delete Node</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import mapFlow from "./mapFlow";
const bg_img = require("../../assets/bg.png");

export default {
  mixins: [mapFlow],
  data() {
    return {
      bg_img,
    };
  },
};
</script>
<style lang="scss" scoped>
@import "./mapFlow.scss";
</style>
