import React from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const LoginRedirect = () => {
  const [loginRes, setLoginRes] = React.useState<null | Record<string, any>>(
    null
  );

  React.useEffect(() => {
    const userCookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("loginResponse="));

    if (userCookie) {
      const cookieValue = decodeURIComponent(userCookie.split("=")[1]);
      try {
        const userData = JSON.parse(cookieValue);
        setLoginRes(userData);

        document.cookie =
          "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      } catch (error) {
        setLoginRes({ error: true });
      }
    }
  }, []);

  React.useEffect(() => {
    if (loginRes && !loginRes.unregistered && !loginRes.disabled) {
      localStorage.setItem("user", JSON.stringify(loginRes));
      window.location.href = "/";
    }
  }, [loginRes]);

  if (loginRes == null) {
    return <></>;
  }

  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>A problem occured.</AlertDialogTitle>
          <AlertDialogDescription>
            {loginRes.disabled
              ? "This Handswers account has been disabled."
              : "This google account is not registered with Handswers."}{" "}
            Please contact your school administrator for help.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => (window.location.href = "/")}>
            Close
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
