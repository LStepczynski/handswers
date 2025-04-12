import React from "react";
import { useLocation } from "react-router-dom";

import { Send, Settings, Info, LogOut } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/custom/spinner";
import { useFetchRecentMessages } from "./hooks/useFetchRecentMessages";
import { useMemorizeMessages } from "./hooks/useMemorizeMessages";
import { useHandleMessages } from "./hooks/useHandleMessages";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mainDivWidthClasses =
  "w-[95vw] sm:w-[600px] md:w-[700px] lg:w-[950px] xl:w-[1200px]";
const mainDivMaxWidthClasses =
  "max-w-[92vw] sm:max-w-[570px] md:max-w-[670px] lg:max-w-[900px] xl:max-w-[1100px]";

export const ChatRoom = () => {
  const [messages, setMessages] = React.useState<any[]>([]);
  const [fetchSettings, setFetchSettigns] = React.useState<Record<string, any>>(
    {
      loadingNew: false,
      initialLoad: false,
      awaitingResp: false,
      canLoadMore: true,
      page: 1,
    }
  );
  const [textArea, setTextArea] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const searchParams = new URLSearchParams(useLocation().search);
  const teacherView = searchParams.get("isTeacher");

  useFetchRecentMessages(setMessages, setFetchSettigns);

  const [handleKeyDown, onMessageSend] = useHandleMessages(
    containerRef,
    fetchSettings,
    setFetchSettigns,
    messages,
    setMessages,
    textArea,
    setTextArea
  );

  // Memoize the rendered messages for efficiency
  const renderedMessages = useMemorizeMessages(messages);

  return (
    <>
      <div
        className={`${mainDivWidthClasses} px-3 z-0 h-[calc(100vh-2.5rem)] absolute bottom-0 left-[50%] translate-x-[-50%] flex flex-col justify-end`}
      >
        <div className="w-full h-full overflow-y-auto mx-4" ref={containerRef}>
          <div className={`${mainDivMaxWidthClasses} my-20`}>
            {fetchSettings.initialLoad ? (
              <div className="absolute top-[30%] left-[50%] translate-x-[-50%]">
                <Spinner className="h-12 w-12" />
              </div>
            ) : (
              <div>
                <div className="w-full h-20 grid items-center justify-center">
                  {fetchSettings.loadingNew && <Spinner className="h-8 w-8" />}
                </div>
                {messages.length == 0 ? <WelcomeMessage /> : renderedMessages}
                {fetchSettings.awaitingResp && (
                  <div className="w-16 h-16 mt-16 ml-8 bg-primary rounded-full grid justify-center items-center">
                    <Spinner className="w-7 h-7" color="black" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {teacherView != "true" && (
          <div className="flex gap-1 my-3 relative">
            <div className="absolute top-0 left-0 translate-y-[-110%]">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="outline" className="w-10 h-10">
                    <Settings />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40">
                  <DropdownMenuLabel>Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Info />
                    <span>Request Teacher</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LogOut color="red" />
                    <span>Leave Chatroom</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Textarea
              rows={1}
              onKeyDown={handleKeyDown}
              value={textArea}
              maxLength={400}
              onChange={(e) => setTextArea(e.target.value)}
            />
            <div
              onClick={onMessageSend}
              className={`${
                textArea.trim() == "" ? "bg-muted-foreground" : "bg-white"
              } flex justify-center items-center rounded-md`}
            >
              <Send className="w-6 h-6 mx-3" color="black" />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const WelcomeMessage = () => {
  return (
    <div className="mt-[20vh]">
      <h4 className="w-full text-center font-bold text-3xl">
        What can I help you with?
      </h4>
      <p className="w-full text-center text-xl">
        Ask any questions about your problem down below.
      </p>
    </div>
  );
};
