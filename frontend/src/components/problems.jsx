import React from "react";


const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const Problems = [
  {
    title: "Two Sum",
    description: "Given an array of integers, return indices of the two numbers such that they add up to a specific target.",
    difficulty: "Easy",
  },
  {
    title: "Longest Substring Without Repeating Characters",
    description: "Find the length of the longest substring without repeating characters.",
    difficulty: "Medium",
  },
  {
    title: "Median of Two Sorted Arrays",
    description: "Find the median of two sorted arrays.",
    difficulty: "Hard",
  },
].map((problem, index) => ({
  ...problem,
  id: index + 1,
  slug: slugify(problem.title),
}));

export default Problems;
