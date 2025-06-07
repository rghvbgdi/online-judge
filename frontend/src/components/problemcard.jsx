

import React from "react";
import { Link } from "react-router-dom";

const difficultyColors = {
  Easy: "bg-green-200 text-green-800",
  Medium: "bg-yellow-200 text-yellow-800",
  Hard: "bg-red-200 text-red-800",
};

const ProblemCard = ({ id, slug, title, description, difficulty }) => {
  return (
    <div className="border rounded-md p-4 shadow hover:shadow-lg transition cursor-pointer">
      <Link to={`/problems/${slug}`} className="text-xl font-semibold hover:underline">
        {title}
      </Link>
      <p className="text-gray-600 mt-2 line-clamp-3">{description}</p>
      <span
        className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[difficulty]}`}
      >
        {difficulty}
      </span>
    </div>
  );
};

export default ProblemCard;