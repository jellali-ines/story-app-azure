// src/components/child/KidProfileSetup.jsx
import React, { useState } from "react";


import fox from "../../assets/avatars/fox.png";
import panda from "../../assets/avatars/panda.png";
import chicken from "../../assets/avatars/chicken.png";
import cat from "../../assets/avatars/cat.png";

const avatars = [fox, panda, chicken, cat];
const KidProfileSetup = ({ onCancel, onSubmit }) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [avatar, setAvatar] = useState(avatars[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem("userId");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!userId) {
      setError("User not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://backend.bluesmoke-49ce99c2.italynorth.azurecontainerapps.io/api/users/${userId}/kids`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ name, age, avatar }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create kid profile");
        setLoading(false);
        return;
      }

      onSubmit && onSubmit(data.kid);
      setLoading(false);

    } catch (err) {
      console.error(err);
      setError("Server error. Try again.");
      setLoading(false);
    }
  };



  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
      <h2 className="text-2xl font-bold text-[#26024D] mb-6 text-center">
        Create Child Profile
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Name */}
        <div>
          <label className="text-sm font-medium text-gray-700">Child Name</label>
          <input
            type="text"
            className="w-full mt-2 p-2 border rounded-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Age */}
        <div>
          <label className="text-sm font-medium text-gray-700">Age</label>
          <input
            type="number"
            className="w-full mt-2 p-2 border rounded-lg"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>

        {/* Avatar selection */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Choose Avatar</label>
          <div className="grid grid-cols-4 gap-4">
            {avatars.map((img) => (
              <img
                key={img}
                src={img}
                alt="avatar"
                className={`w-20 h-20 rounded-full object-cover cursor-pointer border-4 
                  ${avatar === img ? "border-orange-500" : "border-transparent"}`}
                onClick={() => setAvatar(img)}
              />
            ))}
          </div>
        </div>

        {/* Buttons */}
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-md text-center">
            {error}
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-400 text-gray-600"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 font-semibold rounded-lg 
            ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600 text-white"}`}
          >
            {loading ? "Creating..." : "Create"}
          </button>

        </div>
      </form>
    </div>
  );
};

export default KidProfileSetup;
