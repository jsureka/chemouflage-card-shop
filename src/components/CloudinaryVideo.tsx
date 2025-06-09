import { getCloudinaryVideoUrl } from "@/config/cloudinary";
import React from "react";

interface CloudinaryVideoProps
  extends React.VideoHTMLAttributes<HTMLVideoElement> {
  /** Cloudinary public ID for the video */
  publicId: string;
  /** Fallback local path */
  fallbackPath?: string;
  /** Video width for optimization */
  width?: number;
  /** Video height for optimization */
  height?: number;
  /** Video quality (default: auto) */
  quality?: string;
  /** Video format (default: auto) */
  format?: string;
  /** Custom Cloudinary transformations */
  transformations?: string;
}

/**
 * CloudinaryVideo component that automatically handles video optimization
 * and provides fallback to local videos
 */
export const CloudinaryVideo: React.FC<CloudinaryVideoProps> = ({
  publicId,
  fallbackPath,
  width,
  height,
  quality = "auto",
  format = "auto",
  transformations,
  className,
  ...props
}) => {
  // Build transformations string
  const buildTransformations = () => {
    if (transformations) return transformations;

    const transforms: string[] = [];
    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    transforms.push(`q_${quality}`);
    transforms.push(`f_${format}`);

    return transforms.join(",");
  };

  const cloudinaryUrl = getCloudinaryVideoUrl(publicId, buildTransformations());

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (fallbackPath && e.currentTarget.src !== fallbackPath) {
      console.warn(
        `Failed to load Cloudinary video: ${cloudinaryUrl}. Falling back to local.`
      );
      e.currentTarget.src = fallbackPath;
    }

    // Call original onError if provided
    if (props.onError) {
      props.onError(e);
    }
  };

  return (
    <video {...props} className={className} onError={handleError}>
      <source src={cloudinaryUrl} type="video/mp4" />
      {fallbackPath && <source src={fallbackPath} type="video/mp4" />}
      Your browser does not support the video tag.
    </video>
  );
};

export default CloudinaryVideo;
