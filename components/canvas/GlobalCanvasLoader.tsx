"use client";

import dynamic from "next/dynamic";

const GlobalWebGLCanvas = dynamic(
  () => import("@/components/canvas/GlobalWebGLCanvas"),
  { ssr: false }
);

export default function GlobalCanvasLoader() {
  return <GlobalWebGLCanvas />;
}
