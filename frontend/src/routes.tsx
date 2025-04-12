import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Home } from "@/pages/home";
import { AccountView } from "@/pages/accountView";
import { LoginRedirect } from "@/pages/loginRedirect";
import { AccountManagement } from "@/pages/accountManagement";
import { JoinRoom } from "./pages/joinRoom";
import { CreateRoom } from "./pages/createRoom";
import { StudentViewRoom } from "./pages/studentViewRoom";
import { TeacherViewRoom } from "./pages/teacherViewRoom";
import { RoomHistory } from "./pages/roomHistory";
import { ChatRoom } from "./pages/chatRoom";

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
      path: "/room/history/:page",
      element: <RoomHistory />,
    },
    {
      path: "/room/:roomId",
      element: <StudentViewRoom />,
    },
    {
      path: "/room/:roomId/teacher/:page",
      element: <TeacherViewRoom />,
    },
    {
      path: "/chat/:roomId/:questionId",
      element: <ChatRoom />,
    },
  ]);

  return <RouterProvider router={router} />;
};
