import React from "react";
import { useParams, useLocation } from "react-router-dom";

import { alertPopup } from "@/components/custom/alertPopup";
import { fetchWrapper } from "@/utils/fetchWrapper";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const useHandleMessages = (
  containerRef: React.RefObject<HTMLDivElement>,
  fetchSettings: Record<string, any>,
  setFetchSettigns: React.Dispatch<React.SetStateAction<Record<string, any>>>,
  messages: Record<string, any>[],
  setMessages: React.Dispatch<React.SetStateAction<Record<string, any>[]>>,
  textArea: string,
  setTextArea: React.Dispatch<React.SetStateAction<string>>
) => {
  const [ignoreAutoScroll, setIgnoreAutoScroll] = React.useState(false);

  const params = useParams();
  const roomId = params.roomId;
  const questionId = params.questionId;
  const searchParams = new URLSearchParams(useLocation().search);
  const questionTimestamp = searchParams.get("timestamp");

  const fetchSettingsRef = React.useRef(fetchSettings);

  React.useEffect(() => {
    fetchSettingsRef.current = fetchSettings;
  }, [fetchSettings]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop === 0 && fetchSettingsRef.current.canLoadMore) {
        loadMoreMessages();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [containerRef]);

  React.useEffect(() => {
    requestAnimationFrame(() => {
      if (containerRef.current) {
        if (ignoreAutoScroll) {
          setIgnoreAutoScroll(false);
        } else {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }
    });
  }, [messages]);

  const loadMoreMessages = async () => {
    const nextPage = fetchSettingsRef.current.page + 1;
    const itemsPerPage = 20;

    setFetchSettigns((prev: any) => ({ ...prev, loadingNew: true }));
    const data = await fetchWrapper(
      `${backendUrl}/room/message/history/${nextPage}?roomId=${roomId}&questionId=${questionId}&timestamp=${questionTimestamp}`
    );

    if (data.statusCode === 200) {
      const newMessages = data.data.reverse();
      const previousBoxHeight = containerRef.current?.scrollHeight || 0;
      setIgnoreAutoScroll(true);

      const canLoadMore = newMessages.length == itemsPerPage;
      setMessages((prev: any) => [...newMessages, ...prev]);
      setFetchSettigns((prev: any) => ({
        ...prev,
        canLoadMore: canLoadMore,
        page: nextPage,
        loadingNew: false,
      }));

      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop =
            containerRef.current.scrollHeight - previousBoxHeight;
        }
      });
    } else {
      alertPopup({
        title: "Error!",
        description:
          "An error occured while trying to load more messages. Please try again later.",
        close: {
          visible: true,
          label: "Reload",
          func: () => window.location.reload(),
        },
        action: { visible: false },
      });
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (textArea.trim() !== "") {
        onMessageSend();
      }
    }
  };

  const onMessageSend = async () => {
    const userMessage = textArea.trim();
    if (userMessage === "") return;

    setTextArea("");
    setFetchSettigns((prev: any) => ({ ...prev, awaitingResp: true }));

    setMessages((prev: any) => [
      ...prev,
      { author: "user", content: userMessage },
    ]);

    const data = await fetchWrapper(`${backendUrl}/room/message/create`, {
      method: "POST",
      body: JSON.stringify({
        roomId: roomId,
        questionId: questionId,
        questionTimestamp: questionTimestamp,
        message: userMessage,
      }),
    });

    setFetchSettigns((prev: any) => ({ ...prev, awaitingResp: false }));

    if (data.statusCode == 200) {
      setMessages((prev: any) => [
        ...prev,
        { author: "model", content: data.data },
      ]);
    } else {
      alertPopup({
        title: "Error!",
        description:
          "An error occured while processing your message. Please try again later.",
        close: {
          visible: true,
          label: "Reload",
          func: () => window.location.reload(),
        },
        action: { visible: false },
      });
    }
  };

  return [handleKeyDown, onMessageSend];
};
