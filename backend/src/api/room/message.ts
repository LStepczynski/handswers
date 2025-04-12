import { Router, Request, Response } from "express";

import {
  asyncHandler,
  authenticate,
  InternalError,
  isUuid,
  role,
  UserError,
} from "@utils/index";
import { SuccessResponse } from "@type/successResponse";

import { v4 as uuid } from "uuid";
import { EntityCrud } from "@services/entityCrud";
import { aiClient, aiSettings } from "@services/aiProvider";

const router = Router();

router.get(
  "/history/:page",
  authenticate(),
  asyncHandler(async (req: Request, res: Response) => {
    const roomUuid = req.query.roomId as string;
    const questionUuid = req.query.questionId as string;
    const questionTimestamp = req.query.timestamp as string;
    const page = Number(req.params.page);

    if (!isUuid(roomUuid)) {
      throw new UserError("Room not found", 404);
    }
    if (!isUuid(questionUuid)) {
      throw new UserError("Question not found.", 404);
    }
    if (isNaN(Number(questionTimestamp))) {
      throw new UserError("Invalid question timestamp.", 400);
    }
    if (isNaN(page) || page < 1) {
      throw new UserError("Invalid page parameter.", 400);
    }

    const question = await EntityCrud.get(
      `ROOM#${roomUuid}`,
      `QUESTION#${questionTimestamp}#${questionUuid}`
    );
    if (!question) {
      throw new UserError("Question not found.", 404);
    }
    if (question.author != req.user.email) {
      if (req.user.roles.includes("creator")) {
        const room = await EntityCrud.get(
          `ROOM#${roomUuid}`,
          `ROOM#${roomUuid}`
        );
        if (!room || room.teacherId != req.user.email) {
          throw new UserError("Access Denied", 403);
        }
      } else {
        throw new UserError("Access Denied", 403);
      }
    }

    const messages = await EntityCrud.query(
      {
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
        ExpressionAttributeValues: {
          ":pk": { S: `QUESTION#${questionUuid}` },
          ":prefix": { S: "MESSAGE#" },
        },
        ScanIndexForward: false,
      },
      page,
      20
    );

    const formatedMessages = messages.map((message: any) => ({
      author: message.author,
      content: message.content,
      createdAt: message.createdAt,
    }));

    const response: SuccessResponse<Record<string, any>[]> = {
      status: "success",
      statusCode: 200,
      message: "Messages fetched successfully.",
      data: formatedMessages,
    };

    res.status(response.statusCode).send(response);
  })
);

router.post(
  "/create",
  authenticate(),
  asyncHandler(async (req: Request, res: Response) => {
    const roomUuid = req.body.roomId;
    const questionUuid = req.body.questionId;
    const questionTimestamp = req.body.questionTimestamp;
    const message = req.body.message;

    if (!isUuid(roomUuid)) {
      throw new UserError("Room not found", 404);
    }
    if (!isUuid(questionUuid)) {
      throw new UserError("Question not found.", 404);
    }
    if (isNaN(Number(questionTimestamp))) {
      throw new UserError("Invalid question timestamp.", 400);
    }

    const messageLength = 400;

    if (
      typeof message != "string" ||
      message == "" ||
      message.length > messageLength
    ) {
      throw new UserError("Invalid message.", 400);
    }

    const questionRoom = await EntityCrud.get(
      `ROOM#${roomUuid}`,
      `ROOM#${roomUuid}`
    );
    if (questionRoom == null || questionRoom.active == "false") {
      throw new UserError("Question room not found.", 404);
    }

    const question = await EntityCrud.get(
      `ROOM#${roomUuid}`,
      `QUESTION#${questionTimestamp}#${questionUuid}`
    );
    if (question == null || question.active == "false") {
      throw new UserError("Question not found.", 404);
    }
    if (question.author != req.user.email) {
      throw new UserError("Invalid permission.", 403);
    }

    const previousMessages = await EntityCrud.query(
      {
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
        ExpressionAttributeValues: {
          ":pk": { S: `QUESTION#${questionUuid}` },
          ":prefix": { S: `MESSAGE#` },
        },
        ScanIndexForward: false,
      },
      1,
      16
    );

    const messageHistory = previousMessages.reverse().map((question: any) => ({
      role: question.author,
      parts: [{ text: question.content }],
    }));

    const aiResponse = await aiClient.models.generateContent({
      model: aiSettings.model,
      config: {
        temperature: aiSettings.temperature,
        maxOutputTokens: aiSettings.maxTokens,
        systemInstruction: aiSettings.systemPrompt,
      },
      contents: [
        {
          role: "user",
          parts: [{ text: `Main question: ${question.content}` }],
        },
        ...messageHistory,
        { role: "user", parts: [{ text: message }] },
      ],
    });
    if (aiResponse.text == undefined) {
      throw new InternalError("Error while generating response.", 500, [
        "messageCreate",
        "AI",
      ]);
    }

    const messageTimestamp = Date.now();
    await EntityCrud.create({
      PK: `QUESTION#${questionUuid}`,
      SK: `MESSAGE#${messageTimestamp}#${uuid()}`,
      content: message,
      author: "user",
      roomId: roomUuid,
      createdAt: messageTimestamp,
    });
    await EntityCrud.create({
      PK: `QUESTION#${questionUuid}`,
      SK: `MESSAGE#${messageTimestamp + 1}#${uuid()}`,
      content: aiResponse.text,
      author: "model",
      roomId: roomUuid,
      createdAt: messageTimestamp + 1,
    });

    const response: SuccessResponse<string> = {
      status: "success",
      statusCode: 200,
      message: "Message posted successfully.",
      data: aiResponse.text,
    };

    res.status(response.statusCode).send(response);
  })
);

export default router;
