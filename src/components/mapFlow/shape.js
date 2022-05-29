import { MODE } from "./constan";

const _stroke_color_selected = "#6ab8ed";
const _stroke_color = "#cdcdcd";

const { round: r, abs, sqrt, atan, sin, cos, tan, PI } = Math;
const diamondShape = { x: 32, y: 32 };

const nodeBase = (options) => {
  const id = options.id || Date.now();
  const x = options.x || null;
  const y = options.y || null;

  return {
    id,
    x,
    y,
    type: options.type || 'card',
    shape: "ellipse",
    fixed: false,
    physics: false,
    size: 100,
    font: { multi: true },
    widthConstraint: { minimum: 100 },
    heightConstraint: { minimum: 50 },
    color: {
      background: "rgba(255, 255, 255, 0.5)",
      highlight: {
        background: "rgba(255, 255, 255, 0.5)",
        border: `${_stroke_color_selected}`
      },
      border: `${_stroke_color}`
    }
  };
};

const cardSvg = (options = {}, isSelected = false) => {
  const o = options;
  const w = o.w || o.width || "100";
  const h = o.h || o.height || "80";
  // const x = 10;
  // const y = 10;
  // const rx = 0;
  // const ry = 0;
  // const style = o.style || "color: #FFF;";
  // const bg_color = o.title?.background || "#686868";
  // const stroke_width = o.stroke?.width || "0";
  // const stroke_color = o.stroke?.color || "#CCC";
  const title = o.title || "Demo";
  const stroke_color_selected =
    o.stroke?.color_selected || _stroke_color_selected;
  const stroke_color = o.stroke?.color || _stroke_color;

  const menu_posistion_x = w - w * 0.1;

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect x="0" y="0"
        width="100%"
        height="100%"
        fill="rgba(255, 255, 255, 0.5)"
        stroke-width="${isSelected ? 1 : 0.5}"
        stroke="${isSelected ? stroke_color_selected : stroke_color}"
    ></rect>
      
    <foreignObject 
      x="0"
      y="0" 
      width="100%"
      height="100%"
    >
      <div class="container"  xmlns="http://www.w3.org/1999/xhtml" >
        <div class="title px-2">
          ${title}
        </div>
        <div class="content px-2">
          noi dung
        </div>
      </div>
    </foreignObject>

    <circle cx="${menu_posistion_x}" cy="8" r="2" stroke="#ddccdd" stroke-width="1" fill="#FFF" />
    <circle cx="${menu_posistion_x}" cy="14" r="2" stroke="#ddccdd" stroke-width="1" fill="#FFF" />
    <circle cx="${menu_posistion_x}" cy="20" r="2" stroke="#ddccdd" stroke-width="1" fill="#FFF" />

    <defs>
      <style>
        .container{
          width: 100%;
          height: 100%;
        }
        .px-2{
          padding: 0px 5px;
        }
        .title{
          color: #FFF;
          background-color: #686868;
          min-height: 25px;
          padding-top: 5px;
        }

      </style>
    </defs>
  </svg>
  `;
  // return svg;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const card = (options = {}) => {
  return {
    ...nodeBase(options),
    image: {
      unselected: cardSvg(options),
      selected: cardSvg(options, true)
    },
    shape: "image"
  };
};

const proccess = (options = {}) => {
  return {
    ...nodeBase(options),
    label: `${options.title}`,
    shape: "ellipse"
  };
};

const diamond = (options) => {
  return {
    ...nodeBase(options),
    shape: "custom",
    // shape: "hexagon",

    ctxRenderer: function ({
      ctx,
      id,
      x,
      y,
      state: { selected, hover },
      style
    }) {
      const diamondShape = { dx: 32, dy: 32 };
      const shape = diamondShape;
      const borderDashes = this.options?.shapeProperties?.borderDashes;
      return {
        drawNode() {
          ctx.strokeStyle = "cornflowerblue";
          ctx.lineWidth = 4;
          if (Array.isArray(borderDashes)) {
            ctx.setLineDash(borderDashes);
          }
          ctx.beginPath();
          ctx.moveTo(x, y - shape.dy);
          ctx.lineTo(x + shape.dx, y);
          ctx.lineTo(x, y + shape.dy);
          ctx.lineTo(x - shape.dx, y);
          ctx.closePath();
          ctx.stroke();

          ctx.fillStyle = selected ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.5)";
          ctx.fill();

          ctx.fillStyle = "black";
          // ctx.font = FONT;
          const textMeasurement = ctx.measureText("IF");
          const lineHeight =
            textMeasurement.actualBoundingBoxAscent +
            textMeasurement.actualBoundingBoxDescent;
          ctx.fillText(
            "IF",
            x - Math.round(textMeasurement.width / 2),
            y + Math.round(lineHeight / 2)
          );
        },
        nodeDimensions: {
          width: shape.dx * 2,
          height: shape.dy * 2
        }
      };
    }
  };
};

const contact = (options = {}) => {
  const from = options.from || null;
  const to = options.to || null;
  if (!from || !to) {
    return;
  }
  let arrows = {
    middle: false,
    to: {
      type: "vee",
      enabled: true,
      scaleFactor: 1
    },
    from: {
      type: "circle",
      enabled: true,
      scaleFactor: 1
    },
    ...options.arrows || {},
  };
  return {
    from,
    to,
    arrows,
    smooth: false,
    physics: false,
    chosen: {
      edge: (values, id, selected, hovering) => {
      }
    },
    color: {
      color: `${_stroke_color_selected}`,
      highlight: `${_stroke_color_selected}`,
      inherit: "from",
      opacity: "1.0"
    },
    selectionWidth: 1,
  };
};

const drawPath = (ctx, points) => {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (var i = 1; i < points.length; ++i) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
}

const drawDiamondLinkPoint = (ctx, diamond, othertNode, isFrom = true) => {
  const start = othertNode;
  const translateXY = 8;
  const shapeSize = diamondShape.x + translateXY;
  const dx = start.x - diamond.x;
  const dy = diamond.y - start.y;
  const angle = atan(dy / dx);
  const hypotenuse = sqrt(2 * shapeSize ** 2) / 2 / cos(PI / 4 - abs(angle));
  const x = cos(abs(angle)) * hypotenuse * (dx < 0 ? -1 : 1);
  const y = sin(abs(angle)) * hypotenuse * (dy < 0 ? 1 : -1);

  ctx.fillStyle = _stroke_color_selected;

  if (isFrom) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(diamond.x + x, diamond.y + y, 5, 0, 360);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.stroke();
  }
  if (!isFrom) {
    ctx.save();
    ctx.beginPath();
    ctx.translate(diamond.x + x, diamond.y + y);
    ctx.rotate(dx >= 0 ? -angle : PI - angle);
    ctx.translate(-diamond.x - x, -diamond.y - y);
    ctx.moveTo(diamond.x + x - translateXY + 2, diamond.y + y);
    ctx.lineTo(
      diamond.x + x + translateXY,
      diamond.y + y - translateXY / 2
    );
    ctx.lineTo(
      diamond.x + x + translateXY / 5,
      diamond.y + y
    );
    ctx.lineTo(
      diamond.x + x + translateXY,
      diamond.y + y + translateXY / 2
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
};

const node = (options = {}) => {
  return NODES[options.type || MODE.ADD_CARD](options);
};

const NODES = { card, proccess, diamond };
const link = contact;
export { contact, link, node, drawDiamondLinkPoint };
