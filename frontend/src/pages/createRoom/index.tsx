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

import { Spinner } from "@/components/custom/spinner";
import { fetchWrapper } from "@/utils/fetchWrapper";
import { getUser } from "@/utils/getUser";
import { useBreadcrumbs } from "@/components/custom/navBreadcrumbs/breadcrumbProvider";

const breadcrumbs = [
  {
    label: "Room",
    link: "#",
  },
  {
    label: "Create",
    link: "#",
  },
];

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const CreateRoom = () => {
  const [dialog, setDialog] = React.useState({
    title: "",
    description: "",
  });
  const [open, setOpen] = React.useState(false);

  // Set breadcrumbs
  const { setBreadcrumbs } = useBreadcrumbs();
  React.useEffect(() => {
    setBreadcrumbs(breadcrumbs);
  }, []);

  const user = getUser();
  if (!user?.roles.includes("creator")) {
    window.location.href = "/";
    return null;
  }

  React.useEffect(() => {
    const sendRequest = async () => {
      const data = await fetchWrapper(`${backendUrl}/room/create`, {
        method: "POST",
      });

      if (data.statusCode == 200) {
        return (window.location.href = `/room/${data.data.roomUuid}/teacher/1?roomCode=${data.data.roomId}`);
      } else if (data.statusCode == 403) {
        setDialog({
          title: "Too many rooms",
          description:
            "You already have an active room. Close it to create a new one.",
        });
        setOpen(true);
      } else {
        setDialog({
          title: "Error!",
          description:
            "An error occured while creating the question room. Please try again later.",
        });
        setOpen(true);
      }
    };
    sendRequest();
  }, []);

  return (
    <div className="grid justify-center items-center h-[75%]">
      <div className="grid gap-4">
        <div className="grid justify-center ">
          <Spinner className="h-12 w-12" />
        </div>
        <h4 className="font-semibold text-2xl">Creating Room</h4>
      </div>
      <AlertDialog
        open={open}
        onOpenChange={() => (window.location.href = "/")}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Okay</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
