import React from "react";
import Image from "next/image";
import Link from "next/link";

const MovieCard = ({ id, title, rating, posterUrl }) => {
  return (
    <Link href={`/movie/${id}`} passHref>
      <div className="w-52 bg-[#232A34] text-white rounded-2xl overflow-hidden shadow-lg cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-2xl">
        {/* Poster with 2:3 ratio */}
        <div className="relative w-full pb-[150%]">
          <Image
            src={posterUrl}
            alt={`${title} Poster`}
            layout="fill"
            objectFit="cover"
            className="rounded-t-2xl"
            priority
          />
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-2">
          <h3 className="text-base font-semibold leading-snug line-clamp-2">
            {title}
          </h3>
          <div className="flex items-center">
            <svg
              className="w-4 h-4 text-[#FFC857] mr-1 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927C9.347 2.01 10.653 2.01 10.951 2.927l.588 1.85a1 1 0 00.95.69h1.95c.969 0 1.371 1.24.588 1.81l-1.58 1.15a1 1 0 00-.364 1.118l.588 1.85c.298.917-.755 1.67-1.538 1.118l-1.58-1.15a1 1 0 00-1.176 0l-1.58 1.15c-.783.552-1.836-.201-1.538-1.118l.588-1.85a1 1 0 00-.364-1.118L2.372 7.377c-.783-.57-.38-1.81.588-1.81h1.95a1 1 0 00.95-.69l.588-1.85z" />
            </svg>
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
