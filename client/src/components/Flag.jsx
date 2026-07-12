/**
 * Country flag as an SVG image (from flagcdn.com), so flags render identically
 * on every OS — Windows PCs have no flag emoji font, which turns 🇹🇳 into "TN".
 */
export default function Flag({ code, title }) {
  if (!code) return null;
  const cc = code.toLowerCase();
  return (
    <img
      className="flag-img"
      src={`https://flagcdn.com/${cc}.svg`}
      alt={code.toUpperCase()}
      title={title}
      loading="lazy"
      width={20}
      height={14}
    />
  );
}
