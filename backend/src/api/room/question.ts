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

router.put(
  "/request-help",
  authenticate(),
  asyncHandler(async (req: Request, res: Response) => {
    const roomUuid = req.body.roomId;
    const questionUuid = req.body.questionId;
    const questionTimestamp = req.body.timestamp;

    if (!isUuid(roomUuid)) {
      throw new UserError("Room not found", 404);
    }
    if (!isUuid(questionUuid)) {
      throw new UserError("Question not found.", 404);
    }
    if (isNaN(Number(questionTimestamp))) {
      throw new UserError("Invalid question timestamp.", 400);
    }

    // Fetch the room to verify it exists and belongs to the user
    const room = await EntityCrud.get(`ROOM#${roomUuid}`, `ROOM#${roomUuid}`);
    if (!room || room.active == "false") {
      throw new UserError("Room not found", 404);
    }

    // Fetch the question to verify it exists and belongs to the user
    const question = await EntityCrud.get(
      `ROOM#${roomUuid}`,
      `QUESTION#${questionTimestamp}#${questionUuid}`
    );
    if (!question || question.active == "false") {
      throw new UserError("Question not found", 404);
    }
    if (question.author !== req.user.email) {
      throw new UserError("You are not authorized to edit this question", 403);
    }
    if (question.needTeacher == "true") {
      throw new UserError("Already requested help", 409);
    }

    await EntityCrud.update(
      `ROOM#${roomUuid}`,
      `QUESTION#${questionTimestamp}#${questionUuid}`,
      { needTeacher: "true" }
    );

    const response: SuccessResponse<null> = {
      status: "success",
      statusCode: 200,
      message: "Requested help successfully.",
      data: null,
    };

    res.status(response.statusCode).send(response);
  })
);

router.put(
  "/close",
  authenticate(),
  asyncHandler(async (req: Request, res: Response) => {
    const roomUuid = req.body.roomId;
    const questionUuid = req.body.questionId;
    const questionTimestamp = req.body.timestamp;

    if (!isUuid(roomUuid)) {
      throw new UserError("Room not found", 404);
    }
    if (!isUuid(questionUuid)) {
      throw new UserError("Question not found.", 404);
    }
    if (isNaN(Number(questionTimestamp))) {
      throw new UserError("Invalid question timestamp.", 400);
    }

    // Fetch the room to verify it exists and belongs to the user
    const room = await EntityCrud.get(`ROOM#${roomUuid}`, `ROOM#${roomUuid}`);
    if (!room || room.active == "false") {
      throw new UserError("Room not found", 404);
    }

    // Fetch the question to verify it exists and belongs to the user
    const question = await EntityCrud.get(
      `ROOM#${roomUuid}`,
      `QUESTION#${questionTimestamp}#${questionUuid}`
    );
    if (!question || question.active == "false") {
      throw new UserError("Question not found", 404);
    }
    if (question.author !== req.user.email) {
      throw new UserError(
        "You are not authorized to delete this question",
        403
      );
    }

    await EntityCrud.update(
      `ROOM#${roomUuid}`,
      `QUESTION#${questionTimestamp}#${questionUuid}`,
      { active: "false" }
    );

    const response: SuccessResponse<null> = {
      status: "success",
      statusCode: 200,
      message: "Question closed successfully.",
      data: null,
    };

    res.status(response.statusCode).send(response);
  })
);

export default router;
