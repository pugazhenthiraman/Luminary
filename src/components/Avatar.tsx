import React from "react";

// Utility: pick a gradient based on name for variety
function getGradient(name: string) {
  const gradients = [
    "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)", // blue to purple
    "linear-gradient(90deg, #10b981 0%, #059669 100%)", // green to emerald
    "linear-gradient(90deg, #ec4899 0%, #eab308 100%)", // pink to yellow
    "linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)", // indigo to blue
    "linear-gradient(90deg, #f97316 0%, #dc2626 100%)", // orange to red
    "linear-gradient(90deg, #14b8a6 0%, #06b6d4 100%)", // teal to cyan
    "linear-gradient(90deg, #a21caf 0%, #ec4899 100%)" // fuchsia to pink
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % gradients.length;
  return gradients[idx];
}

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: number; // px
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ name, imageUrl, size = 32, className = "" }) => {
  const style = imageUrl && imageUrl !== "" 
    ? { width: size, height: size }
    : { width: size, height: size, backgroundImage: getGradient(name), backgroundSize: "cover", backgroundPosition: "center" };
  return imageUrl && imageUrl !== "" ? (
    <img
      src={imageUrl}
      alt={name}
      style={style}
      className={`rounded-full object-cover ${className}`}
    />
  ) : (
    <div
      style={style}
      className={`rounded-full flex items-center justify-center font-bold text-white select-none ${className}`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

export default Avatar;
