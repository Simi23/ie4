<script lang="ts" setup>
interface Props {
  svgId: string;
  letterStroke?: string;
  seatStroke?: string;
  arrowStroke?: string;
  multiColors?: string[][];
}

const {
  svgId,
  letterStroke = "#000000",
  seatStroke = "#000000",
  arrowStroke = "#000000",
  multiColors = [],
} = defineProps<Props>();

const emit = defineEmits(["chosenSeat"]);

const baseColor = ref<string>("");
const originalColors = ref<Record<string, string>>({});

/**
 * Returns an SVGRectElement in the map from the seat name.
 * @param seatName The name of the seat
 */
function getSeat(seatName: string): SVGRectElement | null {
  let svg = document.getElementById(svgId);
  let rects = svg?.getElementsByTagName("rect");

  if (rects == undefined) {
    return null;
  }

  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (!r) continue;
    const seatNameCur =
      r.attributes.getNamedItem("inkscape:label")?.value ?? "unknown";
    if (seatNameCur == seatName) {
      return r;
    }
  }

  return null;
}

/**
 * Returns all the seat rectangles.
 */
function getAllSeats(): HTMLCollectionOf<SVGRectElement> | null {
  let svg = document.getElementById(svgId);
  let rects = svg?.getElementsByTagName("rect");

  if (rects == undefined) {
    return null;
  }

  return rects;
}

function colorMultiply(seat: SVGRectElement, multiplier: number): string {
  const current = getComputedStyle(seat).fill;
  const m = current.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if (m) {
    let c = [Number(m[1]), Number(m[2]), Number(m[3])];
    c = c.map((col) => Math.min(Math.max(col * multiplier, 0), 255));
    return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  }
  return seat.style.fill;
}

/**
 * Set seat colour.
 * @param seatName The seat to modify. If set to `all`, applies to all seats.
 * @param color Any color string that is accepted by CSS
 * @param changeBase Whether to change the original colors of the map. Defaults to true, intended for internal use only.
 */
function changeSeatColour(seatName: string, color: string, changeBase = true) {
  if (seatName == "all") {
    if (changeBase) {
      baseColor.value = color;
    }
    let rects = getAllSeats();
    if (rects == null) return;
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      if (!r) continue;
      r.style.fill = color;
    }
    return;
  }

  const seat = getSeat(seatName);
  if (seat === null) return;
  if (changeBase) {
    originalColors.value[seatName] = color;
  }
  seat.style.fill = color;
}

/**
 * Highlights a given seat by increasing its lightness.
 * @param seatName The seat to be highlighted
 * @param darken Whether to darken the other seats. Base seats will not be darkened.
 * @param nocancel If set to true, other highlights will not be cancelled.
 */
function highlightSeat(
  seatName: string,
  darken: boolean,
  nocancel?: boolean,
): void {
  const keys = Object.keys(originalColors.value);
  if (!keys.includes(seatName)) return;
  const seat = getSeat(seatName);
  if (seat === null) return;
  if (nocancel != true) {
    cancelHighlight();
  }

  const newCol = colorMultiply(seat, 1.3);
  seat.style.fill = newCol;
  if (darken) {
    keys.forEach((key) => {
      if (key == seatName) return;
      const curSeat = getSeat(key);
      if (curSeat === null) return;
      const darker = colorMultiply(curSeat, 0.7);
      curSeat.style.fill = darker;
    });
  }
}

/**
 * Cancels highlighting and returns all seats to their default colour.
 */
function cancelHighlight(): void {
  const keys = Object.keys(originalColors.value);
  keys.forEach((key) => {
    const curSeat = getSeat(key);
    if (curSeat === null) return;
    curSeat.style.fill = originalColors.value[key] ?? "#000";
  });
}

/**
 * Make seat clickable and assign a click event to it.
 * @param seatName The seat to modify
 * @param emitName The param string to call `chosenSeat` event with, if omitted, the event is called with `seatName` instead.
 */
