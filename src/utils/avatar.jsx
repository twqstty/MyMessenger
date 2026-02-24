export function makeDefaultAvatarDataUri(seedText = "user") {
  const seed = seedText.trim() || "user";
  const letter = seed[0]?.toUpperCase() || "U";

  // простая детерминированная “подкраска” по строке
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;

  const hue = hash % 360;
  const bg = `hsl(${hue}, 70%, 45%)`;

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${bg}" stop-opacity="1"/>
        <stop offset="1" stop-color="hsl(${(hue + 40) % 360}, 70%, 40%)" stop-opacity="1"/>
      </linearGradient>
    </defs>
    <rect width="128" height="128" rx="64" fill="url(#g)"/>
    <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
      font-family="Arial, sans-serif" font-size="64" fill="white" font-weight="700">${letter}</text>
  </svg>`.trim();

  const encoded = encodeURIComponent(svg)
    .replace(/%0A/g, "")
    .replace(/%20/g, " ")
    .replace(/%3D/g, "=")
    .replace(/%3A/g, ":")
    .replace(/%2F/g, "/");

  return `data:image/svg+xml;utf8,${encoded}`;
}