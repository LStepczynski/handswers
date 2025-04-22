import React from "react";
import { useParams } from "react-router-dom";

import {
  Settings,
  Trash2,
  UserPen,
  MessageSquare,
  EyeOff,
  OctagonAlert,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fetchWrapper } from "@/utils/fetchWrapper";
import { truncateString } from "@/utils/truncateString";
import { getUser } from "@/utils/getUser";
import { useBreadcrumbs } from "@/components/custom/navBreadcrumbs/breadcrumbProvider";

const breadcrumbs = [
  {
    label: "Room",
    link: "#",
  },
  {
    label: "View",
    link: "#",
  },
];

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const TeacherViewRoom = () => {
  const [messageData, setMessageData] = React.useState<
    Record<any, string>[] | null
  >(null);
  const [roomData, setRoomData] = React.useState({
    active: true,
    createdAt: 0,
    roomCode: "",
  });
  const [dialog, setDialog] = React.useState({
    open: false,
    anonymous: false,
  });
  const [alertDialog, setAlertDialog] = React.useState({
    open: false,
    title: "",
    description: "",
    actionBtn: null as null | string,
    onAction: null as any,
    closeBtn: null as null | string,
  });
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);

  // Set breadcrumbs
  const { setBreadcrumbs } = useBreadcrumbs();
  React.useEffect(() => {
    setBreadcrumbs(breadcrumbs);
  }, []);

  const user = getUser();
  if (!user || !user.roles.includes("creator")) {
    window.location.href = "/";
    return null;
  }

  const roomId = useParams().roomId;
  const page = Number(useParams().page) || 1;

  React.useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      if (controller.signal.aborted) return;
      if (!roomData.active) return;

      try {
        const data = await fetchWrapper(
          `${backendUrl}/room/get/${roomId}/${page}`,
          {
            signal: controller.signal,
          }
        );

        if (data.statusCode == 200) {
          setMessageData(data.data.questionData);
          setRoomData(data.data.roomData);
        } else if (data.statusCode == 404) {
          setAlertDialog({
            open: true,
            title: "Error!",
            description: "It looks like this question room does not exist.",
            actionBtn: "Leave",
            closeBtn: "Close",
            onAction: () => (window.location.href = "/"),
          });
        } else {
          throw new Error("err");
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setAlertDialog({
          open: true,
          title: "Error!",
          description:
            "It looks like there was an error while fetching the question room. Please try again later.",
          actionBtn: "Leave",
          closeBtn: "Close",
          onAction: () => (window.location.href = "/"),
        });
      }
    };

    fetchData(); // initial fetch
    const intervalId = setInterval(fetchData, 20 * 1000); //Update frequency
    return () => {
      controller.abort();
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const onRoomClose = async () => {
    const data = await fetchWrapper(`${backendUrl}/room/close/${roomId}`, {
      method: "PUT",
    });
    if (data.statusCode == 200) {
      window.location.href = "/room/history/1";
    } else {
      setTimeout(
        () =>
          setAlertDialog({
            open: true,
            title: "Error!",
            description:
              "It looks like there was an error while closing the question room. Please try again later.",
            actionBtn: null,
            closeBtn: "Close",
            onAction: null,
          }),
        1000
      );
    }
  };

  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <Dialog
        open={dialog.open}
        onOpenChange={(value) =>
          setDialog((prev: any) => ({ ...prev, open: value }))
        }
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Question Room</DialogTitle>
            <DialogDescription>
              Make changes to your room here.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Separator className="mb-4" />
            <div className="flex gap-2 items-center">
              <Switch
                checked={dialog.anonymous}
                onCheckedChange={(value) =>
                  setDialog((prev: any) => ({ ...prev, anonymous: value }))
                }
              />
              <p>Anonymous Users</p>
            </div>
            <Separator className="my-4" />
            {roomData.active && (
              <div className="flex gap-2 items-center">
                <Button
                  variant="destructive"
                  onClick={() =>
                    setAlertDialog({
                      open: true,
                      title: "Are you sure?",
                      description:
                        "If you close this room you will not be able to open it again.",
                      closeBtn: "Exit",
                      actionBtn: "Close Room",
                      onAction: onRoomClose,
                    })
                  }
                >
                  <Trash2 />
                </Button>
                <p className="font-semibold">Close Room</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() =>
                setDialog((prev: any) => ({ ...prev, open: false }))
              }
              className="font-semibold"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="mt-16">
        <div className="flex justify-between items-center mx-3">
          <h1 className="text-3xl font-semibold">
            Question Room {roomData.roomCode}
          </h1>
          <Button
            variant="secondary"
            onClick={() => setDialog((prev: any) => ({ ...prev, open: true }))}
          >
            <Settings />
          </Button>
        </div>
        <Separator className="my-4" />
        {messageData && messageData.length != 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {messageData.map((question: any) => {
              return (
                <AccordionItem value={question.createdAt}>
                  <AccordionTrigger>
                    <div className="w-full flex justify-between relative">
                      <p className={question.active ? "" : "opacity-40"}>
                        {truncateString(
                          question.content,
                          windowWidth > 540 ? 50 : 35
                        )}
                      </p>
                      <div className="mr-4 gap-4 flex absolute right-0 top-0">
                        {!question.active && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <EyeOff />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Question was closed by the user.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {question.needTeacher && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <OctagonAlert color="orange" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>User requested help.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="bg-secondary rounded-md p-3">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-1">
                          <UserPen className="w-7 h-7" />
                          <p>{" : "}</p>
                          <p className="text-lg">
                            {dialog.anonymous
                              ? "Anonymous"
                              : truncateString(
                                  question.author,
                                  windowWidth > 400 ? 40 : 20
                                )}
                          </p>
                        </div>
                        <a
                          href={`/chat/${roomId}/${question.questionId}?timestamp=${question.createdAt}&isTeacher=true`}
                        >
                          <Button>
                            <MessageSquare />
                          </Button>
                        </a>
                      </div>
                      <Separator className="my-3 bg-primary" />
                      <p>{question.content}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <div className="w-full flex justify-center mt-16">
            <h4 className="text-2xl font-semibold">
              No questions {roomData.active ? "posted yet" : "found"} ...
            </h4>
          </div>
        )}
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
              <PaginationPrevious
                href={`/room/${roomId}/teacher/${page - 1}`}
              />
            )}
          </PaginationItem>

          {/* First Page */}
          {page !== 1 && (
            <PaginationItem>
              <PaginationLink href={`/room/${roomId}/teacher/1`}>
                1
              </PaginationLink>
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
            {messageData && messageData.length < 15 ? (
              <PaginationNext
                aria-disabled="true"
                className="pointer-events-none opacity-50"
              />
            ) : (
              <PaginationNext href={`/room/${roomId}/teacher/${page + 1}`} />
            )}
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <AlertDialog
        open={alertDialog.open}
        onOpenChange={(value) =>
          setAlertDialog((prev: any) => ({ ...prev, open: value }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {alertDialog.closeBtn && (
              <AlertDialogCancel>{alertDialog.closeBtn}</AlertDialogCancel>
            )}
            {alertDialog.actionBtn && (
              <AlertDialogAction
                onClick={alertDialog.onAction}
                className="font-semibold"
              >
                {alertDialog.actionBtn}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
