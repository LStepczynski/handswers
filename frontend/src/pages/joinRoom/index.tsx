import React from "react";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

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

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const JoinRoom = () => {
  const [dialog, setDialog] = React.useState({
    open: false,
    title: "",
    description: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [roomCode, setRoomCode] = React.useState("");
  const [lastCode, setLastCode] = React.useState("");

  const onCodeSubmit = async () => {
    setLoading(true);

    let data;
    if (lastCode != roomCode) {
      data = await fetchWrapper(`${backendUrl}/room/verify/${roomCode}`);
    } else {
      data = { statusCode: 404 };
    }

    if (data.statusCode == 200) {
      window.location.href = `/room/${roomCode}`;
    } else if (data.statusCode == 404) {
      setDialog({
        open: true,
        title: "Invalid Code",
        description: "This room code is invalid. Please try another one.",
      });
      setRoomCode("");
    } else {
      setDialog({
        open: true,
        title: "Error!",
        description:
          "There was an error while joining the room. Please try again later.",
      });
      setRoomCode("");
    }

    setLastCode(roomCode);
    setLoading(false);
  };

  const onCodeChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      setRoomCode(value);
    }
  };

  return (
    <div className="grid justify-center gap-8 mt-[15%]">
      <div>
        <h1 className="text-4xl text-center font-semibold mb-2">Join a Room</h1>
        <h4 className="text-xl text center">
          Enter the room code provided by your teacher.
        </h4>
      </div>
      <div className="grid justify-center">
        <InputOTP
          maxLength={6}
          value={roomCode}
          onChange={(value) => onCodeChange(value)}
        >
          <InputOTPGroup>
            <InputOTPSlot className="w-16 h-16" index={0} />
            <InputOTPSlot className="w-16 h-16" index={1} />
            <InputOTPSlot className="w-16 h-16" index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot className="w-16 h-16" index={3} />
            <InputOTPSlot className="w-16 h-16" index={4} />
            <InputOTPSlot className="w-16 h-16" index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
      <div>
        <Button
          disabled={roomCode.length != 6 || loading}
          className="w-full font-bold"
          onClick={onCodeSubmit}
        >
          {loading ? <Spinner /> : "Join Room"}
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
  );
};
