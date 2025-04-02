import { SchoolCrud } from "@services/schoolCrud";
import { School } from "@type/school";
import { SuccessResponse } from "@type/successResponse";
import { asyncHandler } from "@utils/asyncHandler";
import { authenticate, role } from "@utils/middleware";
import { UserError } from "@utils/statusError";
import { Router, Request, Response } from "express";

import { v4 as uuid } from "uuid";
import { UserCrud } from "@services/userCrud";
import { EntityCrud } from "@services/entityCrud";

const router = Router();

router.get(
  "/verify/:roomId",
  authenticate(),
  asyncHandler(async (req: Request, res: Response) => {
    const roomId = req.params.roomId;
    if (isNaN(Number(roomId))) {
      throw new UserError("Invalid room number.");
    }
    if (Number(roomId) < 0 || Number(roomId) > 999999) {
      throw new UserError("Invalid room number.");
    }

    const questionRoom = await EntityCrud.get(
      `ROOM#${roomId}`,
      `ROOM#${roomId}`
    );
    if (questionRoom == null || !questionRoom.active) {
      throw new UserError("Question room not found.", 404);
    }

    const response: SuccessResponse<null> = {
      status: "success",
      statusCode: 200,
      message: "Question room found.",
      data: null,
    };

    res.status(response.statusCode).send(response);
  })
);

router.post(
  "/create",
  authenticate(),
  role(["creator"]),
  asyncHandler(async (req: Request, res: Response) => {
    const roomId = Math.floor(Math.random() * 1000000);
    await EntityCrud.create({
      PK: `ROOM#${roomId}`,
      SK: `ROOM#${roomId}`,
      teacherId: req.user.id,
      active: true,
    });

    const response: SuccessResponse<number> = {
      status: "success",
      statusCode: 200,
      message: "Question room created successfully.",
      data: roomId,
    };

    res.status(response.statusCode).send(response);
  })
);

// Verify if the user owns the room
router.get(
  "/get/:roomId",
  authenticate(),
  role(["creator"]),
  asyncHandler(async (req: Request, res: Response) => {
    const roomId = req.params.roomId;
    if (isNaN(Number(roomId))) {
      throw new UserError("Question room not found.", 404);
    }
    if (Number(roomId) < 0 || Number(roomId) > 999999) {
      throw new UserError("Question room not found.", 404);
    }

    const questions = await EntityCrud.query({
      KeyConditionExpression: "PK = :roomId AND begins_with(SK, :qPrefix)",
      ExpressionAttributeValues: {
        ":roomId": { S: `ROOM#${roomId}` },
        ":qPrefix": { S: "QUESTION#" },
      },
      ScanIndexForward: false,
    });

    const response: SuccessResponse<Record<string, any>[]> = {
      status: "success",
      statusCode: 200,
      message: "Question room found.",
      data: questions,
    };

    res.status(response.statusCode).send(response);
  })
);

router.post(
  "/question/create",
  authenticate(),
  asyncHandler(async (req: Request, res: Response) => {
    const roomId = req.body.roomId;
    const question = req.body.question;
    console.log(roomId);
    const questionLenght = 400;

    if (typeof roomId != "number") {
      throw new UserError("Question room not found.", 404);
    }
    if (roomId < 0 || roomId > 999999) {
      throw new UserError("Question room not found.", 404);
    }
    if (
      typeof question != "string" ||
      question == "" ||
      question.length > questionLenght
    ) {
      throw new UserError("Invalid question", 400);
    }

    const questionRoom = await EntityCrud.get(
      `ROOM#${roomId}`,
      `ROOM#${roomId}`
    );
    if (questionRoom == null || !questionRoom.active) {
      throw new UserError("Question room not found.", 404);
    }

    const timestamp = Date.now();
    const questionId = uuid();
    await EntityCrud.create({
      PK: `ROOM#${roomId}`,
      SK: `QUESTION#${timestamp}#${questionId}`,
      author: req.user.email,
      content: question,
      active: true,
    });

    const response: SuccessResponse<number> = {
      status: "success",
      statusCode: 200,
      message: "Question created successfully.",
      data: roomId,
    };

    res.status(response.statusCode).send(response);
  })
);

export default router;
