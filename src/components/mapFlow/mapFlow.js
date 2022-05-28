// import { DataSet, Network } from "vue-vis-network";
import { DataSet, Network } from "../visNetworkCustom/visNetwork";
import { contact, node } from "./shape";

import { MODE } from "./constan";

const btnNode = (mode, title) => {
  return {mode, title}
}

const btnNodes = [
  new btnNode(MODE.ADD_PROCCESS, `Drag Proccess`),
  new btnNode(MODE.ADD_CARD, `Drag Card`),
  new btnNode(MODE.ADD_DIAMOND, `Drag Diamond`),
];

export default {
  name: "visDemo",
  components: { Network },
  computed: {
    map() {
      return this.$refs.msp_flow;
    },
  },
  data() {
    return {
      MODE,
      btnNodes,
      nodes: new DataSet([]),
      edges: new DataSet([
        // contact({from: 1, to: 2})
      ]),
      options: {
        width: "100%",
        height: "900px"
      },
      actionMode: MODE.NONE,
      firstNode: null,
      secondNode: null,
      isShowContextMenu: false,
      contextMenuPosition: {
        top: "0px",
        left: "0px"
      }
    };
  },
  methods: {
    init() {
      // TEST
      // console.log('nodes', { nodes: this.nodes });
      // END TEST

      this.options = {
        ...this.options,
        manipulation: {
          ...this.options.manipulation,
          enabled: false,
          addEdge: (data, callback) => {
            this.addContact({
              ...data
            });
          }
        }
      };
    },
    getNode(nodeId) {
      return this.nodes.get(nodeId);
    },
    getPosition(nodeId) {
      return this.map.getPositions(nodeId)[nodeId];
    },
    onClickMap(param) {
      // console.log("on click map", { param });
      // hidde context menu
      this.showContextMenu(false);
      const { nodes, pointer, event } = param;

      if (nodes.length > 0) {
        // check select node
        const node = this.getPosition(nodes[0]);

        let x = pointer.canvas.x - node.x;
        let y = pointer.canvas.y - node.y;
        x = x < 0 ? -x : x;
        y = y < 0 ? -y : y;
        if (x > 90 && x < 110 && y < 95 && y > 40) {
          // show context menu
          this.contextMenuPosition = {
            left: `${event.center.x}px`,
            top: `${event.center.y}px`
          };
          this.showContextMenu(true);
        }

        // console.log("node:", { node, param, x, y });
      }
    },
    ondropMap(evt) {
      const pointer = this.map.domToCanvas({
        x: evt.layerX,
        y: evt.layerY
      });
      if (this.actionMode) {
        this.addNode(pointer, this.actionMode);
        this.refreshSelectedNode();
      }
    },
    addNodeClick(NODE) {
      if (this.actionMode === NODE) {
        this.refreshSelectedNode();
      } else {
        this.actionMode = NODE;
      }
    },
    addContactClick() {
      if (this.actionMode === this.MODE.ADD_CONTACT) {
        this.refreshSelectedNode();
      } else {
        this.actionMode = this.MODE.ADD_CONTACT;
        this.map.addEdgeMode();
      }
    },
    addContact(data) {
      this.edges.add(contact(data));
      this.refreshSelectedNode();
    },
    addNode(pointer, type = "card") {
      const title = `${type} ${this.nodes.length}`;
      const newNode = node({
        title,
        x: pointer.x,
        y: pointer.y,
        type
      });

      this.nodes.add(newNode);
      this.refreshSelectedNode();
    },
    deleteSelect() {
      this.map.deleteSelected();
      this.showContextMenu(false);
    },
    refreshSelectedNode() {
      this.actionMode = this.MODE.NONE;
      this.firstNode = null;
      this.secondNode = null;
    },
    isActionMode(mode) {
      return this.actionMode === mode;
    },
    drawBg(ctx) {
      // const W = ctx.canvas.width / 2;
      // const H = ctx.canvas.height / 2;
      // ctx.beginPath();
      // for (let x = -W; x < W; x += 10) {
      //   ctx.moveTo(x, -H);
      //   ctx.lineTo(x, H);
      // }
      // for (let y = -H; y < H; y += 10) {
      //   ctx.moveTo(-W, y);
      //   ctx.lineTo(W, y);
      // }
      // ctx.lineWidth = 1;
      // ctx.strokeStyle = "#ccc";
      // ctx.stroke();
      // ctx.closePath();
      // console.log("draw bg", { ctx, W, H });
      //------------
      // var pos = this.map.getPositions([1, 2]);
      // ctx.strokeStyle = ctx.filStyle = "green";
      // ctx.moveTo(pos[1].x, pos[1].y);
      // ctx.lineTo(
      //   pos[1].x + ((pos[2].x - pos[1].x) * percent) / 100,
      //   pos[1].y + ((pos[2].y - pos[1].y) * percent) / 100
      // );
      // ctx.fill();
      // ctx.stroke();
    },
    controlNodeDragging(param) {
      // console.log("controlNodeDragging", { param });
    },
    dragging(param) {
      // console.log("Dragging", { param });
    },
    selectNode(param) {
      console.log("select node", { param });
    },
    edgesEvent(param) {
      console.log(`edges ${param.event}`, { param });
    },
    hoverEdge(param) {
      console.log("hover edge", { param });
    },
    showContextMenu(val = true) {
      this.isShowContextMenu = val;
    },

    test() {
      console.log("TEST:", { nodes: this.nodes.get() });
    }
  },
  mounted() {
    this.init();
  }
};
