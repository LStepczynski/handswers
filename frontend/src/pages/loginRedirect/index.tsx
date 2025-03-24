import React from "react";

export const LoginRedirect = () => {
  React.useEffect(() => {
    const userCookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("user="));

    if (userCookie) {
      const cookieValue = decodeURIComponent(userCookie.split("=")[1]);
      try {
        const userData = JSON.parse(cookieValue);
        localStorage.setItem("user", JSON.stringify(userData));

        document.cookie =
          "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      } catch (error) {
        console.error("Invalid JSON in user cookie");
      }
      window.location.href = "/";
    }
  }, []);

  return <></>;
};
