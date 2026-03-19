"use client";

import dynamic from "next/dynamic";

const VideoGallerySequence = dynamic(
  () => import("@/components/ui/VideoGallerySequence"),
  { ssr: false }
);

export default function VideoGallerySequenceLoader(props: {
  trackerStyle?: React.CSSProperties;
  trackerClassName?: string;
}) {
  return <VideoGallerySequence {...props} />;
}
