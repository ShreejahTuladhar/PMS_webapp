import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { registerUser } from "../../services/authAPI";

const Register = () => {
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    dispatch(registerUser(data));
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-md shadow-md w-96 space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center">Register</h2>

        <input
          {...register("username")}
          placeholder="Username"
          className="input"
          required
        />
        <input
          {...register("firstName")}
          placeholder="First Name"
          className="input"
          required
        />
        <input
          {...register("lastName")}
          placeholder="Last Name"
          className="input"
          required
        />
        <input
          {...register("email")}
          type="email"
          placeholder="Email"
          className="input"
          required
        />
        <input
          {...register("phoneNumber")}
          placeholder="Phone Number"
          className="input"
          required
        />
        <input
          {...register("password")}
          type="password"
          placeholder="Password"
          className="input"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
