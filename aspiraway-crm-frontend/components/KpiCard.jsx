export default function KpiCard({ title, value, subtitle, color = "bg-white" }) {
  return (
    <div className={`p-5 rounded-xl shadow-sm ${color}`}>
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-3xl font-bold mt-1">{value}</h2>
      {subtitle && (
        <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
      )}
    </div>
  );
}
