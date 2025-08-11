// Returns a tailwind gradient class based on a string (title, name, etc)
export function getGradient(key: string) {
  const gradients = [
    "bg-gradient-to-r from-blue-500 to-purple-600",
    "bg-gradient-to-r from-green-400 to-emerald-500",
    "bg-gradient-to-r from-pink-500 to-yellow-500",
    "bg-gradient-to-r from-indigo-500 to-blue-400",
    "bg-gradient-to-r from-orange-400 to-red-500",
    "bg-gradient-to-r from-teal-400 to-cyan-500",
    "bg-gradient-to-r from-fuchsia-500 to-pink-500"
  ];
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % gradients.length;
  return gradients[idx];
}
