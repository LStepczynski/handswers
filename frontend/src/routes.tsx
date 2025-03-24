import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Home } from "@/pages/home";
import { LoginRedirect } from "@/pages/loginRedirect";

export const Routes = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/login-redirect",
      element: <LoginRedirect />,
    },
  ]);

  return <RouterProvider router={router} />;
};
