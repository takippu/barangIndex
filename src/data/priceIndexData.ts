
export const priceIndexData = {
    header: {
        title: "Price Index",
        subtitle: "Grade A Eggs (Tray 30)"
    },
    overview: {
        price: "RM 14.20",
        change: "+0.2%",
        timeframe: "vs last 24h",
        tracks: "12.4k Tracks"
    },
    chart: {
        current: "RM 14.25",
        date: "Oct 14"
    },
    stats: [
        { label: "All-Time High", value: "RM 16.50", subtext: "June 2023" },
        { label: "All-Time Low", value: "RM 11.20", subtext: "Jan 2021" },
        { label: "7D Volatility", value: "Low", subtext: "Stable Market", hasIndicator: true },
        { label: "Confidence", value: "98%", subtext: "High Reliability", isPrimary: true, isVerified: true }
    ],
    transparency: {
        verified: "1,248",
        reporters: "842",
        percentage: 98
    },
    related: [
        { name: "Grade B Eggs", price: "RM 13.50", change: "+0.1%", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCf3aOE4S1CWezqnN_Qyiq46Q9vok00JFeGUVAjqwJXK0cUwQc8nOkW8DKiZPtz4cLzzU6uJGqhiPJ7U25fuU5si_CBHAs03ElLdEihHly2ErG9ylsbVXrII69dkFYadcPkhV3zb7AMsb3aOpOmSzuYOUm5FkQv3QAH2TcUumjqfuYaTsMc_tOnCcOHurTc6n2GiY5bifkzd5GI7UZqQZ_Bn6ou8KRMxQWHWenQnzYD9Ler-T_wndlWnmAeuuwPMcRwgGO7GXX1Ybo" },
        { name: "Grade C Eggs", price: "RM 12.90", change: "-0.4%", isDown: true, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFR3ls9aIVKJAT4VpY4zvV1euEuXi0OHBk3_r93QvYfMAYcYukly1OxxGW4QFU57j8hFCHgiRozl371d2VoMZyqFjnC8xsKgzS1C01KKDBUXYhKngdsqnkKxvv9nYchU6oWGwfZ7lTSFJMnu8By3_a8dZ41sp6KntOdgsRC-GS4dEPcxIu57BPSDExK_W0P8I2C2rK4xPj8bwaK9leFZu2ZScbRfxmkwGSz5JcNyzWhN-0WDmN6ODNqOpZhLPi-KzMOceom-OmAEo" },
        { name: "Omega Eggs", price: "RM 18.20", change: "+1.2%", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDW7ZYwS_FuBki0TMiqaJncSiD7AjzBzHD8oGx4Id1iggTF8AViaSq0rQJ3mYhJCWvw7YNUjP9_L-LjOny6Rv8NRGTxhokFeU4rwexwpdVdXrNWpdoqU9Kg4HG0FU2CDI4DXYOA-vYKrQdwkyJ3F7o0tuCsCYcQZYgvCMT5_lF0WWoNWwi1vhq-4HKaSyQfdgP2ScCSV_a0wd5lOr6w-bZK8UfRTalHdIY5YQr01pc4dqFpX0cATINjKiln7sPj9rabjcqoSP97K4o" }
    ],
    stores: [
        {
            name: "NSK Trade City",
            shortName: "NSK",
            color: "bg-blue-600",
            location: "2.4km away • Updated 2h ago",
            price: "RM 13.90",
            oldPrice: "RM 14.50",
            isPrimary: true
        },
        {
            name: "Lotus's",
            shortName: "LOTUS",
            color: "bg-yellow-500 text-black",
            location: "4.1km away • Updated 45m ago",
            price: "RM 14.20",
            tag: "Median Price"
        },
        {
            name: "Jaya Grocer",
            shortName: "JAYA",
            color: "bg-orange-600",
            location: "1.2km away • Updated 5h ago",
            price: "RM 16.50",
            tag: "+16% vs Avg",
            isRed: true,
            opacity: "opacity-80"
        },
        {
            name: "Hero Market",
            shortName: "HERO",
            color: "bg-red-600",
            location: "5.5km away • Updated 12m ago",
            price: "RM 14.00",
            change: "-1.4%"
        }
    ]
};
