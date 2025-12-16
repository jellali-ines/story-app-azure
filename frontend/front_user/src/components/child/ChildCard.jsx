// src/components/child/ChildCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const ChildCard = ({ kid }) => {
  const navigate = useNavigate();

  const goToStories = () => {
    if (!kid?._id) return; // sécurité si child n'est pas défini
      localStorage.setItem("selectedKidId", kid._id); // on stocke l'id

      if (
        Array.isArray(kid.preferred_genres) && kid.preferred_genres.length > 0 ||
        Array.isArray(kid.preferred_characters) && kid.preferred_characters.length > 0 ||
        Array.isArray(kid.preferred_emotions) && kid.preferred_emotions.length > 0 ||
        Array.isArray(kid.preferred_reading_time) && kid.preferred_reading_time > 0   )
      return    navigate(`/stories?child=${kid._id}`);
      else    navigate(`/preferences?child=${kid._id}`);

  };

  return (
    <div
      onClick={goToStories}
      className="cursor-pointer flex flex-col items-center bg-white p-6 rounded-3xl shadow-md hover:shadow-xl hover:scale-105 transition transform duration-300"
    >
      <img
        src={kid.avatar}
        alt="avatar"
        className="w-24 h-24 mb-4 rounded-full object-cover border-4 border-orange-300"
      />

      <h3 className="text-xl font-semibold text-[#26024D]">{kid.name}</h3>
    </div>
  );
};

export default ChildCard;
