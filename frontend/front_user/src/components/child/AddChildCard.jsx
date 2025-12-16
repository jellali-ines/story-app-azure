// src/components/child/AddChildCard.jsx
import React from "react";

const AddChildCard = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer flex flex-col items-center justify-center bg-white border-2 border-dashed border-orange-400 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:scale-105 transition transform duration-300"
    >
      <div className="w-20 h-20 flex justify-center items-center rounded-full bg-orange-100 text-orange-600 text-5xl">
        +
      </div>
      <p className="mt-4 text-lg font-semibold text-[#26024D]">Add New Child</p>
    </div>
  );
};

export default AddChildCard;
