export default defineAppConfig({
  ui: {
    notifications: {
      position: "bottom-0 right-0",
    },
    primary: "cyan",
    gray: "blue-bayoux",
    horizontalNavigation: {
      active:
        "text-gray-900 dark:text-cyan-50 after:bg-primary-500 dark:after:bg-cyan-400 after:rounded-full",
      icon: {
        active: "text-gray-700 dark:text-cyan-300",
        inactive:
          "text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-cyan-200",
      },
    },
    verticalNavigation: {
      active:
        "text-gray-900 dark:text-cyan-50 before:bg-gray-100 dark:before:bg-gray-800",
      icon: {
        active: "text-gray-700 dark:text-cyan-300",
        inactive:
          "text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-cyan-200",
      },
    },
  },
});
