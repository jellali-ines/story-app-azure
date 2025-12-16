import React from "react";
import GenreCard from "./GenreCard";

import adventureImg from "../../assets/storyGenres/adventure.jpg";
import animalsImg from "../../assets/storyGenres/animaux.jpg";
import fairytaleImg from "../../assets/storyGenres/fairytale.jpg";
import fantasyImg from "../../assets/storyGenres/fantasy.jpg";
import scifiImg from "../../assets/storyGenres/sciencefiction.jpg";
import mysteryImg from "../../assets/storyGenres/mystery.jpg";

const genres = [
  { title: "Adventure", image_url: adventureImg },
  { title: "Animals", image_url: animalsImg },
  { title: "Fairytale", image_url: fairytaleImg },
  { title: "Fantasy", image_url: fantasyImg },
  // { title: "Sci-Fi", image_url: scifiImg },
  // { title: "Mystery", image_url: mysteryImg },
];

export default function GenreSection() {
  return (
    <section className="py-8 px-4 bg-white">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Genres</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {genres.map((genre) => (
          <GenreCard
            key={genre.title}
            title={genre.title}
            image_url={genre.image_url}
          />
        ))}
      </div>
    </section>
  );
}
