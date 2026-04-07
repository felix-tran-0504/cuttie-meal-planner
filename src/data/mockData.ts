import { Meal } from "@/components/MealCard";
import { MealSuggestion } from "@/components/SuggestionCard";

export const todaysMeals: Meal[] = [
  { id: "1", name: "Greek Yogurt Bowl", emoji: "🥣", calories: 320, protein: 28, carbs: 35, fat: 8, time: "8:30 AM" },
  { id: "2", name: "Grilled Chicken Salad", emoji: "🥗", calories: 450, protein: 42, carbs: 18, fat: 22, time: "12:15 PM" },
  { id: "3", name: "Protein Smoothie", emoji: "🥤", calories: 280, protein: 30, carbs: 32, fat: 6, time: "3:00 PM" },
];

export const macroGoals = { calories: 2200, protein: 160, carbs: 250, fat: 70 };

export const suggestions: MealSuggestion[] = [
  { id: "s1", name: "Salmon & Quinoa", emoji: "🐟", calories: 520, protein: 38, carbs: 42, fat: 18, description: "Omega-3 rich, perfect post-workout", tags: ["High Protein", "Omega-3"] },
  { id: "s2", name: "Turkey Lettuce Wraps", emoji: "🌯", calories: 340, protein: 32, carbs: 12, fat: 16, description: "Light and filling, low carb option", tags: ["Low Carb", "Quick"] },
  { id: "s3", name: "Chickpea Buddha Bowl", emoji: "🍲", calories: 480, protein: 22, carbs: 58, fat: 14, description: "Fiber-packed plant-based meal", tags: ["Vegan", "High Fiber"] },
  { id: "s4", name: "Egg White Omelette", emoji: "🍳", calories: 260, protein: 28, carbs: 8, fat: 12, description: "Classic breakfast, packed with veggies", tags: ["Breakfast", "Low Cal"] },
  { id: "s5", name: "Tuna Poke Bowl", emoji: "🍣", calories: 410, protein: 36, carbs: 40, fat: 10, description: "Fresh and flavorful with rice", tags: ["High Protein", "Fresh"] },
];
