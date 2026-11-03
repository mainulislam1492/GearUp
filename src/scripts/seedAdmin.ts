import bcrypt from "bcryptjs";
import { Role, UserStatus } from "../../generated/prisma/enums";
import config from "../config";
import { prisma } from "../lib/prisma";

const seedAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL as string;
        const adminPassword = process.env.ADMIN_PASSWORD as string;

        if (!adminEmail || !adminPassword) {
            throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
        }

        const isAdminExist = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        if (isAdminExist) {
            console.log("Admin already exists. Skipping seed.");
            return;
        }

        const hashedPassword = await bcrypt.hash(adminPassword, Number(config.bcrypt_salt_rounds));

        const admin = await prisma.user.create({
            data: {
                name: "GearUp Admin",
                email: adminEmail,
                password: hashedPassword,
                role: Role.ADMIN,
                status: UserStatus.ACTIVE,
                profile: {
                    create: {}
                }
            },
            omit: { password: true }
        });

        console.log("Admin created successfully:", admin.email);
    } catch (error) {
        console.error("Failed to seed admin:", error);
    } finally {
        await prisma.$disconnect();
    }
};

seedAdmin();