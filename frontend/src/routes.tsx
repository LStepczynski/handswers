import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Home } from "@/pages/home";
import { AccountView } from "@/pages/accountView";
import { LoginRedirect } from "@/pages/loginRedirect";
import { AccountManagement } from "@/pages/accountManagement";

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
    {
      path: "/admin/account-management/:page",
      element: <AccountManagement />,
    },
    {
      path: "/admin/account-management/:schoolId/:page",
      element: <AccountView />,
    },
  ]);

  return <RouterProvider router={router} />;
};
