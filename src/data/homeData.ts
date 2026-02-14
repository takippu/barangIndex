
export const homeData = {
    header: {
        location: {
            label: "Current Location",
            value: "Kuala Lumpur"
        },
        profileIcon: "person",
        searchPlaceholder: "Search items (e.g., Cabbage, Eggs)..."
    },
    marketPulse: {
        title: "Market Pulse",
        value: "KL Grocery Index",
        change: "+1.4%",
        isUp: true,
        status: "Overall Stable",
        lastUpdated: "Updated 12m ago"
    },
    topMovers: [
        {
            name: "Tomato (Local)",
            price: "RM 4.50",
            unit: "/kg",
            change: "+12%",
            isUp: true,
            icon: "🍅"
        },
        {
            name: "Sawi (Mustard)",
            price: "RM 3.20",
            unit: "/kg",
            change: "-8.2%",
            isUp: false,
            icon: "🥬"
        },
        {
            name: "Yellow Onion",
            price: "RM 2.80",
            unit: "/kg",
            change: "+5.4%",
            isUp: true,
            icon: "🧅"
        }
    ],
    activities: [
        {
            user: "Azman K.",
            time: "2m ago",
            location: "Chow Kit Market",
            isVerified: true,
            item: {
                name: "Whole Chicken",
                variant: "Standard, Cleaned",
                price: "RM 9.40",
                unit: "/kg",
                change: "- RM 0.20",
                isUp: false,
                icon: "🐔"
            },
            likes: 12,
            comments: 2
        },
        {
            user: "Sarah L.",
            time: "15m ago",
            location: "TTDI Market",
            isVerified: false,
            item: {
                name: "Red Chili",
                variant: "Local Kulai",
                price: "RM 16.00",
                unit: "/kg",
                change: "+ RM 1.50",
                isUp: true,
                icon: "🌶️"
            },
            likes: 8,
            comments: 0
        },
        {
            user: "Uncle Lim",
            time: "32m ago",
            location: "PJ Old Town",
            isVerified: true,
            item: {
                name: "Mackerel (Kembung)",
                variant: "Medium Size",
                price: "RM 14.50",
                unit: "/kg",
                change: "Unchanged",
                isUp: null,
                icon: "🐟"
            },
            likes: 24,
            comments: 5
        }
    ],
    navigation: [
        { label: "Home", icon: "home", isActive: true },
        { label: "Markets", icon: "monitoring", isActive: false },
        { label: "Add", icon: "add", isFab: true },
        { label: "Alerts", icon: "notifications", isActive: false },
        { label: "Profile", icon: "person", isActive: false }
    ]
};
