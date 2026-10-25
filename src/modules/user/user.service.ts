import bcrypt from "bcryptjs";
import { Role } from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { RegisterUserPayload } from "./user.interface";

const registerUserIntoDB = async (payload: RegisterUserPayload) => {
    const {
        name,
        email,
        password,
        role = Role.CUSTOMER,
        profilePhoto,
        phone,
        address,
        shopName,
        shopAddress
    } = payload;

    // only customer & provider can self-register, admin is seeded
    if (role !== Role.CUSTOMER && role !== Role.PROVIDER) {
        throw new Error("Invalid role. You can register only as CUSTOMER or PROVIDER");
    }

    if (role === Role.PROVIDER && !shopName) {
        throw new Error("Shop name is required for provider registration");
    }

    const isUserExist = await prisma.user.findUnique({
        where: { email }
    });

    if (isUserExist) {
        throw new Error("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role,
            profile: {
                create: {
                    profilePhoto,
                    phone,
                    address,
                    // shop details are saved only for providers
                    shopName: role === Role.PROVIDER ? shopName : undefined,
                    shopAddress: role === Role.PROVIDER ? shopAddress : undefined
                }
            }
        },
        omit: {
            password: true
        },
        include: {
            profile: true
        }
    });

    return user;
};

export const userService = {
    registerUserIntoDB
};