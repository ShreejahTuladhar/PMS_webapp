import { useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";

const LogoutButton = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = "/login";
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-3 py-2 rounded-md"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
