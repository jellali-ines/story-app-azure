import React from "react";
import { useNavigate } from "react-router-dom";

const GenreCard = ({ title, image_url, genreId }) => {
  const navigate = useNavigate();

  const openGenre = () => {
    navigate(`/genre/${genreId}`);
  };

  return (
    <div
      onClick={openGenre}
      className="relative bg-white rounded-3xl shadow-lg overflow-hidden w-[300px] 
                 transition-transform duration-200 hover:-translate-y-1 hover:shadow-2xl mx-auto cursor-pointer"
    >
      {/* IMAGE */}
      <div
        className="w-[90%] h-[180px] mx-auto mt-4 rounded-[35px] overflow-hidden shadow-md
                   [clip-path:polygon(0%_7%,50%_0%,100%_7%,100%_93%,50%_100%,0%_93%)]
                   transition-transform duration-300 hover:scale-105"
      >
        <img
          src={image_url}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
      </div>

      {/* TITLE */}
      <div className="px-5 pb-6 pt-3">
        <h3 className="text-[16px] font-semibold text-gray-800 text-center">{title}</h3>
      </div>
    </div>
  );
};

export default GenreCard;
