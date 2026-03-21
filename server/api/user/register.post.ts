import { prisma } from "~~/db/prismaClient";
import {
  registrationSchema,
  type RegistrationSchema,
} from "#shared/schemas/registrationSchema";
import type { SafeParseReturnType } from "zod";
import { logEventAction } from "#server/utils/logger";
import createNotification from "#server/utils/createNotification";
import { registerMail } from "#server/mail/mail";
import * as argon2 from "argon2";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parsedBody = registrationSchema.safeParse(body);

  if (parsedBody.success === false) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "form-invalid",
    });
  }

  const runChecks = Promise.all<void>([
    checkUniqueEmail(parsedBody),
    checkUniqueUsername(parsedBody),
    checkFreePc(parsedBody),
  ]);

  try {
    await runChecks;
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: error,
    });
  }

  const hashedPassword = await argon2.hash(parsedBody.data.password, {
    type: argon2.argon2id,
  });

  const freeSeat = await prisma.seat.findFirst({
    where: {
      type: "Registration",
      owner: null,
    },
  });

  if (!freeSeat) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "no-seats-left",
    });
  }

  const [newUserError, newUser] = await catchError(
    prisma.user.create({
      data: {
        email: parsedBody.data.email,
        username: parsedBody.data.username,
        fullname: parsedBody.data.fullname,
        class: {
          connect: {
            id: parsedBody.data.classId,
          },
        },
        passwordHash: hashedPassword,
        ownPc: parsedBody.data.ownPc,
        ethernetPort: parsedBody.data.ethernetPort,
        ownChair: parsedBody.data.ownChair,
        seat: {
          connect: {
            id: freeSeat.id,
          },
        },
      },
    }),
  );

  if (newUserError) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "seat-taken-try-again",
    });
  }

  const tokenLink = `${useRuntimeConfig().public.siteName}/verifymail?token=${newUser.emailToken}`;
  registerMail(newUser.email, tokenLink);

  logEventAction(event, {
    category: "REGISTRATION",
    severity: "INFO",
    message: `User "${newUser.username}" registered.`,
  });

  return {
    notification: createNotification("SUCCESS", {
      message: "Felhasználó sikeresen létrehozva!",
    }),
  };
});

type ParsedBody = SafeParseReturnType<RegistrationSchema, RegistrationSchema>;

function checkUniqueEmail(parsedBody: ParsedBody) {
  return new Promise<void>(async (resolve, reject) => {
    if (parsedBody.success === false) return reject("form-invalid");

    const userEmail = await prisma.user.findUnique({
      where: {
        email: parsedBody.data.email,
      },
    });

    if (userEmail !== null) {
      return reject("email-already-exists");
    }

    resolve();
  });
}

function checkUniqueUsername(parsedBody: ParsedBody) {
  return new Promise<void>(async (resolve, reject) => {
    if (parsedBody.success === false) return reject("form-invalid");

    const userUsername = await prisma.user.findUnique({
      where: {
        username: parsedBody.data.username,
      },
    });

    if (userUsername !== null) {
      return reject("username-already-exists");
    }

    resolve();
  });
}

function checkFreePc(parsedBody: ParsedBody) {
  return new Promise<void>(async (resolve, reject) => {
    if (parsedBody.success === false) return reject("form-invalid");
    if (parsedBody.data.ownPc === true) return resolve();

    const takenPc = await prisma.user.count({
      where: {
        ownPc: false,
      },
    });

    const allPc = await prisma.option.findUnique({
      where: {
        name: "schoolPC",
      },
    });

    if (allPc == null || Number(allPc.value) <= takenPc) {
      return reject("seat-taken");
    }

    resolve();
  });
}
