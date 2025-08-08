const RegisterParking = () => {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        Register Your Parking Location
      </h2>

      <form className="space-y-4">
        <input
          type="text"
          placeholder="Parking Name"
          className="input"
          required
        />
        <input type="text" placeholder="Address" className="input" required />
        <input
          type="number"
          placeholder="Total Slots"
          className="input"
          required
        />
        <input
          type="text"
          placeholder="Price per Hour (in NPR)"
          className="input"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-md"
        >
          Submit Request
        </button>
      </form>
    </div>
  );
};

export default RegisterParking;
