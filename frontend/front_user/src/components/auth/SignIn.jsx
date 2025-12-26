import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignIn = ({ onClose }) => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  // States simple pour l’email et password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

 const handleSubmit = async (e) => { 
  e.preventDefault();

  setError("");
  setLoading(true);

  try {
    const response = await fetch("https://backend.bluesmoke-49ce99c2.italynorth.azurecontainerapps.io/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",  // ⬅️ Pour envoyer/recevoir le cookie JWT
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Login failed");
      setLoading(false);
      return;
    }

    // ⚠️ IMPORTANT : le token est dans le cookie, pas dans data
    // donc pas besoin de faire localStorage.setItem("token", ...)

    // Sauvegarde du userId (backend renvoie "user.id")
    if (data.user && data.user.id) {
      localStorage.setItem("userId", data.user.id);
    }

    if (onClose) onClose();

    navigate("/profiles");

  } catch (err) {
    setError("Server error. Try again later.");
    setLoading(false);
  }
};




  return (
    <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
      <h2 className="text-center text-3xl font-bold tracking-tight text-[#26024D] mb-6">

          Sign in to your account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none transition-all"
            />
          </div>


          {/* Submit */}
          {error && (
            <div className="bg-red-100 text-red-600 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 
            ${loading 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-orange-500 hover:bg-orange-400 hover:scale-105 text-white"}
            `}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

        <p className="mt-6 text-center text-gray-500">
          Not registered?{" "}
          <a href="/signup" className="text-orange-500 font-semibold hover:underline">
            Sign Up
          </a>
        </p>
      </div>
  );
};


export default SignIn;
