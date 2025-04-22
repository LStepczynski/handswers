import React from "react";
import { useParams } from "react-router-dom";

import { Trash2 } from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { Spinner } from "@/components/custom/spinner";
import { useFetchData } from "@/hooks/useFetchData";
import { getUser } from "@/utils/getUser";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { fetchWrapper } from "@/utils/fetchWrapper";

import { useBreadcrumbs } from "@/components/custom/navBreadcrumbs/breadcrumbProvider";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const breadcrumbs = [
  {
    label: "Room",
    link: "#",
  },
  {
    label: "History",
    link: "#",
  },
];

export const RoomHistory = () => {
  const [dialog, setDialog] = React.useState({
    open: false,
    title: "",
    description: "",
    loading: [false, null],
    closeBtn: null as null | string,
    actionBtn: null as null | string,
    onAction: null as any,
  });

  // Set breadcrumbs
  const { setBreadcrumbs } = useBreadcrumbs();
  React.useEffect(() => {
    setBreadcrumbs(breadcrumbs);
  }, []);

  const user = getUser();
  if (user == undefined || !user.roles.includes("creator")) {
    window.location.href = "/";
    return null;
  }

  const page = Number(useParams().page) || 1;
  const { data: rooms, setData } = useFetchData(
    `${backendUrl}/room/get/teacher/${user!.id}/${page}`,
    [],
    {}
  );

  const formatTimestamp = (seconds: number): string => {
    const date = new Date(seconds * 1000);

    const pad = (n: number) => n.toString().padStart(2, "0");

    const month = pad(date.getMonth() + 1); // Months are 0-indexed
    const day = pad(date.getDate());
    const year = date.getFullYear().toString().slice(-2);
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${month}/${day}/${year} ${hours}:${minutes}`;
  };

  const deleteRoom = async (id: string) => {
    setDialog((prev: any) => ({ ...prev, loading: [true, id] }));

    const data = await fetchWrapper(`${backendUrl}/room/delete/${id}`, {
      method: "DELETE",
    });

    setTimeout(() => {
      if (data.statusCode == 200) {
        setDialog({
          open: true,
          title: "Success!",
          description: "Question room successfully deleted.",
          closeBtn: "Okay",
          loading: [false, null],
          actionBtn: null,
          onAction: null,
        });
        setData((prev: any) => prev.filter((room: any) => room.roomId != id));
      } else if (data.statusCode == 404) {
        setDialog({
          open: true,
          title: "Error!",
          description: "This question room does not exist.",
          closeBtn: "Okay",
          loading: [false, null],
          actionBtn: null,
          onAction: null,
        });
      } else {
        setDialog({
          open: true,
          title: "Error!",
          description:
            "There was an error while deleting this room. Please try again later.",
          closeBtn: "Okay",
          loading: [false, null],
          actionBtn: null,
          onAction: null,
        });
      }
      setDialog((prev: any) => ({ ...prev, loading: false }));
    }, 1000);
  };

  const onTryDelete = (id: string) => {
    setDialog({
      open: true,
      title: "Are you sure?",
      description: "This action cannot be reversed. All data will be lost.",
      closeBtn: "Close",
      loading: [false, null],
      actionBtn: "Delete",
      onAction: () => deleteRoom(id),
    });
  };

  if (!rooms) {
    return (
      <div className="grid justify-center items-center h-[75%]">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <>
      <div className="mt-16">
        <div className="flex justify-between items-center mx-3">
          <h1 className="text-2xl xs:text-3xl font-semibold">
            Question Room History
          </h1>
        </div>
        <Separator className="my-4" />
        <div className="grid gap-2">
          {(rooms as any).length != 0 ? (
            (rooms as any).map((room: any) => (
              <Button
                className="w-full font-semibold"
                variant={room.active ? "default" : "secondary"}
              >
                <div className="w-full underline flex justify-between items-center">
                  <a href={`/room/${room.roomId}/teacher/1`}>
                    Room - {formatTimestamp(room.createdAt)}
                    {room.active && " - (Active)"}
                  </a>
                  <Button
                    variant="ghost"
                    onClick={() => onTryDelete(room.roomId)}
                  >
                    {dialog.loading[0] && dialog.loading[1] == room.roomId ? (
                      <Spinner />
                    ) : (
                      <Trash2 />
                    )}
                  </Button>
                </div>
              </Button>
            ))
          ) : (
            <div className="w-full flex justify-center mt-16">
              <h4 className="text-2xl font-semibold">
                No rooms created yet ...
              </h4>
            </div>
          )}
        </div>
      </div>
      <Pagination className="mt-20">
        <PaginationContent>
          {/* Previous Button */}
          <PaginationItem>
            {page === 1 ? (
              <PaginationPrevious
                aria-disabled="true"
                className="pointer-events-none opacity-50"
              />
            ) : (
              <PaginationPrevious href={`/room/history/${page - 1}`} />
            )}
          </PaginationItem>

          {/* First Page */}
          {page !== 1 && (
            <PaginationItem>
              <PaginationLink href={`/room/history/1`}>1</PaginationLink>
            </PaginationItem>
          )}

          {/* Current Page */}
          <PaginationItem>
            <PaginationLink isActive>{page}</PaginationLink>
          </PaginationItem>

          {/* Ellipsis */}
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>

          {/* Next Button */}
          <PaginationItem>
            {(rooms as any).length < 15 ? (
              <PaginationNext
                aria-disabled="true"
                className="pointer-events-none opacity-50"
              />
            ) : (
              <PaginationNext href={`/room/history/${page + 1}`} />
            )}
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <AlertDialog
        open={dialog.open}
        onOpenChange={(value) =>
          setDialog((prev: any) => ({ ...prev, open: value }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {dialog.closeBtn && (
              <AlertDialogCancel>{dialog.closeBtn}</AlertDialogCancel>
            )}
            {dialog.actionBtn && (
              <AlertDialogAction
                onClick={dialog.onAction}
                className="font-semibold"
              >
                {dialog.actionBtn}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
