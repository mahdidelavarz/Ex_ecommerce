"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type SliderFrameProps = {
  radius?: number;      // corner radius (px)
  notchWidth?: number;  // notch opening width at the bottom edge (px)
  notchDepth?: number;  // how far the notch rises into the frame (px)
  notchFlat?: number;   // flat width at the top of the notch (px)
  notchRound?: number;  // softness of the notch transitions (px)
  inset?: number;       // padding from the SVG edge (px)
  fill?: string;
  className?: string;
  style?: CSSProperties;
};

type PathOpts = Required<Omit<SliderFrameProps, "fill" | "className" | "style">>;

function buildFramePath(w: number, h: number, o: PathOpts) {
  if (w <= 0 || h <= 0) return "";
  const left = o.inset, top = o.inset, right = w - o.inset, bottom = h - o.inset;
  const cx = w / 2;
  const innerW = right - left, innerH = bottom - top;

  // everything below is clamped so it never overruns the frame
  const r = Math.max(0, Math.min(o.radius, innerW / 2, innerH / 2));
  const oHalf = Math.max(0, Math.min(o.notchWidth, innerW - 2 * r - 4) / 2);
  const depth = Math.max(0, Math.min(o.notchDepth, innerH - r - 4));
  const s = Math.max(0, Math.min(o.notchRound, depth, oHalf));
  const fHalf = Math.max(0, Math.min(o.notchFlat / 2, oHalf - s));

  const by = bottom, ty = bottom - depth;
  const drawNotch = oHalf > s + fHalf + 1 && depth > 1;

  const head =
    `M ${left + r} ${top}` +
    ` L ${right - r} ${top}` +
    ` Q ${right} ${top} ${right} ${top + r}` +
    ` L ${right} ${bottom - r}` +
    ` Q ${right} ${bottom} ${right - r} ${bottom}`;

  const bottomEdge = drawNotch
    ? ` L ${cx + oHalf} ${by}` +
      ` Q ${cx + oHalf - s} ${by} ${cx + oHalf - s} ${by - s}` +
      ` Q ${cx + oHalf - s} ${ty} ${cx + fHalf} ${ty}` +
      ` L ${cx - fHalf} ${ty}` +
      ` Q ${cx - oHalf + s} ${ty} ${cx - oHalf + s} ${by - s}` +
      ` Q ${cx - oHalf + s} ${by} ${cx - oHalf} ${by}` +
      ` L ${left + r} ${bottom}`
    : ` L ${left + r} ${bottom}`;

  const tail =
    ` Q ${left} ${bottom} ${left} ${bottom - r}` +
    ` L ${left} ${top + r}` +
    ` Q ${left} ${top} ${left + r} ${top}` +
    ` Z`;

  return head + bottomEdge + tail;
}

export function SliderFrame({
  radius = 40,
  notchWidth = 240,
  notchDepth = 72,
  notchFlat = 96,
  notchRound = 28,
  inset = 0,
  fill = "currentColor",
  className,
  style,
}: SliderFrameProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ w, h }, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const d = buildFramePath(w, h, {
    radius, notchWidth, notchDepth, notchFlat, notchRound, inset,
  });

  return (
    <div ref={ref} className={className} style={{ width: "100%", height: "100%", ...style }}>
      {w > 0 && h > 0 && (
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none" // safe: viewBox == pixel size, so it's a 1:1 mapping
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          <path d={d} fill={fill} />
        </svg>
      )}
    </div>
  );
}


export function useIsPhone() {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setPhone(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return phone;
}

// in your component:
// const phone = useIsPhone();
// <SliderFrame
//   radius={phone ? 28 : 40}
//   notchWidth={phone ? 150 : 260}
//   notchFlat={phone ? 64 : 110}
//   notchDepth={phone ? 60 : 76}
// />