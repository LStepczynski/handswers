import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Home } from "./pages/home";

export const Routes = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
  ]);

  return <RouterProvider router={router} />;
};
