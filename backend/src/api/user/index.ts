import { SchoolCrud } from "@services/schoolCrud";
import { School } from "@type/school";
import { SuccessResponse } from "@type/successResponse";
import { asyncHandler } from "@utils/asyncHandler";
import { authenticate, role } from "@utils/middleware";
import { UserError } from "@utils/statusError";
import { Router, Request, Response } from "express";

import { verifyUsersCreateBody } from "./utils/verifyUsersCreateBody";

import { v4 as uuid } from "uuid";
import { UserCrud } from "@services/userCrud";
import { verifyUsersGetBody } from "./utils/verifyUsersGetBody";
import { verifyUsersPutBody } from "./utils/verifyUsersPutBody";
import { verifyUsersDeleteBody } from "./utils/verifyUsersDeleteBody";

const router = Router();

router.get(
  "/get/schools",
  authenticate(),
  role(["admin"]),
  asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;

    if (page < 1)
      throw new UserError("Invalid request. Invalid page value", 400);

    const schoolResp = await SchoolCrud.getAll(page, 10);

    const response: SuccessResponse<Record<string, any>[]> = {
      status: "success",
      statusCode: 200,
      message: "school objects fetched successfuly",
      data: schoolResp,
    };

    res.status(response.statusCode).send(response);
  })
);

router.get(
  "/get/users/:schoolId",
  authenticate(),
  role(["admin"]),
  asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.params.schoolId;
    const type = req.query.userType || "student";
    const page = Number(req.query.page) || 1;

    if (page < 1)
      throw new UserError("Invalid request. Invalid page value", 400);

    const { valid, errors } = verifyUsersGetBody({ schoolId, userType: type });
    if (!valid) {
      throw new UserError("Invalid request. Missing or invalid fields", 400);
    }

    const userResp = await UserCrud.getBySchoolAndType(
      schoolId,
      type as any,
      page,
      25
    );

    const response: SuccessResponse<Record<string, any>[]> = {
      status: "success",
      statusCode: 200,
      message: "user objects fetched successfuly",
      data: userResp,
    };

    res.status(response.statusCode).send(response);
  })
);

router.put(
  "/edit/:id",
  authenticate(),
  role(["admin"]),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;
    const enabled = req.body.enabled;

    const { valid, errors } = verifyUsersPutBody({
      id: userId,
      enabled: enabled,
    });
    if (!valid) {
      throw new UserError("Invalid request. Missing or invalid fields", 400);
    }

    await UserCrud.update(userId, { enabled });

    const response: SuccessResponse<null> = {
      status: "success",
      statusCode: 200,
      message: "user object edited successfuly",
      data: null,
    };

    res.status(response.statusCode).send(response);
  })
);

router.delete(
  "/delete/:id",
  authenticate(),
  role(["admin"]),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;

    const { valid, errors } = verifyUsersDeleteBody({
      id: userId,
    });
    if (!valid) {
      throw new UserError("Invalid request. Missing or invalid fields", 400);
    }

    await UserCrud.delete(userId);

    const response: SuccessResponse<null> = {
      status: "success",
      statusCode: 200,
      message: "user object deleted successfuly",
      data: null,
    };

    res.status(response.statusCode).send(response);
  })
);

router.post(
  "/create/users",
  authenticate(),
  role(["admin"]),
  asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.body.schoolId;
    const emailList = req.body.userList;
    const type = req.body.userType;

    const { valid, errors } = verifyUsersCreateBody(req.body);
    if (!valid) {
      throw new UserError("Invalid request. Missing or invalid fields", 400);
    }

    const school = await SchoolCrud.getById(schoolId);
    if (school == null) {
      throw new UserError("Invalid request. School does not exist", 400);
    }

    const userList = emailList.map((email: string) => {
      return {
        id: uuid(),
        email: email,
        type: type,
        school: schoolId,
        enabled: true,
        accountExpiration: -1,
        roles: [],
      };
    });

    await UserCrud.createMany(userList);

    const response: SuccessResponse<null> = {
      status: "success",
      statusCode: 200,
      message: "user objects created successfuly",
      data: null,
    };

    res.status(response.statusCode).send(response);
  })
);

router.post(
  "/create/school",
  authenticate(),
  role(["admin"]),
  asyncHandler(async (req: Request, res: Response) => {
    const schoolName = req.body.schoolName;
    const schoolAddress = req.body.schoolAddress;

    if (schoolAddress == undefined || schoolName == undefined) {
      throw new UserError("Invalid request. Missing fields", 400);
    }

    const schoolObj = {
      id: uuid(),
      name: schoolName,
      address: schoolAddress,
    };

    const createRes = (await SchoolCrud.create(schoolObj)) as School;

    const response: SuccessResponse<School> = {
      status: "success",
      statusCode: 200,
      message: "school object created successfuly",
      data: createRes,
    };

    res.status(response.statusCode).send(response);
  })
);

export default router;
