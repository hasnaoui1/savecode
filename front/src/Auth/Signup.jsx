import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";

function SignUp() {
  const navigate = useNavigate();
  const [error , setError]  = useState("");

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    axiosInstance
      .post("/register", {
        email: formData.email,
        password: formData.password,
        username: formData.username,
      })
      .then(() => navigate("/signin"))
      .catch((err) =>setError(err.message));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen flex bg-[#0e0e0e] text-white">
      <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create an account</h1>
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/signin" className="text-blue-500 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-md bg-[#1e1e1e] border border-gray-600 px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your email address"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              Username *
            </label>
            <input
              id="username"
              name="username"
              type="username"
              required
              value={formData.username}
              onChange={handleChange}
              className="mt-1 w-full rounded-md bg-[#1e1e1e] border border-gray-600 px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your email address"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full rounded-md bg-[#1e1e1e] border border-gray-600 px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your password"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-300"
            >
              Confirm Password *
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 w-full rounded-md bg-[#1e1e1e] border border-gray-600 px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Re-enter your password"
            />
          </div>
          {error && (
              <p className="text-red-500 text-sm">
                  {error}
              </p>
                  )}

          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-300">
          By signing up, you agree to our Terms & Conditions and Privacy Policy.
        </p>
      </div>

      <div className="hidden md:block w-1/2 bg-[#1f1f1f] relative">
        <div className="absolute inset-0 bg-dot-pattern" />
      </div>
    </div>
  );
}

export default SignUp;
