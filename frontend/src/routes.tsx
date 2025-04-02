import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Home } from "@/pages/home";
import { AccountView } from "@/pages/accountView";
import { LoginRedirect } from "@/pages/loginRedirect";
import { AccountManagement } from "@/pages/accountManagement";
import { JoinRoom } from "./pages/joinRoom";
import { CreateRoom } from "./pages/createRoom";
import { StudentViewRoom } from "./pages/studentViewRoom";
import { TeacherViewRoom } from "./pages/teacherViewRoom";

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
    {
      path: "/room/join",
      element: <JoinRoom />,
    },
    {
      path: "/room/create",
      element: <CreateRoom />,
    },
    {
      path: "/room/:roomId",
      element: <StudentViewRoom />,
    },
    {
      path: "/room/:roomId/teacher",
      element: <TeacherViewRoom />,
    },
  ]);

  return <RouterProvider router={router} />;
};
