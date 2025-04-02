import React from "react";
import { useParams } from "react-router-dom";

import { Settings, Trash2 } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const TeacherViewRoom = () => {
  const [data, setData] = React.useState<Record<any, string>[] | null>(null);
  const [dialog, setDialog] = React.useState({
    open: false,
    anonymous: false,
  });

  const roomId = useParams().roomId;

  React.useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      if (controller.signal.aborted) return;

      try {
        const data = await fetchWrapper(`${backendUrl}/room/get/${roomId}`, {
          signal: controller.signal,
        });

        if (data.statusCode == 200) {
          setData(data.data);
        } else if (data.statusCode == 404) {
          // something
        } else {
          // something
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Fetch error:", err);
      }
    };

    fetchData(); // initial fetch
    const intervalId = setInterval(fetchData, 30 * 1000); //Update frequency

    return () => {
      controller.abort();
      clearInterval(intervalId);
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
            <div className="flex gap-2 items-center">
              <Button variant="destructive">
                <Trash2 />
              </Button>
              <p className="font-semibold">Close Room</p>
            </div>
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
          <h1 className="text-3xl font-semibold">Question Room {roomId}</h1>
          <Button
            variant="secondary"
            onClick={() => setDialog((prev: any) => ({ ...prev, open: true }))}
          >
            <Settings />
          </Button>
        </div>
        <Separator className="my-4" />
        {data ? (
          <Accordion type="single" collapsible className="w-full">
            {data.map((question: any) => {
              if (!question.active) return null;
              return (
                <AccordionItem value={question.createdAt}>
                  <AccordionTrigger>
                    {truncateString(question.content, 50)}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="bg-secondary rounded-md p-3">
                      <p className="text-lg">
                        <span className="font-semibold">Author:</span>{" "}
                        {dialog.anonymous ? "Anonymous" : question.author}
                      </p>
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
              No questions posted Yet ...
            </h4>
          </div>
        )}
      </div>
    </>
  );
};
