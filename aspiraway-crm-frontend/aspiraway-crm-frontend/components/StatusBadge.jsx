export default function StatusBadge({ label }) {
  const styles = {
    "Visa Ready": "bg-green-100 text-green-700",
    "Almost Ready": "bg-yellow-100 text-yellow-700",
    "Not Ready": "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        styles[label] || "bg-gray-100 text-gray-600"
      }`}
    >
      {label}
    </span>
  );
}
