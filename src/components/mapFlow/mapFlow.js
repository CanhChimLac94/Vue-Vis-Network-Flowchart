// import { DataSet, Network } from "vue-vis-network";
import { DataSet, Network } from "../vueVisNetwork/visNetwork";
import { contact, node, drawDiamondLinkPoint } from "./shape";

import { MODE } from "./constan";

const btnStrokeColor = '#8c8c8c';

const btnNode = (mode, title) => {
  return { mode, title }
}
const btnNodes = [
  new btnNode(MODE.ADD_PROCCESS, `
  <svg width="65" height="35">
    <ellipse cy="50%" rx="30" cx="32" ry="17" style="fill: none; stroke:${btnStrokeColor}; stroke-width:1"></ellipse>
  </svg>
 `),
  new btnNode(MODE.ADD_CARD, `
    <svg height="50" width="50">
      <rect width="100%" height="100%" style="fill:rgba(255, 255,255, 0); stroke-width:1; stroke:${btnStrokeColor}" />
    </svg>
  `),
  new btnNode(MODE.ADD_DIAMOND, `
    <svg height="65" width="65">
      <rect 
        style="fill:none; stroke:${btnStrokeColor}; stroke-width:1;" height="30" width="30" y="0" x="45%" transform="matrix(1, 1, 1, -1, -25, 2)">
      </rect>
    </svg>
  `),
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
      return {
        ...this.nodes.get(nodeId),
        ...this.getPosition(nodeId)
      }
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
    addContact(link) {
      const fromNode = this.getNode(link.from);
      const toNode = this.getNode(link.to);
      let arrows = {};
      if (fromNode.type === MODE.DIAMOND) {
        arrows = {
          from: {
            enabled: false
          }
        }
      }
      if (toNode.type === MODE.DIAMOND) {
        arrows = {
          ...arrows,
          to: {
            enabled: false
          }
        }
      }
      this.edges.add(contact({
        ...link,
        arrows
      }));
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
    afterDrawing(ctx) {
      const edges = this.edges.get();
      edges.forEach((link) => {
        const fromNode = this.getNode(link.from);
        const toNode = this.getNode(link.to);
        if (fromNode.type === MODE.DIAMOND) {
          drawDiamondLinkPoint(ctx, fromNode, toNode, true);
        }
        if (toNode.type === MODE.DIAMOND) {
          drawDiamondLinkPoint(ctx, toNode, fromNode, false);
        }
      });
    },
    selectNode(param) {

    },
    showContextMenu(val = true) {
      this.isShowContextMenu = val;
    },

    test() {
      console.log("TEST:",);
    }
  },
  mounted() {
    this.init();
  }
};
