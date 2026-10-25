import bcrypt from "bcryptjs";
import { Role } from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { RegisterUserPayload, UpdateProfilePayload } from "./user.interface";

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

const getMyProfileFromDB = async (userId : string) => {
    const user = await prisma.user.findUniqueOrThrow({
        where : {id : userId},
        omit : {
            password : true
        },
        include : {
            profile : true
        }
    });

    return user;
}


const updateMyProfileInDB = async (userId: string, role: Role, payload: UpdateProfilePayload) => {
    const { name, profilePhoto, phone, address, shopName, shopAddress } = payload;

    const isProvider = role === Role.PROVIDER;

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            name,
            profile: {
                upsert: {
                    create: {
                        profilePhoto,
                        phone,
                        address,
                        shopName: isProvider ? shopName : undefined,
                        shopAddress: isProvider ? shopAddress : undefined
                    },
                    update: {
                        profilePhoto,
                        phone,
                        address,
                        // only providers can change shop details
                        shopName: isProvider ? shopName : undefined,
                        shopAddress: isProvider ? shopAddress : undefined
                    }
                }
            }
        },
        omit: { password: true },
        include: { profile: true }
    });

    return updatedUser;
};
    

export const userService = {
    registerUserIntoDB,
    getMyProfileFromDB,
    updateMyProfileInDB
};