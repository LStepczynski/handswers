import React from "react";
import { useParams, useLocation } from "react-router-dom";

import { alertPopup } from "@/components/custom/alertPopup";
import { fetchWrapper } from "@/utils/fetchWrapper";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const useFetchRecentMessages = (
  setMessages: any,
  setFetchSettigns: any
) => {
  const params = useParams();
  const roomId = params.roomId;
  const questionId = params.questionId;

  const searchParams = new URLSearchParams(useLocation().search);
  const questionTimestamp = searchParams.get("timestamp");

  React.useEffect(() => {
    const page = 1;
    const fetchData = async () => {
      // Set start loading
      setFetchSettigns((prev: any) => ({ ...prev, initialLoad: true }));

      // Fetch most recent messages
      const data = await fetchWrapper(
        `${backendUrl}/room/message/history/${page}?roomId=${roomId}&questionId=${questionId}&timestamp=${questionTimestamp}`
      );

      if (data.statusCode == 200) {
        // Set messages in correct order
        setMessages(data.data.reverse());
      } else if (data.statusCode == 404 || data.statusCode == 400) {
        alertPopup({
          title: "Conversation not found.",
          description:
            "The question to which this conversation belongs was not found.",
          close: {
            visible: true,
            label: "Leave",
            func: () => (window.location.href = "/"),
          },
          action: { visible: false },
        });
      } else if (data.statusCode == 403) {
        alertPopup({
          title: "Error!",
          description: "You do not have permission to access this information.",
          close: {
            visible: true,
            label: "Leave",
            func: () => (window.location.href = "/"),
          },
          action: { visible: false },
        });
      } else {
        alertPopup({
          title: "Error!",
          description:
            "An error occured while fetching this conversation. Please try again later.",
          close: {
            visible: true,
            label: "Leave",
            func: () => (window.location.href = "/"),
          },
          action: { visible: false },
        });
      }

      // Set stop loading
      setFetchSettigns((prev: any) => ({ ...prev, initialLoad: false }));
    };

    fetchData();
  }, []);
};
