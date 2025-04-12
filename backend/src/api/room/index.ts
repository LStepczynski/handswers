import { SuccessResponse } from "@type/successResponse";
import {
  asyncHandler,
  authenticate,
  InternalError,
  isUuid,
  role,
  UserError,
} from "@utils/index";
import { Router, Request, Response } from "express";

import { v4 as uuid } from "uuid";
import { EntityCrud } from "@services/entityCrud";
import { aiClient, aiSettings } from "@services/aiProvider";

import questionRouter from "@api/room/question";
import messageRouter from "@api/room/message";

const router = Router();

router.get(
  "/verify/:roomCode",
  authenticate(),
  asyncHandler(async (req: Request, res: Response) => {
    const roomCode = req.params.roomCode;
    if (isNaN(Number(roomCode))) {
      throw new UserError("Invalid room number.");
    }
    if (Number(roomCode) < 0 || Number(roomCode) > 9999999) {
      throw new UserError("Invalid room number.");
    }

    const questionRoom = await EntityCrud.query({
      IndexName: "ActiveRoomCodeIndex",
      KeyConditionExpression: "roomCode = :id and active = :val",
      ExpressionAttributeValues: {
        ":id": { S: roomCode },
        ":val": { S: "true" },
      },
    });
    if (questionRoom.length == 0) {
      throw new UserError("Question room not found.", 404);
    }

    const response: SuccessResponse<Record<string, string>> = {
      status: "success",
      statusCode: 200,
      message: "Question room found.",
      data: { roomUuid: questionRoom[0].PK.slice(5) },
    };

    res.status(response.statusCode).send(response);
  })
);

// Verify if the user owns the room
router.get(
  "/get/:roomUuid/:page",
  authenticate(),
  role(["creator"]),
  asyncHandler(async (req: Request, res: Response) => {
    const roomUuid = req.params.roomUuid;
    const page = Number(req.params.page);
    if (isNaN(page) || page < 1) {
      throw new UserError("Invalid page value");
    }
    if (!isUuid(roomUuid)) {
      throw new UserError("Room not found", 404);
    }

    const questions = await EntityCrud.query(
      {
        KeyConditionExpression: "PK = :roomUuid AND begins_with(SK, :qPrefix)",
        ExpressionAttributeValues: {
          ":roomUuid": { S: `ROOM#${roomUuid}` },
          ":qPrefix": { S: "QUESTION#" },
        },
        ScanIndexForward: false,
      },
      page
    );

    const data = questions.map((question: any) => ({
      createdAtMs: question.SK.slice(9, 22),
      questionId: question.SK.slice(23),
      createdAt: question.createdAt,
      active: question.active == "true",
      roomId: question.PK.slice(5),
      author: question.author,
      content: question.content,
    }));

    const response: SuccessResponse<Record<string, any>[]> = {
      status: "success",
      statusCode: 200,
      message: "Question room found.",
      data: data,
    };

    res.status(response.statusCode).send(response);
  })
);

router.get(
  "/get/teacher/:teacherId/:page",
  authenticate(),
  role(["creator"]),
  asyncHandler(async (req: Request, res: Response) => {
    const teacherId = req.params.teacherId;
    const page = Number(req.params.page);
    if (isNaN(page) || page < 1) {
      throw new UserError("Invalid page value");
    }
    if (!isUuid(teacherId)) {
      throw new UserError("Invalid teacher ID.", 400);
    }

    const rooms = await EntityCrud.query(
      {
        IndexName: "TeacherActiveRooms",
        KeyConditionExpression: "teacherId = :id",
        ExpressionAttributeValues: {
          ":id": { S: teacherId },
        },
        ScanIndexForward: false,
      },
      page
    );

    const data = rooms.map((room: any) => ({
      roomId: room.PK.slice(5),
      createdAt: room.createdAt,
      active: room.active == "true",
      teacherId: room.teacherId,
      roomCode: room.roomCode,
    }));

    const response: SuccessResponse<Record<string, any>[]> = {
      status: "success",
      statusCode: 200,
      message: "Question room successfully queried.",
      data: data,
    };

    res.status(response.statusCode).send(response);
  })
);

