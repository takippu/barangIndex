const iconByKeyword: Array<{ keyword: string; icon: string }> = [
  { keyword: "egg", icon: "🥚" },
  { keyword: "telur", icon: "🥚" },
  { keyword: "chicken breast", icon: "🍗" },
  { keyword: "chicken", icon: "🍗" },
  { keyword: "ayam", icon: "🍗" },
  { keyword: "beef", icon: "🥩" },
  { keyword: "lembu", icon: "🥩" },
  { keyword: "fish", icon: "🐟" },
  { keyword: "mackerel", icon: "🐟" },
  { keyword: "ikan", icon: "🐟" },
  { keyword: "oil", icon: "🫒" },
  { keyword: "minyak", icon: "🫒" },
  { keyword: "rice", icon: "🍚" },
  { keyword: "beras", icon: "🍚" },
  { keyword: "onion", icon: "🧅" },
  { keyword: "bawang", icon: "🧅" },
  { keyword: "tomato", icon: "🍅" },
  { keyword: "cili", icon: "🌶️" },
  { keyword: "sawi", icon: "🥬" },
  { keyword: "cabbage", icon: "🥬" },
  { keyword: "gula", icon: "🧂" },
];

const iconByCategory: Record<string, string> = {
  protein: "🥩",
  vegetable: "🥬",
  grocery: "🛒",
};

export function getItemIcon(name: string, category?: string | null) {
  const lowerName = name.toLowerCase();
  const keywordMatch = iconByKeyword.find((entry) => lowerName.includes(entry.keyword));
  if (keywordMatch) {
    return keywordMatch.icon;
  }

  if (category) {
    const categoryIcon = iconByCategory[category.toLowerCase()];
    if (categoryIcon) {
      return categoryIcon;
    }
  }

  return "🧺";
}
