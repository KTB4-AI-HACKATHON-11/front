import { useEffect, useState } from "react";
import "./ProgressiveImage.css";

export default function ProgressiveImage({ src, alt }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    setStatus("loading");
  }, [src]);

  return (
    <div className={`progressive-image progressive-image--${status}`}>
      {status !== "loaded" && (
        <span>{status === "error" ? "사진을 불러오지 못했습니다." : "사진 불러오는 중..."}</span>
      )}
      <img
        src={src}
        alt={alt}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
      />
    </div>
  );
}
