import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

const PriceChart = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-md text-gray-400 text-center">
        No price history yet. Prices will accumulate here over time.
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Price History</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="fetched_at" tickFormatter={(val) => new Date(val).toLocaleDateString()} />
          <YAxis tickFormatter={(val) => `$${val}`} />
          <Tooltip formatter={(val) => `$${val}`} />
          <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;