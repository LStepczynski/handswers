import React from "react";
import { useParams } from "react-router-dom";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    label: "Question",
    link: "#",
  },
];

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const questionLenght = 300;

export const StudentViewRoom = () => {
  const [form, setForm] = React.useState({
    loading: false,
    question: "",
  });
  const [dialog, setDialog] = React.useState({
    open: false,
    title: "",
    description: "",
  });

  // Set breadcrumbs
  const { setBreadcrumbs } = useBreadcrumbs();
  React.useEffect(() => {
    setBreadcrumbs(breadcrumbs);
  }, []);

  const user = getUser();
  if (user == undefined) {
    window.location.href = "/";
    return null;
  }

  const roomId = useParams().roomId;

  const onFormChange = (event: any) => {
    const text = event.target.value;
    if (text.length < questionLenght + 1) {
      setForm((prev: any) => ({ ...prev, question: text }));
    }
  };

  const onSubmit = async () => {
    setForm((prev: any) => ({ ...prev, loading: true }));

    const data = await fetchWrapper(`${backendUrl}/room/question/create`, {
      method: "POST",
      body: JSON.stringify({
        roomId: roomId || "",
        question: form.question,
      }),
    });

    if (data.statusCode == 200) {
      window.location.href = `/chat/${roomId}/${data.data.id}?timestamp=${data.data.timestamp}`;
      setDialog({
        open: true,
        title: "Question Submited!",
        description:
          "Your question was successfully posted in the question room. Now wait for the teacher to answer your question.",
      });
      setForm((prev: any) => ({ ...prev, question: "" }));
    } else if (data.statusCode == 404) {
      setDialog({
        open: true,
        title: "Room does not exist.",
        description:
          "The question room you are trying to connect to does not exist. Verify the room code and check if your teacher closed the question room.",
      });
    } else {
      setDialog({
        open: true,
        title: "Error!",
        description:
          "There was an error while posting your question. Please try again later.",
      });
    }

    setForm((prev: any) => ({ ...prev, loading: false }));
  };

  return (
    <>
      <div className="grid justify-center mt-[15%] gap-6">
        <div>
          <h4 className="text-4xl sm:text-5xl font-semibold text-center mb-4">
            Ask Questions!
          </h4>
          <p className="text-lg sm:text-xl text-center">
            This question room was created to help you with your lesson.
          </p>
        </div>
        <div>
          <Input
            value={form.question}
            onChange={onFormChange}
            className={`h-14 ${
              form.question.length > questionLenght * 0.75 && "border-red-600"
            }`}
            placeholder="Why is the sky blue?"
          />
        </div>
        <div>
          <Button
            disabled={form.loading || form.question.length < 10}
            variant="secondary"
            className="w-full font-semibold h-12 text-md"
            onClick={onSubmit}
          >
            {form.loading ? <Spinner /> : "Submit"}
          </Button>
        </div>
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
              <AlertDialogCancel>Okay</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};
