import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../../services/axiosInstance";

const UserDashboard = () => {
  const { user: authUser } = useSelector((state) => state.auth);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await API.get("/bookings"); // Get user's bookings
      setBookings(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      <span className="ml-4 text-lg text-gray-600">Loading dashboard...</span>
    </div>
  );

  const user = authUser; // Use user from Redux

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-semibold mb-6">
        👤 Welcome, {user?.firstName || user?.username}
      </h2>

      {/* Profile Section */}
      <div className="mb-8 p-4 border rounded-md shadow-sm bg-white">
        <h3 className="text-xl font-bold mb-2">Profile</h3>
        <p>
          <strong>Full Name:</strong> {user?.fullName}
        </p>
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
        <p>
          <strong>Phone:</strong> {user?.phoneNumber}
        </p>
        <p>
          <strong>Last Login:</strong>{" "}
          {new Date(user?.lastLogin).toLocaleString()}
        </p>
      </div>

      {/* Active Bookings */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-3">📅 Active Bookings</h3>
        {bookings?.filter((b) => b.status === "active").length === 0 ? (
          <p>No active bookings.</p>
        ) : (
          bookings
            .filter((b) => b.status === "active")
            .map((booking) => (
              <div
                key={booking._id}
                className="mb-4 p-4 border rounded bg-green-50"
              >
                <p>
                  <strong>Location:</strong> {booking.locationId?.name || 'N/A'}
                </p>
                <p>
                  <strong>Space:</strong> {booking.spaceId}
                </p>
                <p>
                  <strong>Vehicle:</strong> {booking.vehicleInfo?.plateNumber}
                </p>
                <p>
                  <strong>Time:</strong> {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}
                </p>
                <p>
                  <strong>Amount:</strong> Rs. {booking.totalAmount}
                </p>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Booking ID: {booking._id}</p>
                  {booking.qrCode && (
                    <p className="text-green-600">✅ QR Code Available</p>
                  )}
                </div>
              </div>
            ))
        )}
      </div>

      {/* Booking History */}
      <div>
        <h3 className="text-xl font-bold mb-3">📜 Booking History</h3>
        {bookings?.filter((b) => b.status !== "active").length === 0 ? (
          <p>No history yet.</p>
        ) : (
          bookings
            .filter((b) => b.status !== "active")
            .map((booking) => (
              <div
                key={booking._id}
                className="mb-3 p-4 border rounded bg-gray-50"
              >
                <p>
                  <strong>Location:</strong> {booking.locationId?.name || 'N/A'}
                </p>
                <p>
                  <strong>Status:</strong> <span className={`px-2 py-1 rounded text-sm ${
                    booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>{booking.status}</span>
                </p>
                <p>
                  <strong>Time:</strong> {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}
                </p>
                <p>
                  <strong>Amount:</strong> Rs. {booking.totalAmount}
                </p>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