router.post(
  "/create",
  authenticate(),
  role(["creator"]),
  asyncHandler(async (req: Request, res: Response) => {
    const activeRooms = await EntityCrud.query({
      IndexName: "TeacherActiveRooms",
      KeyConditionExpression: "teacherId = :id and active = :val",
      ExpressionAttributeValues: {
        ":id": { S: req.user.id },
        ":val": { S: "true" },
      },
    });
    if (activeRooms.length != 0) {
      throw new UserError("An active room already exists.", 403);
    }

    const roomCode = Math.floor(Math.random() * 10_000_000)
      .toString()
      .padStart(7, "0");

    const roomUuid = uuid();
    await EntityCrud.create({
      PK: `ROOM#${roomUuid}`,
      SK: `ROOM#${roomUuid}`,
      roomCode: `${roomCode}`,
      teacherId: req.user.id,
      active: "true",
    });

    const response: SuccessResponse<Record<string, any>> = {
      status: "success",
      statusCode: 200,
      message: "Question room created successfully.",
      data: {
        roomId: roomCode,
        roomUuid,
      },
    };

    res.status(response.statusCode).send(response);
  })
);

router.put(
  "/close/:roomId",
  authenticate(),
  role(["creator"]),
  asyncHandler(async (req: Request, res: Response) => {
    const roomUuid = req.params.roomId;
    if (!isUuid(roomUuid)) {
      throw new UserError("Room not found", 404);
    }

    const result = await EntityCrud.update(
      `ROOM#${roomUuid}`,
      `ROOM#${roomUuid}`,
      { active: "false" }
    );
    if (result == null) {
      throw new UserError("Room not found", 404);
    }

    const response: SuccessResponse<null> = {
      status: "success",
      statusCode: 200,
      message: "Question room closed successfully.",
      data: null,
    };

    res.status(response.statusCode).send(response);
  })
);

router.delete(
  "/delete/:roomUuid",
  authenticate(),
  role(["creator"]),
  asyncHandler(async (req: Request, res: Response) => {
    const roomUuid = req.params.roomUuid;
    if (!isUuid(roomUuid)) {
      throw new UserError("Room not found", 404);
    }

    // Fetch the room to verify it exists and belongs to the user
    const room = await EntityCrud.get(`ROOM#${roomUuid}`, `ROOM#${roomUuid}`);
    if (!room) {
      throw new UserError("Room not found", 404);
    }
    if (room.teacherId !== req.user.id) {
      throw new UserError("You are not authorized to delete this room", 403);
    }

    // Delete the room item
    await EntityCrud.delete(`ROOM#${roomUuid}`, `ROOM#${roomUuid}`);

    // Paginate and batch delete all questions and messages that belong to the room
    const limit = 100;
    let questions: Record<string, any>[] = [];

    do {
      questions = await EntityCrud.query(
        {
          KeyConditionExpression:
            "PK = :roomPK and begins_with(SK, :questionPrefix)",
          ExpressionAttributeValues: {
            ":roomPK": { S: `ROOM#${roomUuid}` },
            ":questionPrefix": { S: "QUESTION#" },
          },
          ProjectionExpression: "PK, SK",
        },
        1,
        limit
      );

      if (questions.length > 0) {
        // Prepare an array of keys to batch delete
        const keysToDelete = questions.map((q) => ({ PK: q.PK, SK: q.SK }));
        await EntityCrud.batchDelete(keysToDelete);
      }
    } while (questions.length === limit); // If full page, there might be more

    let messages: Record<string, any>[] = [];

    do {
      messages = await EntityCrud.query(
        {
          IndexName: "MessageRoomIdIndex",
          KeyConditionExpression: "roomId = :roomId",
          ExpressionAttributeValues: {
            ":roomId": { S: `${roomUuid}` },
          },
          ProjectionExpression: "PK, SK",
        },
        1,
        limit
      );

      if (messages.length > 0) {
        // Prepare an array of keys to batch delete
        const keysToDelete = messages.map((m) => ({ PK: m.PK, SK: m.SK }));
        await EntityCrud.batchDelete(keysToDelete);
      }
    } while (messages.length === limit);

    const response: SuccessResponse<null> = {
      status: "success",
      statusCode: 200,
      message:
        "Room and all associated questions and messages deleted successfully.",
      data: null,
    };

    res.status(response.statusCode).send(response);
  })
);

router.use("/question", questionRouter);
router.use("/message", messageRouter);

export default router;
