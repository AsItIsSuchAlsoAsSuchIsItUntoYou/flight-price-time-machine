import { useState } from 'react';
import axios from 'axios';
import SearchForm from '../components/SearchForm';
import PriceChart from '../components/PriceChart';
import SummaryCard from '../components/SummaryCard';

const Home = () => {
  const [priceData, setPriceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async ({ origin, destination, departureDate }) => {
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/snapshots`, {
        params: { origin, destination, departure_date: departureDate },
      });
      setPriceData(Array.isArray(res.data) ? res.data : []);    } catch (err) {
      setError('Failed to fetch price data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Flight Price Tracker</h1>
          <p className="text-gray-500 mt-1">Track how flight prices change over time for any route.</p>
        </div>
        <SearchForm onSearch={handleSearch} />
        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {searched && !loading && (
          <>
            <SummaryCard data={priceData} />
            <PriceChart data={priceData} />
          </>
        )}
      </div>
    </div>
  );
};

export default Home;