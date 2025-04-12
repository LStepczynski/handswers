import { Router, Request, Response } from "express";

import { asyncHandler, authenticate, isUuid, UserError } from "@utils/index";
import { SuccessResponse } from "@type/successResponse";

import { v4 as uuid } from "uuid";
import { EntityCrud } from "@services/entityCrud";

const router = Router();

router.post(
  "/create",
  authenticate(),
  asyncHandler(async (req: Request, res: Response) => {
    const roomUuid = req.body.roomId;
    const question = req.body.question;

    if (!isUuid(roomUuid)) {
      throw new UserError("Room not found", 404);
    }

    const questionLength = 400;

    if (
      typeof question != "string" ||
      question == "" ||
      question.length > questionLength
    ) {
      throw new UserError("Invalid question", 400);
    }

    const questionRoom = await EntityCrud.get(
      `ROOM#${roomUuid}`,
      `ROOM#${roomUuid}`
    );
    if (questionRoom == null || questionRoom.active != "true") {
      throw new UserError("Question room not found.", 404);
    }

    const timestamp = Date.now();
    const questionId = uuid();
    await EntityCrud.create({
      PK: `ROOM#${roomUuid}`,
      SK: `QUESTION#${timestamp}#${questionId}`,
      author: req.user.email,
      content: question,
      active: "true",
      needTeacher: "false",
      createdAt: timestamp,
    });

    const response: SuccessResponse<Record<string, any>> = {
      status: "success",
      statusCode: 200,
      message: "Question created successfully.",
      data: {
        id: questionId,
        timestamp: timestamp,
      },
    };

    res.status(response.statusCode).send(response);
  })
);

export default router;
