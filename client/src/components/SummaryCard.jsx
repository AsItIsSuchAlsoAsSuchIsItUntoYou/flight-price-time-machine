const SummaryCard = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) return null;
  const prices = data.map((d) => parseFloat(d.price));
  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);
  const average = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2);

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Price Summary</h2>
      <div className="flex gap-6">
        <div className="text-center">
          <p className="text-sm text-gray-500">Lowest</p>
          <p className="text-2xl font-bold text-green-600">${lowest}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Average</p>
          <p className="text-2xl font-bold text-blue-600">${average}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Highest</p>
          <p className="text-2xl font-bold text-red-500">${highest}</p>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;