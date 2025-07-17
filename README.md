# Hijri Birthday Reminder

This is a simple application to help you remember the Gregorian and Hijri dates for your children's birthdays.

## ✨ Features

- **Dual Calendar Support**: Tracks birthdays in both Gregorian and Hijri calendars.
- **Age Calculation**: Automatically calculates the age in both Gregorian and Hijri years.
- **Upcoming Birthdays**: Displays a sorted list of the next upcoming birthdays.
- **Local Storage**: All data is stored in your browser's local storage, ensuring privacy.
- **Modern Tech Stack**: Built with React, Vite, TanStack Router, Tailwind CSS, and DaisyUI.
- **Temporal API**: Uses the modern `Temporal` API for all date and time operations, with a polyfill for older browsers.

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need to have [Bun](https://bun.sh/) installed on your machine.

### Installation & Running

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/your-username/hijri-birthday.git
    cd hijri-birthday
    ```

2.  **Install dependencies:**

    ```sh
    bun install
    ```

3.  **Run the development server:**

    ```sh
    bun run dev
    ```

    The application will be available at `http://localhost:3000`.

## 🛠️ Building for Production

To create a production-ready build of the application, run the following command:

```sh
bun run build
```

This will create an optimized build in the `dist` directory that you can deploy to any static hosting service.

## 🧪 Running Tests

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```sh
bun run test
```

## 🎨 Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for utility-first styling and [DaisyUI](https://daisyui.com/) for a beautiful, pre-built component library.

## ⚙️ Project Structure

The project is structured as a standard Vite + React application:

- `src/routes/`: Contains the application's routes, powered by [TanStack Router](https://tanstack.com/router).
- `src/services/`: Includes data storage logic. The `LocalStorageService` can be swapped with other storage solutions (e.g., Firebase, Supabase) by implementing the `StorageService` interface.
- `src/utils/`: Contains utility functions, primarily for date calculations.
- `src/styles.css`: Main stylesheet where Tailwind CSS and DaisyUI are imported.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📄 License

This project is licensed under the MIT License.
