// components/StatsCard.jsx
export default function StatsCard({ title, value }) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-green-500/20 transition-all">
      <h3 className="text-gray-400 text-sm">{title}</h3>
      <p className="text-2xl font-bold text-white mt-2">{value}</p>
    </div>
  );
}
