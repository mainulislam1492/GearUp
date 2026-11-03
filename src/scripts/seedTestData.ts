import bcrypt from "bcryptjs";
import { Role } from "../../generated/prisma/enums";
import config from "../config";
import { prisma } from "../lib/prisma";

// Creates test data: 1 category, 1 provider, 1 customer, 1 gear item.
// Safe to run more than once (it will not create duplicates).
const seedTestData = async () => {
    try {
        const hashedPassword = await bcrypt.hash("123456", Number(config.bcrypt_salt_rounds));

        const category = await prisma.category.upsert({
            where: { slug: "cycling" },
            update: {},
            create: {
                name: "Cycling",
                slug: "cycling",
                description: "Bikes and cycling gear"
            }
        });

        const provider = await prisma.user.upsert({
            where: { email: "provider@gearup.com" },
            update: {},
            create: {
                name: "Rahim Sports",
                email: "provider@gearup.com",
                password: hashedPassword,
                role: Role.PROVIDER,
                profile: {
                    create: {
                        phone: "01700000000",
                        address: "GEC Circle, Chattogram",
                        shopName: "Rahim Outdoor Gear",
                        shopAddress: "GEC Circle, Chattogram"
                    }
                }
            }
        });

        const customer = await prisma.user.upsert({
            where: { email: "customer@gearup.com" },
            update: {},
            create: {
                name: "Karim Ahmed",
                email: "customer@gearup.com",
                password: hashedPassword,
                role: Role.CUSTOMER,
                profile: {
                    create: {
                        phone: "01811111111",
                        address: "Pahartali, Chattogram"
                    }
                }
            }
        });

        const existingGear = await prisma.gearItem.findFirst({
            where: { providerId: provider.id, name: "Mountain Bike Pro" }
        });

        const gear =
            existingGear ??
            (await prisma.gearItem.create({
                data: {
                    providerId: provider.id,
                    categoryId: category.id,
                    name: "Mountain Bike Pro",
                    brand: "Giant",
                    description: "21-speed mountain bike, suitable for trails",
                    specifications: { size: "L", weight: "13kg" },
                    images: ["https://example.com/bike.jpg"],
                    pricePerDay: 500,
                    securityDeposit: 2000,
                    stockQuantity: 5
                }
            }));

        console.log("Test data ready");
        console.log("Category id :", category.id);
        console.log("Provider    :", provider.email, "/ 123456");
        console.log("Customer    :", customer.email, "/ 123456");
        console.log("Gear id     :", gear.id);
    } catch (error) {
        console.error("Failed to seed test data:", error);
    } finally {
        await prisma.$disconnect();
    }
};

seedTestData();