function assignSeat(seatName: string, emitName?: string) {
  let svg = document.getElementById(svgId);
  let rects = svg?.getElementsByTagName("rect");
  if (rects == undefined) {
    return;
  }

  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (!r) continue;
    const seatNameCur =
      r.attributes.getNamedItem("inkscape:label")?.value ?? "unknown";

    if (seatNameCur == seatName) {
      r.style.cursor = "pointer";
      if (emitName == undefined) {
        r.addEventListener(
          "mousedown",
          () => {
            emit("chosenSeat", seatNameCur);
          },
          false,
        );
      } else {
        r.addEventListener(
          "mousedown",
          () => {
            emit("chosenSeat", emitName);
          },
          false,
        );
      }
    }
  }
}

/**
 * Replace all of the seats to clear their events.
 */
function clearSeatEvents() {
  let svg = document.getElementById(svgId);
  let rects = svg?.getElementsByTagName("rect");
  if (rects == undefined) {
    return;
  }

  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (!r) continue;
    const seatNameCur =
      r.attributes.getNamedItem("inkscape:label")?.value ?? "unknown";

    if (seatNameCur != "unknown") {
      r.style.cursor = "default";
      const copyNode = r.cloneNode(true);
      r.parentElement?.replaceChild(copyNode, r);
    }
  }
}

defineExpose({
  changeSeatColour,
  highlightSeat,
  cancelHighlight,
  assignSeat,
  clearSeatEvents,
});
</script>

