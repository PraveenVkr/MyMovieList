"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";

const navLinks = [
  { href: "/", label: "Popular" },
  { href: "/toprated", label: "Top Rated" },
  { href: "/upcoming", label: "Upcoming" },
];

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 backdrop-blur-xl border-b border-slate-700/30 shadow-2xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(120,119,198,0.1),transparent)] pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center text-2xl font-black tracking-tight text-white select-none transition-all duration-300 hover:scale-105"
          >
            <div className="mr-3 text-2xl bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl p-2 shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
              🎬
            </div>
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              MyMovieList
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex gap-2 text-lg">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative px-6 py-3 rounded-2xl text-slate-300 font-medium transition-all duration-300 hover:text-white"
              >
                <span className="relative z-10">{link.label}</span>

                {/* Hover Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 border border-slate-600/30"></div>

                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center group"
          >
            <div className="relative bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl p-1 border border-slate-600/30 shadow-lg group-focus-within:shadow-blue-500/20 transition-all duration-300">
              <div className="flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies..."
                  className="bg-transparent text-white placeholder-slate-400 outline-none px-4 py-2 w-48 focus:w-64 transition-all duration-300 rounded-l-2xl"
                />
                <button
                  type="submit"
                  className="group/btn relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white p-2.5 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                >
                  <FiSearch className="w-5 h-5 group-hover/btn:scale-110 transition-transform duration-200" />

                  {/* Button Glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-0 group-hover/btn:opacity-40 transition-opacity duration-300"></div>
                </button>
              </div>

              {/* Search Bar Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-60 transition-opacity duration-300 -z-10"></div>
            </div>
          </form>
        </div>
      </div>
    </header>
  );
};

export default Header;
