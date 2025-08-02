import React from "react";
import Image from "next/image";
import Link from "next/link";

const MovieCard = ({ id, title, rating, posterUrl }) => {
  return (
    <Link href={`/movie/${id}`} passHref>
      <div className="group relative">
        {/* Main Card */}
        <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl border border-slate-700/30 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2">
          {/* Poster Container */}
          <div className="relative aspect-[2/3] overflow-hidden">
            <Image
              src={posterUrl}
              alt={`${title} Poster`}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-700 group-hover:scale-110"
              priority
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Rating Badge */}
            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-2xl px-3 py-1.5 flex items-center gap-1.5 border border-slate-600/30">
              <svg
                className="w-4 h-4 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927C9.347 2.01 10.653 2.01 10.951 2.927l.588 1.85a1 1 0 00.95.69h1.95c.969 0 1.371 1.24.588 1.81l-1.58 1.15a1 1 0 00-.364 1.118l.588 1.85c.298.917-.755 1.67-1.538 1.118l-1.58-1.15a1 1 0 00-1.176 0l-1.58 1.15c-.783.552-1.836-.201-1.538-1.118l.588-1.85a1 1 0 00-.364-1.118L2.372 7.377c-.783-.57-.38-1.81.588-1.81h1.95a1 1 0 00.95-.69l.588-1.85z" />
              </svg>
              <span className="text-white text-sm font-bold">
                {rating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-lg font-bold text-white leading-tight line-clamp-2 group-hover:text-blue-300 transition-colors duration-300">
              {title}
            </h3>
          </div>

          {/* Hover Effect Border */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>

        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10"></div>
      </div>
    </Link>
  );
};

export default MovieCard;
