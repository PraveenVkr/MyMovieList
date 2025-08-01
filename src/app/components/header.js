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
    router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    setSearchQuery("");
  };

  return (
    <header className="sticky top-0 z-50 bg-[#181A23]/90 backdrop-blur-xl border-b border-[#232A34]/70 shadow-lg">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center text-2xl font-extrabold tracking-tight text-white select-none"
        >
          <span className="mr-2 text-[#FFC857]">🎬</span>
          <span>Movie</span>
          <span className="ml-1 font-black text-[#2286FE]">App</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex gap-6 text-lg">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1 rounded-lg text-[#D1D5DB] hover:bg-[#232A34]/60 hover:underline hover:text-white transition"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center bg-[#232A34] px-3 py-2 rounded-xl drop-shadow-md focus-within:ring-2 focus-within:ring-[#2286FE] border border-[#232A34]/50"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies..."
            className="bg-transparent text-white placeholder-[#B0B5C2] outline-none w-36 focus:w-52 transition-all"
          />
          <button
            type="submit"
            className="ml-2 bg-[#2286FE] hover:bg-[#FF274A] text-white px-3 py-1 rounded-lg transition"
          >
            <FiSearch />
          </button>
        </form>
      </div>
    </header>
  );
};

export default Header;
