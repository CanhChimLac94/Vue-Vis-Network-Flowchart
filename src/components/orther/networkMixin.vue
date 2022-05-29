<script>
export default {
  methods: {
    init() {
      return {
        addEdge: (edge, callback) => {
          const errorMsg = this.validateLink(edge);
          if (!!errorMsg) return this.$notify(errorMsg);

          // @TODO: check link default type
          // eg: if link before an <IF> node, set default type to LNK_999998 (Unselected)
          // Otherwise link default type is null
          const headNode = this.findNode(edge.from);
          const newLink = new LinkModel({
            type: 'Link',
            triggerType:
              headNode?.type !== TYPES_NODE.IF
                ? 'UNSELECTED'
                : null,
          });
          const newLinkSpawned = {
            ...newLink,
            data: { ...newLink.data },
            id: `${edge.from}:${edge.to}`,
            from: +edge.from,
            to: +edge.to,
          };
          // newLinkSpawned.data.type = null
          // newLinkSpawned.data.typeName = ''

          // if (headNode?.type !== TYPES_NODE.IF) {
          //   newLinkSpawned.data.type = 'LNK_999998'
          //   newLinkSpawned.data.typeName = 'Unselected'
          // }

          try {
            callback({
              ...edge,
              id: `${edge.from}:${edge.to}`,
              ...new EdgeConfigVisModel({}),
            });
            this.localLinks.push({ ...newLinkSpawned });

            // Update link parse data
            this.updateLinkParseData();

            // Update network
            this.updateNetwork();

            this.network.disableEditMode();
            this.network.unselectAll();
          } catch (error) {}

          // Tell Workflow component network updated
          this.internalChannel.$emit("network-updated");
        },
      };
    },
    afterDrawing() {
      this.network.on("afterDrawing", ({ canvas }) => {
        const { round: r, abs, sqrt, atan, sin, cos, tan, PI } = Math;
        const ctx = canvas.getContext("2d");

        const { edges, nodes } = this.network.body;
        if (this.detailsOn) {
          // @TODO: Centralize edge label since custom node [x, y] was placed at center of node instead of top-left
          function findDescent(fromNode, toNode) {
            const diagonalAngle = abs(
              atan(toNode.shape.height / toNode.shape.width)
            );
            const angle = abs(
              atan((toNode.y - fromNode.y) / (fromNode.x - toNode.x))
            );

            let dx = 0,
              dy = 0;
            if (angle >= diagonalAngle) {
              dx = toNode.shape.height / 2 / tan(angle);
              dy = toNode.shape.height / 2;
            } else {
              dy = (tan(angle) * toNode.shape.width) / 2;
              dx = toNode.shape.width / 2;
            }

            return {
              dx: dx * (fromNode.x < toNode.x ? -1 : 1),
              dy: dy * (toNode.y < fromNode.y ? 1 : -1),
            };
          }

          ctx.font = FONT;
          const padding = { left: 10, top: 5, right: 10, bottom: 5 };

          for (const { from, to, triggerType } of this.localLinks) {
            const triggerTypeName = this.getLinkConditionName(triggerType);
            if (
              this.nodeSet[from]?.type !==
                this.$lego.CONST.DESIGN.TYPES_NODE.IF ||
              !triggerTypeName
            )
              continue;
            const textMeasurement = ctx.measureText(triggerTypeName);
            const lineHeight =
              textMeasurement.actualBoundingBoxAscent +
              textMeasurement.actualBoundingBoxDescent;

            const descentFrom = findDescent(nodes[to], nodes[from]);
            const descentTo = findDescent(nodes[from], nodes[to]);
            const x = r(
              (nodes[from].x +
                nodes[to].x -
                textMeasurement.width +
                descentFrom.dx +
                descentTo.dx) /
                2
            );
            const y = r(
              (nodes[from].y +
                nodes[to].y +
                lineHeight +
                descentFrom.dy +
                descentTo.dy) /
                2
            );

            // Draw bound
            ctx.fillStyle = "rgba(88, 90, 212, 0.9)";
            ctx.beginPath();
            ctx.fillRect(
              x - padding.left,
              y - lineHeight - padding.top,
              textMeasurement.width + padding.left + padding.right,
              r(lineHeight * 1.5) + padding.bottom
            );
            ctx.closePath();

            // Draw label
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.fillText(triggerTypeName, x, y);
            ctx.closePath();
          }
        }
        // @TODO: Draw start point|end point of link to IF shape
        if (!Object.keys(edges).length) return;

        const drawCustomLinkPoint = (link, { from, to }) => {
          const start = nodes[from ? link.toId : link.fromId];
          const diamond = nodes[to ? link.toId : link.fromId];

          const translateXY = 8;
          const shapeSize = diamondShape.dx + translateXY;

          const dx = start.x - diamond.x;
          const dy = diamond.y - start.y;
          const angle = atan(dy / dx);

          const hypotenuse =
            sqrt(2 * shapeSize ** 2) / 2 / cos(PI / 4 - abs(angle));
          // const origHypotenuse = shapeSize / cos(abs(angle))

          const x = cos(abs(angle)) * hypotenuse * (dx < 0 ? -1 : 1);
          const y = sin(abs(angle)) * hypotenuse * (dy < 0 ? 1 : -1);

          ctx.fillStyle =
            edges[link.id]
              .selected /*nodes[start.id].selected || nodes[diamond.id].selected ||*/ ||
            this.hoverOnSubject === link.id ||
            this.hoverOnSubject === link.fromId ||
            this.hoverOnSubject === link.toId
              ? "#7172da"
              : "#838791";

          if (from) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(diamond.x + x, diamond.y + y, 5, 0, 360);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
          if (to) {
            ctx.save();
            ctx.beginPath();
            ctx.translate(diamond.x + x, diamond.y + y);
            ctx.rotate(dx >= 0 ? -angle : PI - angle);
            ctx.translate(-diamond.x - x, -diamond.y - y);
            ctx.moveTo(diamond.x + x - translateXY + 2, diamond.y + y);
            ctx.lineTo(
              diamond.x + x + translateXY,
              diamond.y + y - translateXY + translateXY / 2
            );
            ctx.lineTo(
              diamond.x + x + translateXY,
              diamond.y + y + translateXY - translateXY / 2
            );
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
        };

        // Loop throught links to update each linked to IF
        for (const link of Object.values(edges)) {
          if (
            this.nodeSet[link.fromId]?.type ===
            this.$lego.CONST.DESIGN.TYPES_NODE.IF
          )
            drawCustomLinkPoint(link, { from: true });
          if (
            this.nodeSet[link.toId]?.type ===
            this.$lego.CONST.DESIGN.TYPES_NODE.IF
          )
            drawCustomLinkPoint(link, { to: true });
        }
      });
      // this.unSelectNodes()
    },
  },
};
</script>