<template>
  <!-- <img alt="Vue logo" src="./assets/bg.png" /> -->
  <div>
    <map-flow />
    <!-- <net-work :nodes="nodes" :edges="edges" :options="options" /> -->
  </div>
</template>

<script>
// import HelloWorldVue from "./components/HelloWorld.vue";
import mapFlow from "./components/mapFlow";
// import NetWork from "./components/visNetworkCustom/Network.vue";

export default {
  name: "App",
  components: {
    mapFlow,
    // NetWork,
  },
  data() {
    return {
      nodes: [
        {
          id: 1,
          label: "demo",
          shape: "custom",
          ctxRenderer: (params) => {
            console.log("ctxRenderer", { params });
            return {
              draw: (ctx) => {},
            };
          },
        },
      ],
      edges: [],
      options: {
        width: "100%",
        height: "900px",
      },
      firstNode: null,
      secondNode: null,
      isShowContextMenu: false,
      contextMenuPosition: {
        top: "0px",
        left: "0px",
      },
    };
  },
};
</script>

<style>
/* #app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
} */
</style>
