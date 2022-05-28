import { MODE } from "./constan";

const _stroke_color_selected = "#6ab8ed";
const _stroke_color = "#cdcdcd";

const nodeBase = (options) => {
  const id = options.id || Date.now();
  const x = options.x || null;
  const y = options.y || null;

  return {
    id,
    x,
    y,
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

    ctxRenderer: function ({ ctx, id, x, y, state: { selected, hover }, style }) {
      const r = style.size;
      console.log({ ctx, id, x, y, state: { selected, hover }, style });
      const drawNode = () => {
        ctx.beginPath();
        const sides = 6;
        const a = (Math.PI * 2) / sides;
        ctx.moveTo(x, y + r);
        for (let i = 1; i < sides; i++) {
          ctx.lineTo(x + r * Math.sin(a * i), y + r * Math.cos(a * i));
        }
        ctx.closePath();
        ctx.save();
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        ctx.font = "normal 12px sans-serif";
        ctx.fillStyle = "black";
        ctx.fillText("custom shape", x - r + 10, y, 2 * r - 20);
      };
      return {
        drawNode,
        nodeDimensions: { width: r * 2, height: r * 2, top: 10, right: 10 }
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
  return {
    from,
    to,
    arrows: {
      to: {
        type: "vee",
        enabled: true
      },
      from: {
        type: "circle",
        enabled: true
      }
    },
    smooth: false,
    physics: false,
    chosen: {
      edge: (values, id, selected, hovering) => {
        // console.log("chosen edge", { values, id, selected, hovering });
      }
    },
    color: {
      color: `${_stroke_color_selected}`,
      highlight: `${_stroke_color_selected}`,
      // hover: "#848484",
      inherit: "from",
      opacity: "1.0"
    },
    selectionWidth: 1,
    arrowStrikethrough: true,
    selfReference: {
      size: 30,
      renderBehindTheNode: false
    }
    // endPointOffset: {
    //   from: 100,
    //   to: -100
    // }
    // dashes: true
  };
};

const node = (options = {}) => {
  return NODES[options.type || MODE.ADD_CARD](options);
};

const NODES = { card, proccess, diamond };
const link = contact;
export { contact, link, node };