<template>
  <div class="select-none">
    <ClientOnly>
      <svg
        :id="svgId"
        width="100%"
        height="100%"
        viewBox="0 0 500.00001 321.00001"
        version="1.1"
      >
        <defs id="defs2">
          <marker
            inkscape:isstock="true"
            style="overflow: visible"
            id="Arrow1Lend"
            refX="0"
            refY="0"
            orient="auto"
            inkscape:stockid="Arrow1Lend"
          >
            <path
              transform="matrix(-0.8,0,0,-0.8,-10,0)"
              :style="{ stroke: arrowStroke, fill: arrowStroke }"
              style="
                fill-opacity: 1;
                fill-rule: evenodd;
                stroke-width: 1pt;
                stroke-opacity: 1;
              "
              d="M 0,0 5,-5 -12.5,0 5,5 Z"
              id="path1048"
            />
          </marker>
          <marker
            inkscape:isstock="true"
            style="overflow: visible"
            id="Arrow1Lstart"
            refX="0"
            refY="0"
            orient="auto"
            inkscape:stockid="Arrow1Lstart"
          >
            <path
              transform="matrix(0.8,0,0,0.8,10,0)"
              :style="{ stroke: arrowStroke, fill: arrowStroke }"
              style="
                fill-opacity: 1;
                fill-rule: evenodd;
                stroke-width: 1pt;
                stroke-opacity: 1;
              "
              d="M 0,0 5,-5 -12.5,0 5,5 Z"
              id="path1045"
            />
          </marker>
          <marker
            inkscape:stockid="Arrow1Lend"
            orient="auto"
            refY="0"
            refX="0"
            id="Arrow1Lend-3"
            style="overflow: visible"
            inkscape:isstock="true"
          >
            <path
              id="path1048-1"
              d="M 0,0 5,-5 -12.5,0 5,5 Z"
              :style="{ stroke: arrowStroke, fill: arrowStroke }"
              style="
                fill-opacity: 1;
                fill-rule: evenodd;
                stroke-width: 1pt;
                stroke-opacity: 1;
              "
              transform="matrix(-0.8,0,0,-0.8,-10,0)"
            />
          </marker>
          <marker
            inkscape:stockid="Arrow1Lend"
            orient="auto"
            refY="0"
            refX="0"
            id="Arrow1Lend-30"
            style="overflow: visible"
            inkscape:isstock="true"
          >
            <path
              id="path1048-9"
              d="M 0,0 5,-5 -12.5,0 5,5 Z"
              :style="{ stroke: arrowStroke, fill: arrowStroke }"
              style="
                fill-opacity: 1;
                fill-rule: evenodd;
                stroke-width: 1pt;
                stroke-opacity: 1;
              "
              transform="matrix(-0.8,0,0,-0.8,-10,0)"
            />
          </marker>
          <marker
            inkscape:stockid="Arrow1Lend"
            orient="auto"
            refY="0"
            refX="0"
            id="Arrow1Lend-6"
            style="overflow: visible"
            inkscape:isstock="true"
          >
            <path
              id="path1048-7"
              d="M 0,0 5,-5 -12.5,0 5,5 Z"
              :style="{ stroke: arrowStroke, fill: arrowStroke }"
              style="
                fill-opacity: 1;
                fill-rule: evenodd;
                stroke-width: 1pt;
                stroke-opacity: 1;
              "
              transform="matrix(-0.8,0,0,-0.8,-10,0)"
            />
          </marker>
          <marker
            inkscape:stockid="Arrow1Lend"
            orient="auto"
            refY="0"
            refX="0"
            id="Arrow1Lend-2"
            style="overflow: visible"
            inkscape:isstock="true"
          >
            <path
              id="path1048-4"
              d="M 0,0 5,-5 -12.5,0 5,5 Z"
              :style="{ stroke: arrowStroke, fill: arrowStroke }"
              style="
                fill-opacity: 1;
                fill-rule: evenodd;
                stroke-width: 1pt;
                stroke-opacity: 1;
              "
              transform="matrix(-0.8,0,0,-0.8,-10,0)"
            />
          </marker>
          <marker
            inkscape:isstock="true"
            style="overflow: visible"
            id="Arrow1Lend-23"
            refX="0"
            refY="0"
            orient="auto"
            inkscape:stockid="Arrow1Lend"
          >
            <path
              transform="matrix(-0.8,0,0,-0.8,-10,0)"
              :style="{ stroke: arrowStroke, fill: arrowStroke }"
              style="
                fill-opacity: 1;
                fill-rule: evenodd;
                stroke-width: 1pt;
                stroke-opacity: 1;
              "
              d="M 0,0 5,-5 -12.5,0 5,5 Z"
              id="path1048-75"
            />
          </marker>
          <marker
            inkscape:isstock="true"
            style="overflow: visible"
            id="Arrow1Lend-63"
            refX="0"
            refY="0"
            orient="auto"
            inkscape:stockid="Arrow1Lend"
          >
            <path
              transform="matrix(-0.8,0,0,-0.8,-10,0)"
              :style="{ stroke: arrowStroke, fill: arrowStroke }"
              style="
                fill-opacity: 1;
                fill-rule: evenodd;
                stroke-width: 1pt;
                stroke-opacity: 1;
              "
              d="M 0,0 5,-5 -12.5,0 5,5 Z"
              id="path1048-2"
            />
          </marker>
          <marker
            inkscape:isstock="true"
            style="overflow: visible"
            id="Arrow1Lend-8"
            refX="0"
            refY="0"
            orient="auto"
            inkscape:stockid="Arrow1Lend"
          >
            <path
              transform="matrix(-0.8,0,0,-0.8,-10,0)"
              :style="{ stroke: arrowStroke, fill: arrowStroke }"
              style="
                fill-opacity: 1;
                fill-rule: evenodd;
                stroke-width: 1pt;
                stroke-opacity: 1;
              "
              d="M 0,0 5,-5 -12.5,0 5,5 Z"
              id="path1048-6"
            />
          </marker>
          <marker
            inkscape:isstock="true"
            style="overflow: visible"
            id="Arrow1Lend-8-2"
            refX="0"
            refY="0"
            orient="auto"
            inkscape:stockid="Arrow1Lend"
          >
            <path
              transform="matrix(-0.8,0,0,-0.8,-10,0)"
              :style="{ stroke: arrowStroke, fill: arrowStroke }"
              style="
                fill-opacity: 1;
                fill-rule: evenodd;
                stroke-width: 1pt;
                stroke-opacity: 1;
              "
              d="M 0,0 5,-5 -12.5,0 5,5 Z"
              id="path1048-6-6"
            />
          </marker>
          <linearGradient
            v-for="g in multiColors"
            :key="multiColorGradientId(g)"
            :id="multiColorGradientId(g)"
          >
            <stop
              v-for="s in multiColorGradient(g)"
              :offset="`${s.location}%`"
              :stop-color="s.color"
            />
          </linearGradient>
        </defs>

        <g
          inkscape:label="R├ęteg 1"
          inkscape:groupmode="layer"
          id="layer1"
          transform="translate(490.8432,150.65241)"
        >
          <text
            xml:space="preserve"
            :style="{ fill: letterStroke }"
            style="
              font-style: normal;
              font-weight: normal;
              font-size: 84.6667px;
              line-height: 1.25;
              font-family: sans-serif;
              fill-opacity: 1;
              stroke: none;
              stroke-width: 0.264583;
            "
            x="-101.09566"
            y="114.52044"
            id="text1159-2-6"
            transform="translate(-4.1666675e-7)"
            inkscape:label="LetterE"
          >
            <tspan
              sodipodi:role="line"
              id="tspan1157-7-7"
              x="-101.09566"
              y="114.52044"
              style="font-size: 84.6667px; stroke-width: 0.264583"
            >
              E
            </tspan>
          </text>
          <text
            xml:space="preserve"
            :style="{ fill: letterStroke }"
            style="
              font-style: normal;
              font-weight: normal;
              font-size: 84.6667px;
              line-height: 1.25;
              font-family: sans-serif;
              fill-opacity: 1;
              stroke: none;
              stroke-width: 0.264583;
            "
            x="-439.98853"
            y="114.52044"
            id="text1159-2"
            transform="translate(-4.1666675e-7)"
            inkscape:label="LetterD"
          >
            <tspan
              sodipodi:role="line"
              id="tspan1157-7"
              x="-439.98853"
              y="114.52044"
              style="font-size: 84.6667px; stroke-width: 0.264583"
            >
              D
            </tspan>
          </text>
          <text
            xml:space="preserve"
            :style="{ fill: letterStroke }"
            style="
              font-style: normal;
              font-weight: normal;
              font-size: 84.6667px;
              line-height: 1.25;
              font-family: sans-serif;
              fill-opacity: 1;
              stroke: none;
              stroke-width: 0.264583;
            "
            x="-104.05204"
            y="-36.253872"
            id="text1159-4"
            inkscape:label="LetterC"
          >
            <tspan
              sodipodi:role="line"
              id="tspan1157-3"
              x="-104.05204"
              y="-36.253872"
              style="font-size: 84.6667px; stroke-width: 0.264583"
            >
              C
            </tspan>
          </text>
          <text
            xml:space="preserve"
            :style="{ fill: letterStroke }"
            style="
              font-style: normal;
              font-weight: normal;
              font-size: 84.6667px;
              line-height: 1.25;
              font-family: sans-serif;
              fill-opacity: 1;
              stroke: none;
              stroke-width: 0.264583;
            "
            x="-268.5936"
            y="-35.219528"
            id="text1159-6"
            transform="translate(-4.1666675e-7)"
            inkscape:label="LetterB"
          >
            <tspan
              sodipodi:role="line"
              id="tspan1157-1"
              x="-268.5936"
              y="-35.219528"
              style="font-size: 84.6667px; stroke-width: 0.264583"
            >
              B
            </tspan>
          </text>
          <text
            xml:space="preserve"
            :style="{ fill: letterStroke }"
            style="
              font-style: normal;
              font-weight: normal;
              font-size: 84.6667px;
              line-height: 1.25;
              font-family: sans-serif;
              fill-opacity: 1;
              stroke: none;
              stroke-width: 0.264583;
            "
            x="-437.93927"
            y="-35.219528"
            id="text1159"
            transform="translate(-4.1666675e-7)"
            inkscape:label="LetterA"
          >
            <tspan
              sodipodi:role="line"
              id="tspan1157"
              x="-437.93927"
              y="-35.219528"
              style="font-size: 84.6667px; stroke-width: 0.264583"
            >
              A
            </tspan>
          </text>
          <path
            id="path1043-2-3"
            d="m -12.494766,46.268355 -8.25369,14.29582"
            :style="{ stroke: arrowStroke }"
            style="
              fill: none;
              stroke-width: 0.653275;
              stroke-linecap: butt;
              stroke-linejoin: miter;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
              marker-end: url(#Arrow1Lend-8-2);
            "
            transform="translate(-4.1666675e-7)"
            inkscape:label="ArrowE"
          />
          <path
            id="path1043-2"
            d="m -347.68344,46.26837 -8.25369,14.295811"
            :style="{ stroke: arrowStroke }"
            style="
              fill: none;
              stroke-width: 0.653275;
              stroke-linecap: butt;
              stroke-linejoin: miter;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
              marker-end: url(#Arrow1Lend-8);
            "
            transform="translate(-4.1666675e-7)"
            inkscape:label="ArrowD"
          />
          <path
            id="path1043-07"
            d="m -10.734657,-29.461851 h -16.50738"
            :style="{ stroke: arrowStroke }"
            style="
              fill: none;
              stroke-width: 0.653275;
              stroke-linecap: butt;
              stroke-linejoin: miter;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
              marker-end: url(#Arrow1Lend-63);
            "
            inkscape:label="ArrowC"
            transform="translate(-4.1666675e-7)"
          />
          <path
            id="path1043-0"
            d="m -178.59284,-29.461856 h -16.50738"
            :style="{ stroke: arrowStroke }"
            style="
              fill: none;
              stroke-width: 0.653275;
              stroke-linecap: butt;
              stroke-linejoin: miter;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
              marker-end: url(#Arrow1Lend-23);
            "
            transform="translate(-4.1666675e-7)"
            inkscape:label="ArrowB"
          />
          <path
            id="path1043"
            d="m -346.44684,-29.461868 h -16.50738"
            :style="{ stroke: arrowStroke }"
            style="
              fill: none;
              stroke-width: 0.653275;
              stroke-linecap: butt;
              stroke-linejoin: miter;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
              marker-end: url(#Arrow1Lend);
            "
            transform="translate(-4.1666675e-7)"
            inkscape:label="ArrowA"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864"
            width="22.600254"
            height="15.999416"
            x="-431.01822"
            y="-24.503544"
            inkscape:label="A-04"
          />
          <rect
            y="-24.503544"
            x="-408.41797"
            height="15.999416"
            width="22.600254"
            id="rect864-2"
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            inkscape:label="A-03"
          />
          <rect
            y="-24.503544"
            x="-363.21747"
            height="15.999416"
            width="22.600254"
            id="rect864-9"
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            inkscape:label="A-01"
          />
          <rect
            y="-24.503544"
            x="-385.81772"
            height="15.999416"
            width="22.600254"
            id="rect864-3"
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            inkscape:label="A-02"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9"
            width="22.58066"
            height="16.013344"
            x="194.27634"
            y="424.6423"
            inkscape:label="A-07"
            transform="rotate(120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-6"
            width="22.58066"
            height="16.013344"
            x="171.69568"
            y="424.6423"
            inkscape:label="A-08"
            transform="rotate(120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-5"
            width="22.58066"
            height="16.013344"
            x="149.11502"
            y="424.6423"
            inkscape:label="A-09"
            transform="rotate(120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-56"
            width="22.58066"
            height="16.013344"
            x="126.53437"
            y="424.6423"
            inkscape:label="A-10"
            transform="rotate(120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-91"
            width="22.58066"
            height="16.013344"
            x="103.95371"
            y="424.6423"
            inkscape:label="A-11"
            transform="rotate(120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70"
            width="22.58066"
            height="16.013344"
            x="81.373039"
            y="424.6423"
            inkscape:label="A-12"
            transform="rotate(120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3"
            width="22.58066"
            height="16.013344"
            x="304.48383"
            y="-282.79227"
            inkscape:label="A-13"
            transform="rotate(-120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-0"
            width="22.58066"
            height="16.013344"
            x="281.90317"
            y="-282.79227"
            inkscape:label="A-14"
            transform="rotate(-120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-2"
            width="22.58066"
            height="16.013344"
            x="259.32251"
            y="-282.79227"
            inkscape:label="A-15"
            transform="rotate(-120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-1"
            width="22.58066"
            height="16.013344"
            x="236.74187"
            y="-282.79227"
            inkscape:label="A-16"
            transform="rotate(-120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-7"
            width="22.58066"
            height="16.013344"
            x="214.16121"
            y="-282.79227"
            inkscape:label="A-17"
            transform="rotate(-120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-20"
            width="22.58066"
            height="16.013344"
            x="191.58055"
            y="-282.79227"
            inkscape:label="A-18"
            transform="rotate(-120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-9-7"
            width="22.58066"
            height="16.013344"
            x="-453.59888"
            y="-24.517471"
            inkscape:label="A-05"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-3-4"
            width="22.58066"
            height="16.013344"
            x="-476.17953"
            y="-24.517471"
            inkscape:label="A-06"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-8"
            width="22.600254"
            height="15.999416"
            x="385.8569"
            y="-44.198746"
            inkscape:label="D-16"
            transform="scale(-1)"
          />
          <rect
            y="-44.198746"
            x="408.45715"
            height="15.999416"
            width="22.600254"
            id="rect864-2-4"
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            inkscape:label="D-15"
            transform="scale(-1)"
          />
          <rect
            y="-44.198746"
            x="453.65765"
            height="15.999416"
            width="22.600254"
            id="rect864-9-3"
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            inkscape:label="D-13"
            transform="scale(-1)"
          />
          <rect
            y="-44.198746"
            x="431.0574"
            height="15.999416"
            width="22.600254"
            id="rect864-3-1"
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            inkscape:label="D-14"
            transform="scale(-1)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-49"
            width="22.58066"
            height="16.013344"
            x="-231.21774"
            y="-272.94467"
            inkscape:label="D-01"
            transform="rotate(-60)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-6-2"
            width="22.58066"
            height="16.013344"
            x="-253.79839"
            y="-272.94467"
            inkscape:label="D-02"
            transform="rotate(-60)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-5-0"
            width="22.58066"
            height="16.013344"
            x="-276.37906"
            y="-272.94467"
            inkscape:label="D-03"
            transform="rotate(-60)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-56-6"
            width="22.58066"
            height="16.013344"
            x="-298.95972"
            y="-272.94467"
            inkscape:label="D-04"
            transform="rotate(-60)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-91-8"
            width="22.58066"
            height="16.013344"
            x="-321.54034"
            y="-272.94467"
            inkscape:label="D-05"
            transform="rotate(-60)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-92"
            width="22.58066"
            height="16.013344"
            x="-344.12103"
            y="-272.94467"
            inkscape:label="D-06"
            transform="rotate(-60)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-6"
            width="22.58066"
            height="16.013344"
            x="-86.897186"
            y="434.4899"
            inkscape:label="D-07"
            transform="rotate(60)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-0-6"
            width="22.58066"
            height="16.013344"
            x="-109.47785"
            y="434.4899"
            inkscape:label="D-08"
            transform="rotate(60)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-2-49"
            width="22.58066"
            height="16.013344"
            x="-132.0585"
            y="434.4899"
            inkscape:label="D-09"
            transform="rotate(60)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-1-50"
            width="22.58066"
            height="16.013344"
            x="-154.63916"
            y="434.4899"
            inkscape:label="D-10"
            transform="rotate(60)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-7-48"
            width="22.58066"
            height="16.013344"
            x="-177.21982"
            y="434.4899"
            inkscape:label="D-11"
            transform="rotate(60)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-20-7"
            width="22.58066"
            height="16.013344"
            x="-199.80048"
            y="434.4899"
            inkscape:label="D-12"
            transform="rotate(60)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-9-7-1"
            width="22.58066"
            height="16.013344"
            x="363.27625"
            y="-44.212669"
            inkscape:label="D-17"
            transform="scale(-1)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-3-4-7"
            width="22.58066"
            height="16.013344"
            x="340.69559"
            y="-44.212669"
            inkscape:label="D-18"
            transform="scale(-1)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-8-0"
            width="22.600254"
            height="15.999416"
            x="50.668217"
            y="-44.198734"
            inkscape:label="E-16"
            transform="scale(-1)"
          />
          <rect
            y="-44.198734"
            x="73.268463"
            height="15.999416"
            width="22.600254"
            id="rect864-2-4-6"
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            inkscape:label="E-15"
            transform="scale(-1)"
          />
          <rect
            y="-44.198734"
            x="118.46897"
            height="15.999416"
            width="22.600254"
            id="rect864-9-3-1"
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            inkscape:label="E-13"
            transform="scale(-1)"
          />
          <rect
            y="-44.198734"
            x="95.868713"
            height="15.999416"
            width="22.600254"
            id="rect864-3-1-5"
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            inkscape:label="E-14"
            transform="scale(-1)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-49-9"
            width="22.58066"
            height="16.013344"
            x="-63.623386"
            y="17.337234"
            inkscape:label="E-01"
            transform="rotate(-60)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-6-2-4"
            width="22.58066"
            height="16.013344"
            x="-86.204056"
            y="17.337234"
            inkscape:label="E-02"
            transform="rotate(-60)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-5-0-9"
            width="22.58066"
            height="16.013344"
            x="-108.78471"
            y="17.337234"
            inkscape:label="E-03"
            transform="rotate(-60)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-56-6-0"
            width="22.58066"
            height="16.013344"
            x="-131.36537"
            y="17.337234"
            inkscape:label="E-04"
            transform="rotate(-60)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-91-8-9"
            width="22.58066"
            height="16.013344"
            x="-153.946"
            y="17.337234"
            inkscape:label="E-05"
            transform="rotate(-60)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-92-1"
            width="22.58066"
            height="16.013344"
            x="-176.52669"
            y="17.337234"
            inkscape:label="E-06"
            transform="rotate(-60)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-6-7"
            width="22.58066"
            height="16.013344"
            x="80.697166"
            y="144.20799"
            inkscape:label="E-07"
            transform="rotate(60)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-0-6-7"
            width="22.58066"
            height="16.013344"
            x="58.116489"
            y="144.20799"
            inkscape:label="E-08"
            transform="rotate(60)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-2-49-1"
            width="22.58066"
            height="16.013344"
            x="35.535835"
            y="144.20799"
            inkscape:label="E-09"
            transform="rotate(60)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-1-50-1"
            width="22.58066"
            height="16.013344"
            x="12.955178"
            y="144.20799"
            inkscape:label="E-10"
            transform="rotate(60)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-7-48-5"
            width="22.58066"
            height="16.013344"
            x="-9.6254797"
            y="144.20799"
            inkscape:label="E-11"
            transform="rotate(60)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-20-7-9"
            width="22.58066"
            height="16.013344"
            x="-32.206139"
            y="144.20799"
            inkscape:label="E-12"
            transform="rotate(60)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-9-7-1-7"
            width="22.58066"
            height="16.013344"
            x="28.087559"
            y="-44.212666"
            inkscape:label="E-17"
            transform="scale(-1)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-3-4-7-7"
            width="22.58066"
            height="16.013344"
            x="5.5069079"
            y="-44.212666"
            inkscape:label="E-18"
            transform="scale(-1)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-22"
            width="22.600254"
            height="15.999416"
            x="-263.16397"
            y="-24.503531"
            inkscape:label="B-04"
          />
          <rect
            y="-24.503531"
            x="-240.56352"
            height="15.999416"
            width="22.600254"
            id="rect864-2-8"
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            inkscape:label="B-03"
          />
          <rect
            y="-24.503531"
            x="-195.36302"
            height="15.999416"
            width="22.600254"
            id="rect864-9-9"
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            inkscape:label="B-01"
          />
          <rect
            y="-24.503531"
            x="-217.96327"
            height="15.999416"
            width="22.600254"
            id="rect864-3-7"
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            inkscape:label="B-02"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-3"
            width="22.58066"
            height="16.013344"
            x="110.34912"
            y="279.27679"
            inkscape:label="B-07"
            transform="rotate(120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-6-6"
            width="22.58066"
            height="16.013344"
            x="87.768471"
            y="279.27679"
            inkscape:label="B-08"
            transform="rotate(120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-5-1"
            width="22.58066"
            height="16.013344"
            x="65.18795"
            y="279.27679"
            inkscape:label="B-09"
            transform="rotate(120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-56-2"
            width="22.58066"
            height="16.013344"
            x="42.607319"
            y="279.27679"
            inkscape:label="B-10"
            transform="rotate(120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-91-9"
            width="22.58066"
            height="16.013344"
            x="20.026665"
            y="279.27679"
            inkscape:label="B-11"
            transform="rotate(120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-31"
            width="22.58066"
            height="16.013344"
            x="-2.5540171"
            y="279.27679"
            inkscape:label="B-12"
            transform="rotate(120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-9"
            width="22.58066"
            height="16.013344"
            x="220.55688"
            y="-137.42628"
            inkscape:label="B-13"
            transform="rotate(-120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-0-4"
            width="22.58066"
            height="16.013344"
            x="197.97623"
            y="-137.42628"
            inkscape:label="B-14"
            transform="rotate(-120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-2-7"
            width="22.58066"
            height="16.013344"
            x="175.39557"
            y="-137.42628"
            inkscape:label="B-15"
            transform="rotate(-120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-1-8"
            width="22.58066"
            height="16.013344"
            x="152.81494"
            y="-137.42628"
            inkscape:label="B-16"
            transform="rotate(-120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-7-4"
            width="22.58066"
            height="16.013344"
            x="130.23405"
            y="-137.42628"
            inkscape:label="B-17"
            transform="rotate(-120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-20-5"
            width="22.58066"
            height="16.013344"
            x="107.65333"
            y="-137.42628"
            inkscape:label="B-18"
            transform="rotate(-120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-9-7-0"
            width="22.58066"
            height="16.013344"
            x="-285.74509"
            y="-24.517458"
            inkscape:label="B-05"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-3-4-3"
            width="22.58066"
            height="16.013344"
            x="-308.32574"
            y="-24.517458"
            inkscape:label="B-06"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-6"
            width="22.600254"
            height="15.999416"
            x="-95.306061"
            y="-24.503527"
            inkscape:label="C-04"
          />
          <rect
            y="-24.503527"
            x="-72.705811"
            height="15.999416"
            width="22.600254"
            id="rect864-2-1"
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            inkscape:label="C-03"
          />
          <rect
            y="-24.503527"
            x="-27.505268"
            height="15.999416"
            width="22.600254"
            id="rect864-9-5"
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            inkscape:label="C-01"
          />
          <rect
            y="-24.503527"
            x="-50.105522"
            height="15.999416"
            width="22.600254"
            id="rect864-3-5"
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            inkscape:label="C-02"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-4"
            width="22.58066"
            height="16.013344"
            x="26.420271"
            y="133.9072"
            inkscape:label="C-07"
            transform="rotate(120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-6-7"
            width="22.58066"
            height="16.013344"
            x="3.8396032"
            y="133.9072"
            inkscape:label="C-08"
            transform="rotate(120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-5-6"
            width="22.58066"
            height="16.013344"
            x="-18.741035"
            y="133.9072"
            inkscape:label="C-09"
            transform="rotate(120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-56-5"
            width="22.58066"
            height="16.013344"
            x="-41.32169"
            y="133.9072"
            inkscape:label="C-10"
            transform="rotate(120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-91-6"
            width="22.58066"
            height="16.013344"
            x="-63.902668"
            y="133.9072"
            inkscape:label="C-11"
            transform="rotate(120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-9"
            width="22.58066"
            height="16.013344"
            x="-86.483345"
            y="133.9072"
            inkscape:label="C-12"
            transform="rotate(120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-3"
            width="22.58066"
            height="16.013344"
            x="136.62766"
            y="7.9430752"
            inkscape:label="C-13"
            transform="rotate(-120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-0-7"
            width="22.58066"
            height="16.013344"
            x="114.04676"
            y="7.9430752"
            inkscape:label="C-14"
            transform="rotate(-120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-2-4"
            width="22.58066"
            height="16.013344"
            x="91.466095"
            y="7.9430752"
            inkscape:label="C-15"
            transform="rotate(-120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-1-5"
            width="22.58066"
            height="16.013344"
            x="68.885704"
            y="7.9430752"
            inkscape:label="C-16"
            transform="rotate(-120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-7-2"
            width="22.58066"
            height="16.013344"
            x="46.305119"
            y="7.9430752"
            inkscape:label="C-17"
            transform="rotate(-120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-2-9-70-3-20-54"
            width="22.58066"
            height="16.013344"
            x="23.724449"
            y="7.9430752"
            inkscape:label="C-18"
            transform="rotate(-120)"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-9-7-7"
            width="22.58066"
            height="16.013344"
            x="-117.8867"
            y="-24.517454"
            inkscape:label="C-05"
          />
          <rect
            :style="{ stroke: seatStroke }"
            style="
              fill: none;
              stroke-width: 1.165;
              stroke-miterlimit: 4;
              stroke-dasharray: none;
              stroke-opacity: 1;
            "
            id="rect864-3-4-4"
            width="22.58066"
            height="16.013344"
            x="-140.46716"
            y="-24.517454"
            inkscape:label="C-06"
          />
        </g>
      </svg>
    </ClientOnly>
  </div>
</template>

<style scoped></style>
