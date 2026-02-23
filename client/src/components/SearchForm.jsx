const SearchForm = ({ onSearch }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    onSearch({
      origin: form.origin.value.toUpperCase(),
      destination: form.destination.value.toUpperCase(),
      departureDate: form.departureDate.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-gray-700">Search Flights</h2>
      <div className="flex gap-4">
        <input
          name="origin"
          placeholder="From (e.g. JFK)"
          maxLength={3}
          required
          className="border rounded-lg p-2 w-full uppercase placeholder-normal"
        />
        <input
          name="destination"
          placeholder="To (e.g. LAX)"
          maxLength={3}
          required
          className="border rounded-lg p-2 w-full"
        />
      </div>
      <input
        name="departureDate"
        type="date"
        required
        className="border rounded-lg p-2 w-full"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white rounded-lg p-2 font-semibold hover:bg-blue-700 transition"
      >
        Search
      </button>
    </form>
  );
};

export default SearchForm;