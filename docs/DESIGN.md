# Design System: BarangHarga: Smart Community - PRD
**Project ID:** 4355985806584716403

## 1. Visual Theme & Atmosphere
The design evokes a clean, modern, and community-focused atmosphere. It feels "Fresh," "Approachable," and "Utilitarian." The use of vibrant green accents against clean white and dark backgrounds suggests growth, freshness (marketplace context), and modern efficiency. The interface is airy with generous whitespace, using rounded elements to create a friendly and accessible feel.

## 2. Color Palette & Roles
*   **Vibrant Jungle Green** (#17cf5a) for **Primary Actions & Brand Accent**: Used for the main "Login" button, the "Harga" part of the logo, active states, and key links like "Join the community".
*   **Deep Forest Green** (#12a346) for **Primary Hover States**: A darker shade used for hover and active states on primary buttons and links.
*   **Clean White** (#ffffff) for **Light Mode Background & Cards**: The primary surface color in light mode.
*   **Soft Mint-Grey** (#f6f8f7) for **Light Mode Inputs**: A very subtle, cool grey used for input field backgrounds in light mode.
*   **Deep Jungle Night** (#112117) for **Dark Mode Background**: A rich, very dark green-black used as the background in dark mode.
*   **Midnight Navy** (#0f172a) for **Primary Text (Light)**: A deep distinctive navy used for headings and the "Barang" part of the logo.
*   **Slate Grey** (#64748b) for **Secondary Text**: Used for subtitles and placeholder text.

## 3. Typography Rules
*   **Font Family**: `Plus Jakarta Sans`, a modern geometric sans-serif that feels tech-forward yet friendly.
*   **Headings**: Bold (`font-bold`) and Extra Bold (`font-extrabold`) weights.
    *   **Logo Text**: Extra bold, tracking tight.
    *   **Page Titles**: Bold, size `text-2xl` or `text-3xl`.
*   **Body Text**: Medium (`font-medium`) weight for subtitles (`text-slate-500`), standard weight for inputs.
*   **Labels**: Semibold (`font-semibold`) for input labels and button text.

## 4. Component Stylings
*   **Buttons**:
    *   **Primary Button**: "Pill-shaped" but securely grounded with `rounded-xl` (12px). Full width. Features a subtle drop shadow (`shadow-lg`, `shadow-primary/30`) for elevation. Includes a hover translation effect on the icon (`group-hover:translate-x-1`).
    *   **Social Buttons**: Outline style with `border-slate-200`. `rounded-xl`. White background (light mode) or dark slate (dark mode). Hover state changes background color (`hover:bg-slate-50`).
*   **Inputs/Forms**:
    *   **Fields**: `rounded-xl` (12px). Generous padding (`py-3.5`).
    *   **Border**: Subtle `border-slate-200` (light) / `dark:border-slate-700`.
    *   **Focus State**: thick ring (`focus:ring-2`) with transparency (`ring-primary/50`) and solid border color (`border-primary`).
    *   **Icons**: Absolute positioned icons inside the input field, colored in `text-slate-400`.
*   **Cards/Containers**:
    *   The main login container is strictly bounded (`max-w-sm`) and centered, creating a focused "card" effect on larger screens, while filling the screen on mobile.

## 5. Layout Principles
*   **Spacing**: standard Tailwind spacing scale (`gap-2`, `space-y-5`).
*   **Alignment**: heavily dependent on flexbox centering (`flex flex-col items-center justify-center`).
*   **Whitespace**: Significant padding (`p-6`) around the main content area to ensure breathability.
*   **Responsive**: Mobile-first approach. Content is justified `between` on mobile (filling height) and `center` on larger screens (`sm:justify-center`).
