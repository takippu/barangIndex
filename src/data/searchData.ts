
export const searchData = {
    header: {
        title: "Price Comparison Results",
        searchPlaceholder: "Grade A Eggs (Tray 30)",
        resultCount: "12 Results Found",
        location: "Klang Valley"
    },
    filters: [
        { label: "Cheapest", icon: "savings", active: true },
        { label: "Nearest", icon: "near_me", active: false },
        { label: "Verified Only", icon: "verified", active: false, color: "text-blue-500" },
        { label: "Hypermarkets", active: false }
    ],
    stats: {
        nationalIndex: {
            label: "National Index",
            price: "RM 14.20",
            suffix: "Avg",
            change: "+0.2%",
            isUp: true,
            subtext: "vs yesterday"
        }
    },
    results: [
        {
            id: 1,
            name: "Lotus's Hypermarket",
            type: "Hypermarket",
            icon: "storefront",
            iconColor: "text-orange-500",
            distance: "2.4km",
            area: "Cheras",
            isVerified: true,
            updated: "2h ago",
            price: "RM 12.90",
            oldPrice: "RM 14.50",
            discount: "-11%",
            isBestPrice: true
        },
        {
            id: 2,
            name: "AEON Big",
            type: "Supermarket",
            icon: "shopping_cart",
            iconColor: "text-blue-600",
            distance: "5.1km",
            area: "Ampang",
            isVerified: true,
            updated: "45m ago",
            price: "RM 13.50",
            oldPrice: "RM 14.20",
            discount: "-5%",
            discountColor: "text-green-500 bg-green-50 dark:bg-green-500/10"
        },
        {
            id: 3,
            name: "Jaya Grocer",
            type: "Premium Grocer",
            icon: "store",
            iconColor: "text-green-600",
            distance: "0.8km",
            area: "Downtown",
            isVerified: false,
            updated: "5h ago",
            price: "RM 15.90",
            change: "+12%",
            isPriceUp: true
        },
        {
            id: 4,
            name: "Speedmart 99",
            type: "Convenience Store",
            icon: "local_convenience_store",
            iconColor: "text-purple-600",
            distance: "0.2km",
            area: "Neighborhood",
            isVerified: true,
            updated: "10m ago",
            price: "RM 13.90",
            change: "-1%",
            isPriceDown: true
        }
    ]
};
