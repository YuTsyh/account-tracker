# Account Tracker

A modern, comprehensive, and collaborative financial tracking application built with Vue 3 and Go. It is designed to work seamlessly across web and mobile devices as a Progressive Web App (PWA) with native mobile capabilities via Capacitor.

## ✨ Key Features

*   **Personal & Shared Books**: Manage your personal finances or collaborate with others (family, friends, roommates) using shared account books.
*   **Easy Collaboration**: Share books easily via secure, 6-digit alphanumeric codes.
*   **Multi-Currency Support**: Track expenses in various currencies seamlessly.
*   **Interactive Visualizations**: Gain insights into your spending habits with clear, interactive charts (powered by Chart.js & vue-chartjs).
*   **Robust Cloud Sync**: Auto-syncing with a backend server ensures your data is always up-to-date across all your devices, featuring intelligent debouncing to optimize performance.
*   **Internationalization (i18n)**: Full support for multiple languages (currently English and Traditional Chinese).
*   **Modern UI/UX**: Clean, responsive, and accessible interface built with Tailwind CSS v4, featuring a unified, animated toast notification system.
*   **Cross-Platform**: Run as a standard web app, or build as native iOS and Android applications using Capacitor.

## 🛠 Technology Stack

### Frontend
*   **Framework**: [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
*   **State Management**: [Pinia](https://pinia.vuejs.org/) (Modularized for maintainability)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Routing**: [Vue Router](https://router.vuejs.org/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Mobile Container**: [Capacitor](https://capacitorjs.com/) (iOS/Android)
*   **Icons**: [Google Material Symbols](https://fonts.google.com/icons)
*   **Icons (Legacy)**: FontAwesome
*   **Utility**: date-fns (Date manipulation), uuid (Unique IDs)

### Backend
*   **Language**: Go
*   **Database**: (Implementation dependent, handles shared spaces and syncing)

## 📂 Project Structure (Frontend)

The frontend codebase is organized to separate concerns and maintain readability:

```text
account-tracker/
├── android/                # Capacitor Android project files
├── ios/                    # Capacitor iOS project files
├── src/
│   ├── assets/             # Static assets (images, global CSS)
│   ├── components/         # Reusable Vue components (UI elements, modals, charts)
│   ├── composables/        # Shared Vue composition logic (e.g., useToast)
│   ├── locales/            # i18n translation files (en.ts, zh-TW.ts)
│   ├── router/             # Vue Router configuration
│   ├── stores/             # Pinia state management modules
│   │   ├── books.ts        # Book management, sharing logic
│   │   ├── categories.ts   # Category CRUD
│   │   ├── cloud-sync.ts   # Backend synchronization
│   │   ├── personal.ts     # Personal expense records
│   │   ├── tracker.ts      # Main compositional store linking modules
│   │   └── ...             # Other modularized state files
│   ├── views/              # Page-level Vue components
│   ├── App.vue             # Root component
│   └── main.ts             # Application entry point
├── package.json            # Node dependencies and scripts
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

## 🚀 Getting Started

### Prerequisites

*   **Node.js**: (Version 20.19.0+ recommended)
*   **npm** or **yarn** or **pnpm**: Node package manager.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd account-tracker
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the root directory and configure the API endpoint for cloud syncing and collaborative features:
    ```env
    VITE_API_URL=http://localhost:8080 # Replace with your Go backend URL
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The app will be available at usually `http://localhost:5173`.

### Building for Production

To create a production-ready web build:

```bash
npm run build
```
The output will be in the `dist/` directory.

### Mobile Development (Capacitor)

If you plan to deploy to iOS or Android, ensure you have the respective native environments set up (Xcode / Android Studio).

1. Build the web project: `npm run build`
2. Sync with Capacitor: `npx cap sync`
3. Open native IDE: `npx cap open ios` or `npx cap open android`

## 🏗 Recent Architectural Highlights

*   **Store Modularization**: The monolithic state management has been split into dedicated, focused Pinia modules (`src/stores/*`), improving maintainability and reducing module complexity.
*   **Global Notification System**: A centralized Toast Notification system (`useToast` composable) replaces standard browser alerts, providing a modern, consistent, and localized user feedback mechanism across the application.
*   **Optimized Cloud Sync**: Aggressive debouncing is implemented on synchronization tasks to prevent race conditions and minimize unnecessary backend requests during rapid data entry.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
