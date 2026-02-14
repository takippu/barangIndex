
export const submitData = {
    header: {
        title: "New Report",
        subtitle: "Submit Price"
    },
    item: {
        name: "Grade A Eggs (Tray of 30)",
        icon: "egg",
        lastReport: "RM 14.20 (2h ago)"
    },
    location: {
        name: "NSK Trade City",
        address: "Kuchai Lama, Kuala Lumpur",
        isAutoDetected: true
    },
    grades: [
        { name: "Grade A", details: "65-69g", active: true },
        { name: "Grade B", details: "60-64g", active: false },
        { name: "Grade C", details: "55-59g", active: false }
    ],
    stock: [
        { name: "In Stock", icon: "check_circle", active: true, color: "primary" },
        { name: "Low Stock", icon: "warning", active: false, color: "yellow" },
        { name: "Sold Out", icon: "cancel", active: false, color: "red" }
    ]
};
