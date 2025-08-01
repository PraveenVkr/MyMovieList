import React from "react";
import Image from "next/image";
import Link from "next/link";

const MovieCard = ({ id, title, rating, posterUrl }) => {
  return (
    <Link href={`/movie/${id}`} passHref>
      <div className="w-[200px] bg-gray-800 text-white rounded-lg overflow-hidden shadow-lg cursor-pointer h-[430px]">
        <div className="relative w-full h-[300px]">
          <Image
            src={posterUrl}
            alt={`${title} Poster`}
            layout="fill"
            priority
            objectFit="contain"
            className="rounded-t-lg"
            quality={100}
          />
        </div>
        <div className="p-4 h-[100px]">
          <h3 className="text-lg font-bold mb-2 line-clamp-2">{title}</h3>
          <p className="text-gray-400">Rating: {rating.toFixed(1)}</p>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
