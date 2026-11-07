import { createRequire } from "module"; const require = createRequire(import.meta.url);
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/app.ts
import cookieParser from "cookie-parser";
import cors from "cors";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });
var config_default = {
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  app_url: process.env.APP_URL,
  server_url: process.env.SERVER_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  stripe_product_price_id: process.env.STRIPE_PRODUCT_PRICE_ID,
  stripe_secret_key: process.env.STRIPE_SECRET_KEY,
  stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
  sslcommerz_store_id: process.env.SSLCOMMERZ_STORE_ID,
  sslcommerz_store_password: process.env.SSLCOMMERZ_STORE_PASSWORD,
  sslcommerz_is_live: process.env.SSLCOMMERZ_IS_LIVE
};

// src/app.ts
import express from "express";

// src/modules/user/user.route.ts
import { Router } from "express";

// src/modules/user/user.controller.ts
import httpStatus from "http-status";

// src/utils/catchAsync.ts
var catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// src/utils/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    statusCode: data.statusCode,
    message: data.message,
    data: data.data,
    meta: data.meta
  });
};

// src/modules/user/user.service.ts
import bcrypt from "bcryptjs";

// generated/prisma/enums.ts
var Role = {
  CUSTOMER: "CUSTOMER",
  PROVIDER: "PROVIDER",
  ADMIN: "ADMIN"
};
var UserStatus = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED"
};
var GearStatus = {
  ACTIVE: "ACTIVE",
  HIDDEN: "HIDDEN"
};
var RentalStatus = {
  PLACED: "PLACED",
  CONFIRMED: "CONFIRMED",
  PAID: "PAID",
  PICKED_UP: "PICKED_UP",
  RETURNED: "RETURNED",
  CANCELLED: "CANCELLED"
};
var PaymentProvider = {
  STRIPE: "STRIPE",
  SSLCOMMERZ: "SSLCOMMERZ"
};
var PaymentStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED"
};

// src/lib/prisma.ts
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

// generated/prisma/client.ts
import * as path2 from "path";
import { fileURLToPath } from "url";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.10.1",
  "engineVersion": "d1b3f377ca835d73fd50954a5e22128b9ebdd6b8",
  "activeProvider": "postgresql",
  "inlineSchema": 'model Category {\n  id          String   @id @default(cuid())\n  name        String   @unique\n  slug        String   @unique\n  description String?\n  imageUrl    String?\n  createdAt   DateTime @default(now())\n  updatedAt   DateTime @updatedAt\n\n  gearItems GearItem[]\n\n  @@map("categories")\n}\n\nenum Role {\n  CUSTOMER\n  PROVIDER\n  ADMIN\n}\n\nenum UserStatus {\n  ACTIVE\n  SUSPENDED\n}\n\nenum GearStatus {\n  ACTIVE\n  HIDDEN\n}\n\nenum RentalStatus {\n  PLACED\n  CONFIRMED\n  PAID\n  PICKED_UP\n  RETURNED\n  CANCELLED\n}\n\nenum PaymentProvider {\n  STRIPE\n  SSLCOMMERZ\n}\n\nenum PaymentStatus {\n  PENDING\n  COMPLETED\n  FAILED\n}\n\nmodel GearItem {\n  id              String     @id @default(cuid())\n  providerId      String\n  categoryId      String\n  name            String\n  brand           String\n  description     String\n  specifications  Json? // size":"L", "weight": "12kg" \n  images          String[]\n  pricePerDay     Decimal    @db.Decimal(10, 2)\n  securityDeposit Decimal?   @db.Decimal(10, 2)\n  stockQuantity   Int        @default(1)\n  isAvailable     Boolean    @default(true)\n  status          GearStatus @default(ACTIVE)\n  createdAt       DateTime   @default(now())\n  updatedAt       DateTime   @updatedAt\n\n  provider    User         @relation("ProviderGear", fields: [providerId], references: [id], onDelete: Cascade)\n  category    Category     @relation(fields: [categoryId], references: [id])\n  rentalItems RentalItem[]\n  reviews     Review[]\n\n  @@index([categoryId])\n  @@index([providerId])\n  @@index([brand])\n  @@index([pricePerDay])\n  @@map("gear_items")\n}\n\nmodel Payment {\n  id              String          @id @default(cuid())\n  transactionId   String          @unique\n  rentalOrderId   String\n  customerId      String\n  amount          Decimal         @db.Decimal(10, 2)\n  currency        String          @default("BDT")\n  method          String?\n  provider        PaymentProvider\n  status          PaymentStatus   @default(PENDING)\n  gatewayResponse Json?\n  paidAt          DateTime?\n  createdAt       DateTime        @default(now())\n  updatedAt       DateTime        @updatedAt\n\n  rentalOrder RentalOrder @relation(fields: [rentalOrderId], references: [id])\n  customer    User        @relation(fields: [customerId], references: [id])\n\n  @@index([rentalOrderId])\n  @@index([customerId])\n  @@index([status])\n  @@map("payments")\n}\n\nmodel Profile {\n  id           String   @id @default(cuid())\n  userId       String   @unique\n  profilePhoto String?\n  phone        String?\n  address      String?\n  shopName     String?\n  shopAddress  String?\n  createdAt    DateTime @default(now())\n  updatedAt    DateTime @updatedAt\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@map("profiles")\n}\n\nmodel RentalItem {\n  id            String  @id @default(cuid())\n  rentalOrderId String\n  gearItemId    String\n  quantity      Int     @default(1)\n  pricePerDay   Decimal @db.Decimal(10, 2)\n  subtotal      Decimal @db.Decimal(10, 2)\n\n  rentalOrder RentalOrder @relation(fields: [rentalOrderId], references: [id], onDelete: Cascade)\n  gearItem    GearItem    @relation(fields: [gearItemId], references: [id])\n\n  @@index([rentalOrderId])\n  @@index([gearItemId])\n  @@map("rental_items")\n}\n\nmodel RentalOrder {\n  id          String       @id @default(cuid())\n  customerId  String\n  providerId  String\n  startDate   DateTime\n  endDate     DateTime\n  totalDays   Int\n  totalAmount Decimal      @db.Decimal(10, 2)\n  status      RentalStatus @default(PLACED)\n  notes       String?\n  createdAt   DateTime     @default(now())\n  updatedAt   DateTime     @updatedAt\n\n  customer User         @relation("CustomerOrders", fields: [customerId], references: [id])\n  provider User         @relation("ProviderOrders", fields: [providerId], references: [id])\n  items    RentalItem[]\n  payments Payment[]\n  reviews  Review[]\n\n  @@index([customerId])\n  @@index([providerId])\n  @@index([status])\n  @@map("rental_orders")\n}\n\nmodel Review {\n  id            String   @id @default(cuid())\n  customerId    String\n  gearItemId    String\n  rentalOrderId String\n  rating        Int\n  comment       String?\n  createdAt     DateTime @default(now())\n  updatedAt     DateTime @updatedAt\n\n  customer    User        @relation(fields: [customerId], references: [id], onDelete: Cascade)\n  gearItem    GearItem    @relation(fields: [gearItemId], references: [id], onDelete: Cascade)\n  rentalOrder RentalOrder @relation(fields: [rentalOrderId], references: [id])\n\n  @@unique([customerId, gearItemId, rentalOrderId]) // one review per item per order\n  @@index([gearItemId])\n  @@map("reviews")\n}\n\n// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Get a free hosted Postgres database in seconds: `npx create-db`\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel User {\n  id       String     @id @default(cuid())\n  name     String\n  email    String     @unique\n  password String\n  role     Role       @default(CUSTOMER)\n  status   UserStatus @default(ACTIVE)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  gearItems      GearItem[]    @relation("ProviderGear")\n  customerOrders RentalOrder[] @relation("CustomerOrders")\n  providerOrders RentalOrder[] @relation("ProviderOrders")\n  payments       Payment[]\n  reviews        Review[]\n\n  profile Profile?\n\n  @@index([role, status])\n  @@map("users")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"imageUrl","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"gearItems","kind":"object","type":"GearItem","relationName":"CategoryToGearItem"}],"dbName":"categories","schema":null},"GearItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"brand","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"specifications","kind":"scalar","type":"Json"},{"name":"images","kind":"scalar","type":"String"},{"name":"pricePerDay","kind":"scalar","type":"Decimal"},{"name":"securityDeposit","kind":"scalar","type":"Decimal"},{"name":"stockQuantity","kind":"scalar","type":"Int"},{"name":"isAvailable","kind":"scalar","type":"Boolean"},{"name":"status","kind":"enum","type":"GearStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"provider","kind":"object","type":"User","relationName":"ProviderGear"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToGearItem"},{"name":"rentalItems","kind":"object","type":"RentalItem","relationName":"GearItemToRentalItem"},{"name":"reviews","kind":"object","type":"Review","relationName":"GearItemToReview"}],"dbName":"gear_items","schema":null},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"transactionId","kind":"scalar","type":"String"},{"name":"rentalOrderId","kind":"scalar","type":"String"},{"name":"customerId","kind":"scalar","type":"String"},{"name":"amount","kind":"scalar","type":"Decimal"},{"name":"currency","kind":"scalar","type":"String"},{"name":"method","kind":"scalar","type":"String"},{"name":"provider","kind":"enum","type":"PaymentProvider"},{"name":"status","kind":"enum","type":"PaymentStatus"},{"name":"gatewayResponse","kind":"scalar","type":"Json"},{"name":"paidAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"rentalOrder","kind":"object","type":"RentalOrder","relationName":"PaymentToRentalOrder"},{"name":"customer","kind":"object","type":"User","relationName":"PaymentToUser"}],"dbName":"payments","schema":null},"Profile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"profilePhoto","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"shopName","kind":"scalar","type":"String"},{"name":"shopAddress","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"ProfileToUser"}],"dbName":"profiles","schema":null},"RentalItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"rentalOrderId","kind":"scalar","type":"String"},{"name":"gearItemId","kind":"scalar","type":"String"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"pricePerDay","kind":"scalar","type":"Decimal"},{"name":"subtotal","kind":"scalar","type":"Decimal"},{"name":"rentalOrder","kind":"object","type":"RentalOrder","relationName":"RentalItemToRentalOrder"},{"name":"gearItem","kind":"object","type":"GearItem","relationName":"GearItemToRentalItem"}],"dbName":"rental_items","schema":null},"RentalOrder":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"customerId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"startDate","kind":"scalar","type":"DateTime"},{"name":"endDate","kind":"scalar","type":"DateTime"},{"name":"totalDays","kind":"scalar","type":"Int"},{"name":"totalAmount","kind":"scalar","type":"Decimal"},{"name":"status","kind":"enum","type":"RentalStatus"},{"name":"notes","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"customer","kind":"object","type":"User","relationName":"CustomerOrders"},{"name":"provider","kind":"object","type":"User","relationName":"ProviderOrders"},{"name":"items","kind":"object","type":"RentalItem","relationName":"RentalItemToRentalOrder"},{"name":"payments","kind":"object","type":"Payment","relationName":"PaymentToRentalOrder"},{"name":"reviews","kind":"object","type":"Review","relationName":"RentalOrderToReview"}],"dbName":"rental_orders","schema":null},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"customerId","kind":"scalar","type":"String"},{"name":"gearItemId","kind":"scalar","type":"String"},{"name":"rentalOrderId","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"customer","kind":"object","type":"User","relationName":"ReviewToUser"},{"name":"gearItem","kind":"object","type":"GearItem","relationName":"GearItemToReview"},{"name":"rentalOrder","kind":"object","type":"RentalOrder","relationName":"RentalOrderToReview"}],"dbName":"reviews","schema":null},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"Role"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"gearItems","kind":"object","type":"GearItem","relationName":"ProviderGear"},{"name":"customerOrders","kind":"object","type":"RentalOrder","relationName":"CustomerOrders"},{"name":"providerOrders","kind":"object","type":"RentalOrder","relationName":"ProviderOrders"},{"name":"payments","kind":"object","type":"Payment","relationName":"PaymentToUser"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToUser"},{"name":"profile","kind":"object","type":"Profile","relationName":"ProfileToUser"}],"dbName":"users","schema":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","gearItems","customer","provider","rentalOrder","gearItem","items","payments","reviews","_count","customerOrders","providerOrders","user","profile","category","rentalItems","Category.findUnique","Category.findUniqueOrThrow","Category.findFirst","Category.findFirstOrThrow","Category.findMany","data","Category.createOne","Category.createMany","Category.createManyAndReturn","Category.updateOne","Category.updateMany","Category.updateManyAndReturn","create","update","Category.upsertOne","Category.deleteOne","Category.deleteMany","having","_min","_max","Category.groupBy","Category.aggregate","GearItem.findUnique","GearItem.findUniqueOrThrow","GearItem.findFirst","GearItem.findFirstOrThrow","GearItem.findMany","GearItem.createOne","GearItem.createMany","GearItem.createManyAndReturn","GearItem.updateOne","GearItem.updateMany","GearItem.updateManyAndReturn","GearItem.upsertOne","GearItem.deleteOne","GearItem.deleteMany","_avg","_sum","GearItem.groupBy","GearItem.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","Payment.groupBy","Payment.aggregate","Profile.findUnique","Profile.findUniqueOrThrow","Profile.findFirst","Profile.findFirstOrThrow","Profile.findMany","Profile.createOne","Profile.createMany","Profile.createManyAndReturn","Profile.updateOne","Profile.updateMany","Profile.updateManyAndReturn","Profile.upsertOne","Profile.deleteOne","Profile.deleteMany","Profile.groupBy","Profile.aggregate","RentalItem.findUnique","RentalItem.findUniqueOrThrow","RentalItem.findFirst","RentalItem.findFirstOrThrow","RentalItem.findMany","RentalItem.createOne","RentalItem.createMany","RentalItem.createManyAndReturn","RentalItem.updateOne","RentalItem.updateMany","RentalItem.updateManyAndReturn","RentalItem.upsertOne","RentalItem.deleteOne","RentalItem.deleteMany","RentalItem.groupBy","RentalItem.aggregate","RentalOrder.findUnique","RentalOrder.findUniqueOrThrow","RentalOrder.findFirst","RentalOrder.findFirstOrThrow","RentalOrder.findMany","RentalOrder.createOne","RentalOrder.createMany","RentalOrder.createManyAndReturn","RentalOrder.updateOne","RentalOrder.updateMany","RentalOrder.updateManyAndReturn","RentalOrder.upsertOne","RentalOrder.deleteOne","RentalOrder.deleteMany","RentalOrder.groupBy","RentalOrder.aggregate","Review.findUnique","Review.findUniqueOrThrow","Review.findFirst","Review.findFirstOrThrow","Review.findMany","Review.createOne","Review.createMany","Review.createManyAndReturn","Review.updateOne","Review.updateMany","Review.updateManyAndReturn","Review.upsertOne","Review.deleteOne","Review.deleteMany","Review.groupBy","Review.aggregate","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","User.upsertOne","User.deleteOne","User.deleteMany","User.groupBy","User.aggregate","AND","OR","NOT","id","name","email","password","Role","role","UserStatus","status","createdAt","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","every","some","none","customerId","gearItemId","rentalOrderId","rating","comment","providerId","startDate","endDate","totalDays","totalAmount","RentalStatus","notes","quantity","pricePerDay","subtotal","userId","profilePhoto","phone","address","shopName","shopAddress","transactionId","amount","currency","method","PaymentProvider","PaymentStatus","gatewayResponse","paidAt","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","categoryId","brand","description","specifications","images","securityDeposit","stockQuantity","isAvailable","GearStatus","has","hasEvery","hasSome","slug","imageUrl","customerId_gearItemId_rentalOrderId","is","isNot","connectOrCreate","upsert","disconnect","delete","connect","createMany","set","updateMany","deleteMany","increment","decrement","multiply","divide","push"]'),
  graph: "4wRPgAELAwAA8wEAIJoBAACkAgAwmwEAACsAEJwBAACkAgAwnQEBAAAAAZ4BAQAAAAGlAUAA8gEAIaYBQADyAQAh2gEBAIoCACHkAQEAAAAB5QEBAIoCACEBAAAAAQAgFgUAAIsCACAKAAD2AQAgEAAAuAIAIBEAALMCACCaAQAAtAIAMJsBAAADABCcAQAAtAIAMJ0BAQDvAQAhngEBAO8BACGkAQAAtwLhASKlAUAA8gEAIaYBQADyAQAhugEBAO8BACHCARAAqwIAIdgBAQDvAQAh2QEBAO8BACHaAQEA7wEAIdsBAACuAgAg3AEAAJkCACDdARAAtQIAId4BAgCnAgAh3wEgALYCACEGBQAA_gMAIAoAAOcDACAQAACcBAAgEQAAmwQAINsBAADpAwAg3QEAAOkDACAWBQAAiwIAIAoAAPYBACAQAAC4AgAgEQAAswIAIJoBAAC0AgAwmwEAAAMAEJwBAAC0AgAwnQEBAAAAAZ4BAQDvAQAhpAEAALcC4QEipQFAAPIBACGmAUAA8gEAIboBAQDvAQAhwgEQAKsCACHYAQEA7wEAIdkBAQDvAQAh2gEBAO8BACHbAQAArgIAINwBAACZAgAg3QEQALUCACHeAQIApwIAId8BIAC2AgAhAwAAAAMAIAEAAAQAMAIAAAUAIAMAAAADACABAAAEADACAAAFACATBAAAiwIAIAUAAIsCACAIAACzAgAgCQAA9QEAIAoAAPYBACCaAQAAsQIAMJsBAAAIABCcAQAAsQIAMJ0BAQDvAQAhpAEAALICwAEipQFAAPIBACGmAUAA8gEAIbUBAQDvAQAhugEBAO8BACG7AUAA8gEAIbwBQADyAQAhvQECAKcCACG-ARAAqwIAIcABAQCKAgAhBgQAAP4DACAFAAD-AwAgCAAAmwQAIAkAAOYDACAKAADnAwAgwAEAAOkDACATBAAAiwIAIAUAAIsCACAIAACzAgAgCQAA9QEAIAoAAPYBACCaAQAAsQIAMJsBAAAIABCcAQAAsQIAMJ0BAQAAAAGkAQAAsgLAASKlAUAA8gEAIaYBQADyAQAhtQEBAO8BACG6AQEA7wEAIbsBQADyAQAhvAFAAPIBACG9AQIApwIAIb4BEACrAgAhwAEBAIoCACEDAAAACAAgAQAACQAwAgAACgAgCwYAAKkCACAHAACoAgAgmgEAALACADCbAQAADAAQnAEAALACADCdAQEA7wEAIbYBAQDvAQAhtwEBAO8BACHBAQIApwIAIcIBEACrAgAhwwEQAKsCACECBgAAmgQAIAcAAJkEACALBgAAqQIAIAcAAKgCACCaAQAAsAIAMJsBAAAMABCcAQAAsAIAMJ0BAQAAAAG2AQEA7wEAIbcBAQDvAQAhwQECAKcCACHCARAAqwIAIcMBEACrAgAhAwAAAAwAIAEAAA0AMAIAAA4AIBIEAACLAgAgBQAArALPASIGAACpAgAgmgEAAKoCADCbAQAAEAAQnAEAAKoCADCdAQEA7wEAIaQBAACtAtABIqUBQADyAQAhpgFAAPIBACG1AQEA7wEAIbcBAQDvAQAhygEBAO8BACHLARAAqwIAIcwBAQDvAQAhzQEBAIoCACHQAQAArgIAINEBQACvAgAhBQQAAP4DACAGAACaBAAgzQEAAOkDACDQAQAA6QMAINEBAADpAwAgEgQAAIsCACAFAACsAs8BIgYAAKkCACCaAQAAqgIAMJsBAAAQABCcAQAAqgIAMJ0BAQAAAAGkAQAArQLQASKlAUAA8gEAIaYBQADyAQAhtQEBAO8BACG3AQEA7wEAIcoBAQAAAAHLARAAqwIAIcwBAQDvAQAhzQEBAIoCACHQAQAArgIAINEBQACvAgAhAwAAABAAIAEAABEAMAIAABIAIA4EAACLAgAgBgAAqQIAIAcAAKgCACCaAQAApgIAMJsBAAAUABCcAQAApgIAMJ0BAQDvAQAhpQFAAPIBACGmAUAA8gEAIbUBAQDvAQAhtgEBAO8BACG3AQEA7wEAIbgBAgCnAgAhuQEBAIoCACEEBAAA_gMAIAYAAJoEACAHAACZBAAguQEAAOkDACAPBAAAiwIAIAYAAKkCACAHAACoAgAgmgEAAKYCADCbAQAAFAAQnAEAAKYCADCdAQEAAAABpQFAAPIBACGmAUAA8gEAIbUBAQDvAQAhtgEBAO8BACG3AQEA7wEAIbgBAgCnAgAhuQEBAIoCACHmAQAApQIAIAMAAAAUACABAAAVADACAAAWACABAAAADAAgAQAAABAAIAEAAAAUACADAAAACAAgAQAACQAwAgAACgAgAwAAABAAIAEAABEAMAIAABIAIAMAAAAUACABAAAVADACAAAWACANDgAAiwIAIJoBAACJAgAwmwEAAB4AEJwBAACJAgAwnQEBAO8BACGlAUAA8gEAIaYBQADyAQAhxAEBAO8BACHFAQEAigIAIcYBAQCKAgAhxwEBAIoCACHIAQEAigIAIckBAQCKAgAhAQAAAB4AIAEAAAADACABAAAACAAgAQAAAAgAIAEAAAAQACABAAAAFAAgAwAAAAwAIAEAAA0AMAIAAA4AIAMAAAAUACABAAAVADACAAAWACABAAAADAAgAQAAABQAIAEAAAADACABAAAAAQAgCwMAAPMBACCaAQAApAIAMJsBAAArABCcAQAApAIAMJ0BAQDvAQAhngEBAO8BACGlAUAA8gEAIaYBQADyAQAh2gEBAIoCACHkAQEA7wEAIeUBAQCKAgAhAwMAAOQDACDaAQAA6QMAIOUBAADpAwAgAwAAACsAIAEAACwAMAIAAAEAIAMAAAArACABAAAsADACAAABACADAAAAKwAgAQAALAAwAgAAAQAgCAMAAJgEACCdAQEAAAABngEBAAAAAaUBQAAAAAGmAUAAAAAB2gEBAAAAAeQBAQAAAAHlAQEAAAABARcAADAAIAedAQEAAAABngEBAAAAAaUBQAAAAAGmAUAAAAAB2gEBAAAAAeQBAQAAAAHlAQEAAAABARcAADIAMAEXAAAyADAIAwAAjgQAIJ0BAQC8AgAhngEBALwCACGlAUAAvwIAIaYBQAC_AgAh2gEBAMsCACHkAQEAvAIAIeUBAQDLAgAhAgAAAAEAIBcAADUAIAedAQEAvAIAIZ4BAQC8AgAhpQFAAL8CACGmAUAAvwIAIdoBAQDLAgAh5AEBALwCACHlAQEAywIAIQIAAAArACAXAAA3ACACAAAAKwAgFwAANwAgAwAAAAEAIB4AADAAIB8AADUAIAEAAAABACABAAAAKwAgBQsAAIsEACAkAACNBAAgJQAAjAQAINoBAADpAwAg5QEAAOkDACAKmgEAAKMCADCbAQAAPgAQnAEAAKMCADCdAQEA4QEAIZ4BAQDhAQAhpQFAAOQBACGmAUAA5AEAIdoBAQD6AQAh5AEBAOEBACHlAQEA-gEAIQMAAAArACABAAA9ADAjAAA-ACADAAAAKwAgAQAALAAwAgAAAQAgAQAAAAUAIAEAAAAFACADAAAAAwAgAQAABAAwAgAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAAADACABAAAEADACAAAFACATBQAAigQAIAoAAN0DACAQAADbAwAgEQAA3AMAIJ0BAQAAAAGeAQEAAAABpAEAAADhAQKlAUAAAAABpgFAAAAAAboBAQAAAAHCARAAAAAB2AEBAAAAAdkBAQAAAAHaAQEAAAAB2wGAAAAAAdwBAADaAwAg3QEQAAAAAd4BAgAAAAHfASAAAAABARcAAEYAIA-dAQEAAAABngEBAAAAAaQBAAAA4QECpQFAAAAAAaYBQAAAAAG6AQEAAAABwgEQAAAAAdgBAQAAAAHZAQEAAAAB2gEBAAAAAdsBgAAAAAHcAQAA2gMAIN0BEAAAAAHeAQIAAAAB3wEgAAAAAQEXAABIADABFwAASAAwEwUAAIkEACAKAADEAwAgEAAAwgMAIBEAAMMDACCdAQEAvAIAIZ4BAQC8AgAhpAEAAMAD4QEipQFAAL8CACGmAUAAvwIAIboBAQC8AgAhwgEQAOcCACHYAQEAvAIAIdkBAQC8AgAh2gEBALwCACHbAYAAAAAB3AEAAL0DACDdARAAvgMAId4BAgDWAgAh3wEgAL8DACECAAAABQAgFwAASwAgD50BAQC8AgAhngEBALwCACGkAQAAwAPhASKlAUAAvwIAIaYBQAC_AgAhugEBALwCACHCARAA5wIAIdgBAQC8AgAh2QEBALwCACHaAQEAvAIAIdsBgAAAAAHcAQAAvQMAIN0BEAC-AwAh3gECANYCACHfASAAvwMAIQIAAAADACAXAABNACACAAAAAwAgFwAATQAgAwAAAAUAIB4AAEYAIB8AAEsAIAEAAAAFACABAAAAAwAgBwsAAIQEACAkAACHBAAgJQAAhgQAIDYAAIUEACA3AACIBAAg2wEAAOkDACDdAQAA6QMAIBKaAQAAmAIAMJsBAABUABCcAQAAmAIAMJ0BAQDhAQAhngEBAOEBACGkAQAAnALhASKlAUAA5AEAIaYBQADkAQAhugEBAOEBACHCARAAgQIAIdgBAQDhAQAh2QEBAOEBACHaAQEA4QEAIdsBAACPAgAg3AEAAJkCACDdARAAmgIAId4BAgD5AQAh3wEgAJsCACEDAAAAAwAgAQAAUwAwIwAAVAAgAwAAAAMAIAEAAAQAMAIAAAUAIAEAAAASACABAAAAEgAgAwAAABAAIAEAABEAMAIAABIAIAMAAAAQACABAAARADACAAASACADAAAAEAAgAQAAEQAwAgAAEgAgDwQAAJQDACAFAAAAzwECBgAA7gIAIJ0BAQAAAAGkAQAAANABAqUBQAAAAAGmAUAAAAABtQEBAAAAAbcBAQAAAAHKAQEAAAABywEQAAAAAcwBAQAAAAHNAQEAAAAB0AGAAAAAAdEBQAAAAAEBFwAAXAAgDQUAAADPAQKdAQEAAAABpAEAAADQAQKlAUAAAAABpgFAAAAAAbUBAQAAAAG3AQEAAAABygEBAAAAAcsBEAAAAAHMAQEAAAABzQEBAAAAAdABgAAAAAHRAUAAAAABARcAAF4AMAEXAABeADAPBAAAkgMAIAUAAOgCzwEiBgAA7AIAIJ0BAQC8AgAhpAEAAOkC0AEipQFAAL8CACGmAUAAvwIAIbUBAQC8AgAhtwEBALwCACHKAQEAvAIAIcsBEADnAgAhzAEBALwCACHNAQEAywIAIdABgAAAAAHRAUAA6gIAIQIAAAASACAXAABhACANBQAA6ALPASKdAQEAvAIAIaQBAADpAtABIqUBQAC_AgAhpgFAAL8CACG1AQEAvAIAIbcBAQC8AgAhygEBALwCACHLARAA5wIAIcwBAQC8AgAhzQEBAMsCACHQAYAAAAAB0QFAAOoCACECAAAAEAAgFwAAYwAgAgAAABAAIBcAAGMAIAMAAAASACAeAABcACAfAABhACABAAAAEgAgAQAAABAAIAgLAAD_AwAgJAAAggQAICUAAIEEACA2AACABAAgNwAAgwQAIM0BAADpAwAg0AEAAOkDACDRAQAA6QMAIBAFAACNAs8BIpoBAACMAgAwmwEAAGoAEJwBAACMAgAwnQEBAOEBACGkAQAAjgLQASKlAUAA5AEAIaYBQADkAQAhtQEBAOEBACG3AQEA4QEAIcoBAQDhAQAhywEQAIECACHMAQEA4QEAIc0BAQD6AQAh0AEAAI8CACDRAUAAkAIAIQMAAAAQACABAABpADAjAABqACADAAAAEAAgAQAAEQAwAgAAEgAgDQ4AAIsCACCaAQAAiQIAMJsBAAAeABCcAQAAiQIAMJ0BAQAAAAGlAUAA8gEAIaYBQADyAQAhxAEBAAAAAcUBAQCKAgAhxgEBAIoCACHHAQEAigIAIcgBAQCKAgAhyQEBAIoCACEBAAAAbQAgAQAAAG0AIAYOAAD-AwAgxQEAAOkDACDGAQAA6QMAIMcBAADpAwAgyAEAAOkDACDJAQAA6QMAIAMAAAAeACABAABwADACAABtACADAAAAHgAgAQAAcAAwAgAAbQAgAwAAAB4AIAEAAHAAMAIAAG0AIAoOAAD9AwAgnQEBAAAAAaUBQAAAAAGmAUAAAAABxAEBAAAAAcUBAQAAAAHGAQEAAAABxwEBAAAAAcgBAQAAAAHJAQEAAAABARcAAHQAIAmdAQEAAAABpQFAAAAAAaYBQAAAAAHEAQEAAAABxQEBAAAAAcYBAQAAAAHHAQEAAAAByAEBAAAAAckBAQAAAAEBFwAAdgAwARcAAHYAMAoOAAD8AwAgnQEBALwCACGlAUAAvwIAIaYBQAC_AgAhxAEBALwCACHFAQEAywIAIcYBAQDLAgAhxwEBAMsCACHIAQEAywIAIckBAQDLAgAhAgAAAG0AIBcAAHkAIAmdAQEAvAIAIaUBQAC_AgAhpgFAAL8CACHEAQEAvAIAIcUBAQDLAgAhxgEBAMsCACHHAQEAywIAIcgBAQDLAgAhyQEBAMsCACECAAAAHgAgFwAAewAgAgAAAB4AIBcAAHsAIAMAAABtACAeAAB0ACAfAAB5ACABAAAAbQAgAQAAAB4AIAgLAAD5AwAgJAAA-wMAICUAAPoDACDFAQAA6QMAIMYBAADpAwAgxwEAAOkDACDIAQAA6QMAIMkBAADpAwAgDJoBAACIAgAwmwEAAIIBABCcAQAAiAIAMJ0BAQDhAQAhpQFAAOQBACGmAUAA5AEAIcQBAQDhAQAhxQEBAPoBACHGAQEA-gEAIccBAQD6AQAhyAEBAPoBACHJAQEA-gEAIQMAAAAeACABAACBAQAwIwAAggEAIAMAAAAeACABAABwADACAABtACABAAAADgAgAQAAAA4AIAMAAAAMACABAAANADACAAAOACADAAAADAAgAQAADQAwAgAADgAgAwAAAAwAIAEAAA0AMAIAAA4AIAgGAADYAwAgBwAAogMAIJ0BAQAAAAG2AQEAAAABtwEBAAAAAcEBAgAAAAHCARAAAAABwwEQAAAAAQEXAACKAQAgBp0BAQAAAAG2AQEAAAABtwEBAAAAAcEBAgAAAAHCARAAAAABwwEQAAAAAQEXAACMAQAwARcAAIwBADAIBgAA1gMAIAcAAKADACCdAQEAvAIAIbYBAQC8AgAhtwEBALwCACHBAQIA1gIAIcIBEADnAgAhwwEQAOcCACECAAAADgAgFwAAjwEAIAadAQEAvAIAIbYBAQC8AgAhtwEBALwCACHBAQIA1gIAIcIBEADnAgAhwwEQAOcCACECAAAADAAgFwAAkQEAIAIAAAAMACAXAACRAQAgAwAAAA4AIB4AAIoBACAfAACPAQAgAQAAAA4AIAEAAAAMACAFCwAA9AMAICQAAPcDACAlAAD2AwAgNgAA9QMAIDcAAPgDACAJmgEAAIcCADCbAQAAmAEAEJwBAACHAgAwnQEBAOEBACG2AQEA4QEAIbcBAQDhAQAhwQECAPkBACHCARAAgQIAIcMBEACBAgAhAwAAAAwAIAEAAJcBADAjAACYAQAgAwAAAAwAIAEAAA0AMAIAAA4AIAEAAAAKACABAAAACgAgAwAAAAgAIAEAAAkAMAIAAAoAIAMAAAAIACABAAAJADACAAAKACADAAAACAAgAQAACQAwAgAACgAgEAQAAKQDACAFAACyAwAgCAAApQMAIAkAAKYDACAKAACnAwAgnQEBAAAAAaQBAAAAwAECpQFAAAAAAaYBQAAAAAG1AQEAAAABugEBAAAAAbsBQAAAAAG8AUAAAAABvQECAAAAAb4BEAAAAAHAAQEAAAABARcAAKABACALnQEBAAAAAaQBAAAAwAECpQFAAAAAAaYBQAAAAAG1AQEAAAABugEBAAAAAbsBQAAAAAG8AUAAAAABvQECAAAAAb4BEAAAAAHAAQEAAAABARcAAKIBADABFwAAogEAMBAEAAD7AgAgBQAAsAMAIAgAAPwCACAJAAD9AgAgCgAA_gIAIJ0BAQC8AgAhpAEAAPkCwAEipQFAAL8CACGmAUAAvwIAIbUBAQC8AgAhugEBALwCACG7AUAAvwIAIbwBQAC_AgAhvQECANYCACG-ARAA5wIAIcABAQDLAgAhAgAAAAoAIBcAAKUBACALnQEBALwCACGkAQAA-QLAASKlAUAAvwIAIaYBQAC_AgAhtQEBALwCACG6AQEAvAIAIbsBQAC_AgAhvAFAAL8CACG9AQIA1gIAIb4BEADnAgAhwAEBAMsCACECAAAACAAgFwAApwEAIAIAAAAIACAXAACnAQAgAwAAAAoAIB4AAKABACAfAAClAQAgAQAAAAoAIAEAAAAIACAGCwAA7wMAICQAAPIDACAlAADxAwAgNgAA8AMAIDcAAPMDACDAAQAA6QMAIA6aAQAAgAIAMJsBAACuAQAQnAEAAIACADCdAQEA4QEAIaQBAACCAsABIqUBQADkAQAhpgFAAOQBACG1AQEA4QEAIboBAQDhAQAhuwFAAOQBACG8AUAA5AEAIb0BAgD5AQAhvgEQAIECACHAAQEA-gEAIQMAAAAIACABAACtAQAwIwAArgEAIAMAAAAIACABAAAJADACAAAKACABAAAAFgAgAQAAABYAIAMAAAAUACABAAAVADACAAAWACADAAAAFAAgAQAAFQAwAgAAFgAgAwAAABQAIAEAABUAMAIAABYAIAsEAACJAwAgBgAA3AIAIAcAANsCACCdAQEAAAABpQFAAAAAAaYBQAAAAAG1AQEAAAABtgEBAAAAAbcBAQAAAAG4AQIAAAABuQEBAAAAAQEXAAC2AQAgCJ0BAQAAAAGlAUAAAAABpgFAAAAAAbUBAQAAAAG2AQEAAAABtwEBAAAAAbgBAgAAAAG5AQEAAAABARcAALgBADABFwAAuAEAMAsEAACHAwAgBgAA2QIAIAcAANgCACCdAQEAvAIAIaUBQAC_AgAhpgFAAL8CACG1AQEAvAIAIbYBAQC8AgAhtwEBALwCACG4AQIA1gIAIbkBAQDLAgAhAgAAABYAIBcAALsBACAInQEBALwCACGlAUAAvwIAIaYBQAC_AgAhtQEBALwCACG2AQEAvAIAIbcBAQC8AgAhuAECANYCACG5AQEAywIAIQIAAAAUACAXAAC9AQAgAgAAABQAIBcAAL0BACADAAAAFgAgHgAAtgEAIB8AALsBACABAAAAFgAgAQAAABQAIAYLAADqAwAgJAAA7QMAICUAAOwDACA2AADrAwAgNwAA7gMAILkBAADpAwAgC5oBAAD4AQAwmwEAAMQBABCcAQAA-AEAMJ0BAQDhAQAhpQFAAOQBACGmAUAA5AEAIbUBAQDhAQAhtgEBAOEBACG3AQEA4QEAIbgBAgD5AQAhuQEBAPoBACEDAAAAFAAgAQAAwwEAMCMAAMQBACADAAAAFAAgAQAAFQAwAgAAFgAgEQMAAPMBACAJAAD1AQAgCgAA9gEAIAwAAPQBACANAAD0AQAgDwAA9wEAIJoBAADuAQAwmwEAAMoBABCcAQAA7gEAMJ0BAQAAAAGeAQEA7wEAIZ8BAQAAAAGgAQEA7wEAIaIBAADwAaIBIqQBAADxAaQBIqUBQADyAQAhpgFAAPIBACEBAAAAxwEAIAEAAADHAQAgEQMAAPMBACAJAAD1AQAgCgAA9gEAIAwAAPQBACANAAD0AQAgDwAA9wEAIJoBAADuAQAwmwEAAMoBABCcAQAA7gEAMJ0BAQDvAQAhngEBAO8BACGfAQEA7wEAIaABAQDvAQAhogEAAPABogEipAEAAPEBpAEipQFAAPIBACGmAUAA8gEAIQYDAADkAwAgCQAA5gMAIAoAAOcDACAMAADlAwAgDQAA5QMAIA8AAOgDACADAAAAygEAIAEAAMsBADACAADHAQAgAwAAAMoBACABAADLAQAwAgAAxwEAIAMAAADKAQAgAQAAywEAMAIAAMcBACAOAwAA3gMAIAkAAOEDACAKAADiAwAgDAAA3wMAIA0AAOADACAPAADjAwAgnQEBAAAAAZ4BAQAAAAGfAQEAAAABoAEBAAAAAaIBAAAAogECpAEAAACkAQKlAUAAAAABpgFAAAAAAQEXAADPAQAgCJ0BAQAAAAGeAQEAAAABnwEBAAAAAaABAQAAAAGiAQAAAKIBAqQBAAAApAECpQFAAAAAAaYBQAAAAAEBFwAA0QEAMAEXAADRAQAwDgMAAMACACAJAADDAgAgCgAAxAIAIAwAAMECACANAADCAgAgDwAAxQIAIJ0BAQC8AgAhngEBALwCACGfAQEAvAIAIaABAQC8AgAhogEAAL0CogEipAEAAL4CpAEipQFAAL8CACGmAUAAvwIAIQIAAADHAQAgFwAA1AEAIAidAQEAvAIAIZ4BAQC8AgAhnwEBALwCACGgAQEAvAIAIaIBAAC9AqIBIqQBAAC-AqQBIqUBQAC_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-AQAhDgsAAPwBACAkAAD9AQAgJQAA_QEAIKcBAQAAAAGoAQEAAAAFqQEBAAAABaoBAQAAAAGrAQEAAAABrAEBAAAAAa0BAQAAAAGuAQEA-wEAIa8BAQAAAAGwAQEAAAABsQEBAAAAAQ4LAAD8AQAgJAAA_QEAICUAAP0BACCnAQEAAAABqAEBAAAABakBAQAAAAWqAQEAAAABqwEBAAAAAawBAQAAAAGtAQEAAAABrgEBAPsBACGvAQEAAAABsAEBAAAAAbEBAQAAAAEIpwECAAAAAagBAgAAAAWpAQIAAAAFqgECAAAAAasBAgAAAAGsAQIAAAABrQECAAAAAa4BAgD8AQAhC6cBAQAAAAGoAQEAAAAFqQEBAAAABaoBAQAAAAGrAQEAAAABrAEBAAAAAa0BAQAAAAGuAQEA_QEAIa8BAQAAAAGwAQEAAAABsQEBAAAAAQ0LAADmAQAgJAAA5gEAICUAAOYBACA2AAD_AQAgNwAA5gEAIKcBAgAAAAGoAQIAAAAEqQECAAAABKoBAgAAAAGrAQIAAAABrAECAAAAAa0BAgAAAAGuAQIA_gEAIQinAQgAAAABqAEIAAAABKkBCAAAAASqAQgAAAABqwEIAAAAAawBCAAAAAGtAQgAAAABrgEIAP8BACEOmgEAAIACADCbAQAArgEAEJwBAACAAgAwnQEBAOEBACGkAQAAggLAASKlAUAA5AEAIaYBQADkAQAhtQEBAOEBACG6AQEA4QEAIbsBQADkAQAhvAFAAOQBACG9AQIA-QEAIb4BEACBAgAhwAEBAPoBACENCwAA5gEAICQAAIYCACAlAACGAgAgNgAAhgIAIDcAAIYCACCnARAAAAABqAEQAAAABKkBEAAAAASqARAAAAABqwEQAAAAAawBEAAAAAGtARAAAAABrgEQAIUCACEHCwAA5gEAICQAAIQCACAlAACEAgAgpwEAAADAAQKoAQAAAMABCKkBAAAAwAEIrgEAAIMCwAEiBwsAAOYBACAkAACEAgAgJQAAhAIAIKcBAAAAwAECqAEAAADAAQipAQAAAMABCK4BAACDAsABIgSnAQAAAMABAqgBAAAAwAEIqQEAAADAAQiuAQAAhALAASINCwAA5gEAICQAAIYCACAlAACGAgAgNgAAhgIAIDcAAIYCACCnARAAAAABqAEQAAAABKkBEAAAAASqARAAAAABqwEQAAAAAawBEAAAAAGtARAAAAABrgEQAIUCACEIpwEQAAAAAagBEAAAAASpARAAAAAEqgEQAAAAAasBEAAAAAGsARAAAAABrQEQAAAAAa4BEACGAgAhCZoBAACHAgAwmwEAAJgBABCcAQAAhwIAMJ0BAQDhAQAhtgEBAOEBACG3AQEA4QEAIcEBAgD5AQAhwgEQAIECACHDARAAgQIAIQyaAQAAiAIAMJsBAACCAQAQnAEAAIgCADCdAQEA4QEAIaUBQADkAQAhpgFAAOQBACHEAQEA4QEAIcUBAQD6AQAhxgEBAPoBACHHAQEA-gEAIcgBAQD6AQAhyQEBAPoBACENDgAAiwIAIJoBAACJAgAwmwEAAB4AEJwBAACJAgAwnQEBAO8BACGlAUAA8gEAIaYBQADyAQAhxAEBAO8BACHFAQEAigIAIcYBAQCKAgAhxwEBAIoCACHIAQEAigIAIckBAQCKAgAhC6cBAQAAAAGoAQEAAAAFqQEBAAAABaoBAQAAAAGrAQEAAAABrAEBAAAAAa0BAQAAAAGuAQEA_QEAIa8BAQAAAAGwAQEAAAABsQEBAAAAARMDAADzAQAgCQAA9QEAIAoAAPYBACAMAAD0AQAgDQAA9AEAIA8AAPcBACCaAQAA7gEAMJsBAADKAQAQnAEAAO4BADCdAQEA7wEAIZ4BAQDvAQAhnwEBAO8BACGgAQEA7wEAIaIBAADwAaIBIqQBAADxAaQBIqUBQADyAQAhpgFAAPIBACHnAQAAygEAIOgBAADKAQAgEAUAAI0CzwEimgEAAIwCADCbAQAAagAQnAEAAIwCADCdAQEA4QEAIaQBAACOAtABIqUBQADkAQAhpgFAAOQBACG1AQEA4QEAIbcBAQDhAQAhygEBAOEBACHLARAAgQIAIcwBAQDhAQAhzQEBAPoBACHQAQAAjwIAINEBQACQAgAhBwsAAOYBACAkAACXAgAgJQAAlwIAIKcBAAAAzwECqAEAAADPAQipAQAAAM8BCK4BAACWAs8BIgcLAADmAQAgJAAAlQIAICUAAJUCACCnAQAAANABAqgBAAAA0AEIqQEAAADQAQiuAQAAlALQASIPCwAA_AEAICQAAJMCACAlAACTAgAgpwGAAAAAAaoBgAAAAAGrAYAAAAABrAGAAAAAAa0BgAAAAAGuAYAAAAAB0gEBAAAAAdMBAQAAAAHUAQEAAAAB1QGAAAAAAdYBgAAAAAHXAYAAAAABCwsAAPwBACAkAACSAgAgJQAAkgIAIKcBQAAAAAGoAUAAAAAFqQFAAAAABaoBQAAAAAGrAUAAAAABrAFAAAAAAa0BQAAAAAGuAUAAkQIAIQsLAAD8AQAgJAAAkgIAICUAAJICACCnAUAAAAABqAFAAAAABakBQAAAAAWqAUAAAAABqwFAAAAAAawBQAAAAAGtAUAAAAABrgFAAJECACEIpwFAAAAAAagBQAAAAAWpAUAAAAAFqgFAAAAAAasBQAAAAAGsAUAAAAABrQFAAAAAAa4BQACSAgAhDKcBgAAAAAGqAYAAAAABqwGAAAAAAawBgAAAAAGtAYAAAAABrgGAAAAAAdIBAQAAAAHTAQEAAAAB1AEBAAAAAdUBgAAAAAHWAYAAAAAB1wGAAAAAAQcLAADmAQAgJAAAlQIAICUAAJUCACCnAQAAANABAqgBAAAA0AEIqQEAAADQAQiuAQAAlALQASIEpwEAAADQAQKoAQAAANABCKkBAAAA0AEIrgEAAJUC0AEiBwsAAOYBACAkAACXAgAgJQAAlwIAIKcBAAAAzwECqAEAAADPAQipAQAAAM8BCK4BAACWAs8BIgSnAQAAAM8BAqgBAAAAzwEIqQEAAADPAQiuAQAAlwLPASISmgEAAJgCADCbAQAAVAAQnAEAAJgCADCdAQEA4QEAIZ4BAQDhAQAhpAEAAJwC4QEipQFAAOQBACGmAUAA5AEAIboBAQDhAQAhwgEQAIECACHYAQEA4QEAIdkBAQDhAQAh2gEBAOEBACHbAQAAjwIAINwBAACZAgAg3QEQAJoCACHeAQIA-QEAId8BIACbAgAhBKcBAQAAAAXhAQEAAAAB4gEBAAAABOMBAQAAAAQNCwAA_AEAICQAAKICACAlAACiAgAgNgAAogIAIDcAAKICACCnARAAAAABqAEQAAAABakBEAAAAAWqARAAAAABqwEQAAAAAawBEAAAAAGtARAAAAABrgEQAKECACEFCwAA5gEAICQAAKACACAlAACgAgAgpwEgAAAAAa4BIACfAgAhBwsAAOYBACAkAACeAgAgJQAAngIAIKcBAAAA4QECqAEAAADhAQipAQAAAOEBCK4BAACdAuEBIgcLAADmAQAgJAAAngIAICUAAJ4CACCnAQAAAOEBAqgBAAAA4QEIqQEAAADhAQiuAQAAnQLhASIEpwEAAADhAQKoAQAAAOEBCKkBAAAA4QEIrgEAAJ4C4QEiBQsAAOYBACAkAACgAgAgJQAAoAIAIKcBIAAAAAGuASAAnwIAIQKnASAAAAABrgEgAKACACENCwAA_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_AgAhxQEBAMsCACHGAQEAywIAIccBAQDLAgAhyAEBAMsCACHJAQEAywIAIQHvAQEAAAABCQYAANwCACAHAADbAgAgnQEBAAAAAaUBQAAAAAGmAUAAAAABtgEBAAAAAbcBAQAAAAG4AQIAAAABuQEBAAAAAQIAAAAWACAeAADaAgAgAwAAABYAIB4AANoCACAfAADXAgAgARcAAOMEADAPBAAAiwIAIAYAAKkCACAHAACoAgAgmgEAAKYCADCbAQAAFAAQnAEAAKYCADCdAQEAAAABpQFAAPIBACGmAUAA8gEAIbUBAQDvAQAhtgEBAO8BACG3AQEA7wEAIbgBAgCnAgAhuQEBAIoCACHmAQAApQIAIAIAAAAWACAXAADXAgAgAgAAANQCACAXAADVAgAgC5oBAADTAgAwmwEAANQCABCcAQAA0wIAMJ0BAQDvAQAhpQFAAPIBACGmAUAA8gEAIbUBAQDvAQAhtgEBAO8BACG3AQEA7wEAIbgBAgCnAgAhuQEBAIoCACELmgEAANMCADCbAQAA1AIAEJwBAADTAgAwnQEBAO8BACGlAUAA8gEAIaYBQADyAQAhtQEBAO8BACG2AQEA7wEAIbcBAQDvAQAhuAECAKcCACG5AQEAigIAIQedAQEAvAIAIaUBQAC_AgAhpgFAAL8CACG2AQEAvAIAIbcBAQC8AgAhuAECANYCACG5AQEAywIAIQXvAQIAAAAB8gECAAAAAfMBAgAAAAH0AQIAAAAB9QECAAAAAQkGAADZAgAgBwAA2AIAIJ0BAQC8AgAhpQFAAL8CACGmAUAAvwIAIbYBAQC8AgAhtwEBALwCACG4AQIA1gIAIbkBAQDLAgAhBR4AANsEACAfAADhBAAg6QEAANwEACDqAQAA4AQAIO0BAAAFACAFHgAA2QQAIB8AAN4EACDpAQAA2gQAIOoBAADdBAAg7QEAAAoAIAkGAADcAgAgBwAA2wIAIJ0BAQAAAAGlAUAAAAABpgFAAAAAAbYBAQAAAAG3AQEAAAABuAECAAAAAbkBAQAAAAEDHgAA2wQAIOkBAADcBAAg7QEAAAUAIAMeAADZBAAg6QEAANoEACDtAQAACgAgDQUAAADPAQIGAADuAgAgnQEBAAAAAaQBAAAA0AECpQFAAAAAAaYBQAAAAAG3AQEAAAABygEBAAAAAcsBEAAAAAHMAQEAAAABzQEBAAAAAdABgAAAAAHRAUAAAAABAgAAABIAIB4AAO0CACADAAAAEgAgHgAA7QIAIB8AAOsCACABFwAA2AQAMBIEAACLAgAgBQAArALPASIGAACpAgAgmgEAAKoCADCbAQAAEAAQnAEAAKoCADCdAQEAAAABpAEAAK0C0AEipQFAAPIBACGmAUAA8gEAIbUBAQDvAQAhtwEBAO8BACHKAQEAAAABywEQAKsCACHMAQEA7wEAIc0BAQCKAgAh0AEAAK4CACDRAUAArwIAIQIAAAASACAXAADrAgAgAgAAAOUCACAXAADmAgAgEAUAAKwCzwEimgEAAOQCADCbAQAA5QIAEJwBAADkAgAwnQEBAO8BACGkAQAArQLQASKlAUAA8gEAIaYBQADyAQAhtQEBAO8BACG3AQEA7wEAIcoBAQDvAQAhywEQAKsCACHMAQEA7wEAIc0BAQCKAgAh0AEAAK4CACDRAUAArwIAIRAFAACsAs8BIpoBAADkAgAwmwEAAOUCABCcAQAA5AIAMJ0BAQDvAQAhpAEAAK0C0AEipQFAAPIBACGmAUAA8gEAIbUBAQDvAQAhtwEBAO8BACHKAQEA7wEAIcsBEACrAgAhzAEBAO8BACHNAQEAigIAIdABAACuAgAg0QFAAK8CACEMBQAA6ALPASKdAQEAvAIAIaQBAADpAtABIqUBQAC_AgAhpgFAAL8CACG3AQEAvAIAIcoBAQC8AgAhywEQAOcCACHMAQEAvAIAIc0BAQDLAgAh0AGAAAAAAdEBQADqAgAhBe8BEAAAAAHyARAAAAAB8wEQAAAAAfQBEAAAAAH1ARAAAAABAe8BAAAAzwECAe8BAAAA0AECAe8BQAAAAAENBQAA6ALPASIGAADsAgAgnQEBALwCACGkAQAA6QLQASKlAUAAvwIAIaYBQAC_AgAhtwEBALwCACHKAQEAvAIAIcsBEADnAgAhzAEBALwCACHNAQEAywIAIdABgAAAAAHRAUAA6gIAIQUeAADTBAAgHwAA1gQAIOkBAADUBAAg6gEAANUEACDtAQAACgAgDQUAAADPAQIGAADuAgAgnQEBAAAAAaQBAAAA0AECpQFAAAAAAaYBQAAAAAG3AQEAAAABygEBAAAAAcsBEAAAAAHMAQEAAAABzQEBAAAAAdABgAAAAAHRAUAAAAABAx4AANMEACDpAQAA1AQAIO0BAAAKACAOBAAApAMAIAgAAKUDACAJAACmAwAgCgAApwMAIJ0BAQAAAAGkAQAAAMABAqUBQAAAAAGmAUAAAAABtQEBAAAAAbsBQAAAAAG8AUAAAAABvQECAAAAAb4BEAAAAAHAAQEAAAABAgAAAAoAIB4AAKMDACADAAAACgAgHgAAowMAIB8AAPoCACABFwAA0gQAMBMEAACLAgAgBQAAiwIAIAgAALMCACAJAAD1AQAgCgAA9gEAIJoBAACxAgAwmwEAAAgAEJwBAACxAgAwnQEBAAAAAaQBAACyAsABIqUBQADyAQAhpgFAAPIBACG1AQEA7wEAIboBAQDvAQAhuwFAAPIBACG8AUAA8gEAIb0BAgCnAgAhvgEQAKsCACHAAQEAigIAIQIAAAAKACAXAAD6AgAgAgAAAPcCACAXAAD4AgAgDpoBAAD2AgAwmwEAAPcCABCcAQAA9gIAMJ0BAQDvAQAhpAEAALICwAEipQFAAPIBACGmAUAA8gEAIbUBAQDvAQAhugEBAO8BACG7AUAA8gEAIbwBQADyAQAhvQECAKcCACG-ARAAqwIAIcABAQCKAgAhDpoBAAD2AgAwmwEAAPcCABCcAQAA9gIAMJ0BAQDvAQAhpAEAALICwAEipQFAAPIBACGmAUAA8gEAIbUBAQDvAQAhugEBAO8BACG7AUAA8gEAIbwBQADyAQAhvQECAKcCACG-ARAAqwIAIcABAQCKAgAhCp0BAQC8AgAhpAEAAPkCwAEipQFAAL8CACGmAUAAvwIAIbUBAQC8AgAhuwFAAL8CACG8AUAAvwIAIb0BAgDWAgAhvgEQAOcCACHAAQEAywIAIQHvAQAAAMABAg4EAAD7AgAgCAAA_AIAIAkAAP0CACAKAAD-AgAgnQEBALwCACGkAQAA-QLAASKlAUAAvwIAIaYBQAC_AgAhtQEBALwCACG7AUAAvwIAIbwBQAC_AgAhvQECANYCACG-ARAA5wIAIcABAQDLAgAhBR4AALsEACAfAADQBAAg6QEAALwEACDqAQAAzwQAIO0BAADHAQAgCx4AAJUDADAfAACaAwAw6QEAAJYDADDqAQAAlwMAMOsBAACZAwAw7AEAAJkDADDtAQAAmQMAMO4BAACYAwAg7wEAAJkDADDwAQAAmwMAMPEBAACcAwAwCx4AAIoDADAfAACOAwAw6QEAAIsDADDqAQAAjAMAMOsBAADhAgAw7AEAAOECADDtAQAA4QIAMO4BAACNAwAg7wEAAOECADDwAQAAjwMAMPEBAADkAgAwCx4AAP8CADAfAACDAwAw6QEAAIADADDqAQAAgQMAMOsBAADQAgAw7AEAANACADDtAQAA0AIAMO4BAACCAwAg7wEAANACADDwAQAAhAMAMPEBAADTAgAwCQQAAIkDACAHAADbAgAgnQEBAAAAAaUBQAAAAAGmAUAAAAABtQEBAAAAAbYBAQAAAAG4AQIAAAABuQEBAAAAAQIAAAAWACAeAACIAwAgAwAAABYAIB4AAIgDACAfAACGAwAgARcAAM4EADACAAAAFgAgFwAAhgMAIAIAAADUAgAgFwAAhQMAIAedAQEAvAIAIaUBQAC_AgAhpgFAAL8CACG1AQEAvAIAIbYBAQC8AgAhuAECANYCACG5AQEAywIAIQkEAACHAwAgBwAA2AIAIJ0BAQC8AgAhpQFAAL8CACGmAUAAvwIAIbUBAQC8AgAhtgEBALwCACG4AQIA1gIAIbkBAQDLAgAhBR4AAMkEACAfAADMBAAg6QEAAMoEACDqAQAAywQAIO0BAADHAQAgCQQAAIkDACAHAADbAgAgnQEBAAAAAaUBQAAAAAGmAUAAAAABtQEBAAAAAbYBAQAAAAG4AQIAAAABuQEBAAAAAQMeAADJBAAg6QEAAMoEACDtAQAAxwEAIA0EAACUAwAgBQAAAM8BAp0BAQAAAAGkAQAAANABAqUBQAAAAAGmAUAAAAABtQEBAAAAAcoBAQAAAAHLARAAAAABzAEBAAAAAc0BAQAAAAHQAYAAAAAB0QFAAAAAAQIAAAASACAeAACTAwAgAwAAABIAIB4AAJMDACAfAACRAwAgARcAAMgEADACAAAAEgAgFwAAkQMAIAIAAADlAgAgFwAAkAMAIAwFAADoAs8BIp0BAQC8AgAhpAEAAOkC0AEipQFAAL8CACGmAUAAvwIAIbUBAQC8AgAhygEBALwCACHLARAA5wIAIcwBAQC8AgAhzQEBAMsCACHQAYAAAAAB0QFAAOoCACENBAAAkgMAIAUAAOgCzwEinQEBALwCACGkAQAA6QLQASKlAUAAvwIAIaYBQAC_AgAhtQEBALwCACHKAQEAvAIAIcsBEADnAgAhzAEBALwCACHNAQEAywIAIdABgAAAAAHRAUAA6gIAIQUeAADDBAAgHwAAxgQAIOkBAADEBAAg6gEAAMUEACDtAQAAxwEAIA0EAACUAwAgBQAAAM8BAp0BAQAAAAGkAQAAANABAqUBQAAAAAGmAUAAAAABtQEBAAAAAcoBAQAAAAHLARAAAAABzAEBAAAAAc0BAQAAAAHQAYAAAAAB0QFAAAAAAQMeAADDBAAg6QEAAMQEACDtAQAAxwEAIAYHAACiAwAgnQEBAAAAAbYBAQAAAAHBAQIAAAABwgEQAAAAAcMBEAAAAAECAAAADgAgHgAAoQMAIAMAAAAOACAeAAChAwAgHwAAnwMAIAEXAADCBAAwCwYAAKkCACAHAACoAgAgmgEAALACADCbAQAADAAQnAEAALACADCdAQEAAAABtgEBAO8BACG3AQEA7wEAIcEBAgCnAgAhwgEQAKsCACHDARAAqwIAIQIAAAAOACAXAACfAwAgAgAAAJ0DACAXAACeAwAgCZoBAACcAwAwmwEAAJ0DABCcAQAAnAMAMJ0BAQDvAQAhtgEBAO8BACG3AQEA7wEAIcEBAgCnAgAhwgEQAKsCACHDARAAqwIAIQmaAQAAnAMAMJsBAACdAwAQnAEAAJwDADCdAQEA7wEAIbYBAQDvAQAhtwEBAO8BACHBAQIApwIAIcIBEACrAgAhwwEQAKsCACEFnQEBALwCACG2AQEAvAIAIcEBAgDWAgAhwgEQAOcCACHDARAA5wIAIQYHAACgAwAgnQEBALwCACG2AQEAvAIAIcEBAgDWAgAhwgEQAOcCACHDARAA5wIAIQUeAAC9BAAgHwAAwAQAIOkBAAC-BAAg6gEAAL8EACDtAQAABQAgBgcAAKIDACCdAQEAAAABtgEBAAAAAcEBAgAAAAHCARAAAAABwwEQAAAAAQMeAAC9BAAg6QEAAL4EACDtAQAABQAgDgQAAKQDACAIAAClAwAgCQAApgMAIAoAAKcDACCdAQEAAAABpAEAAADAAQKlAUAAAAABpgFAAAAAAbUBAQAAAAG7AUAAAAABvAFAAAAAAb0BAgAAAAG-ARAAAAABwAEBAAAAAQMeAAC7BAAg6QEAALwEACDtAQAAxwEAIAQeAACVAwAw6QEAAJYDADDtAQAAmQMAMO4BAACYAwAgBB4AAIoDADDpAQAAiwMAMO0BAADhAgAw7gEAAI0DACAEHgAA_wIAMOkBAACAAwAw7QEAANACADDuAQAAggMAIA4FAACyAwAgCAAApQMAIAkAAKYDACAKAACnAwAgnQEBAAAAAaQBAAAAwAECpQFAAAAAAaYBQAAAAAG6AQEAAAABuwFAAAAAAbwBQAAAAAG9AQIAAAABvgEQAAAAAcABAQAAAAECAAAACgAgHgAAsQMAIAMAAAAKACAeAACxAwAgHwAArwMAIAEXAAC6BAAwAgAAAAoAIBcAAK8DACACAAAA9wIAIBcAAK4DACAKnQEBALwCACGkAQAA-QLAASKlAUAAvwIAIaYBQAC_AgAhugEBALwCACG7AUAAvwIAIbwBQAC_AgAhvQECANYCACG-ARAA5wIAIcABAQDLAgAhDgUAALADACAIAAD8AgAgCQAA_QIAIAoAAP4CACCdAQEAvAIAIaQBAAD5AsABIqUBQAC_AgAhpgFAAL8CACG6AQEAvAIAIbsBQAC_AgAhvAFAAL8CACG9AQIA1gIAIb4BEADnAgAhwAEBAMsCACEFHgAAtQQAIB8AALgEACDpAQAAtgQAIOoBAAC3BAAg7QEAAMcBACAOBQAAsgMAIAgAAKUDACAJAACmAwAgCgAApwMAIJ0BAQAAAAGkAQAAAMABAqUBQAAAAAGmAUAAAAABugEBAAAAAbsBQAAAAAG8AUAAAAABvQECAAAAAb4BEAAAAAHAAQEAAAABAx4AALUEACDpAQAAtgQAIO0BAADHAQAgEQoAAN0DACAQAADbAwAgEQAA3AMAIJ0BAQAAAAGeAQEAAAABpAEAAADhAQKlAUAAAAABpgFAAAAAAcIBEAAAAAHYAQEAAAAB2QEBAAAAAdoBAQAAAAHbAYAAAAAB3AEAANoDACDdARAAAAAB3gECAAAAAd8BIAAAAAECAAAABQAgHgAA2QMAIAMAAAAFACAeAADZAwAgHwAAwQMAIAEXAAC0BAAwFgUAAIsCACAKAAD2AQAgEAAAuAIAIBEAALMCACCaAQAAtAIAMJsBAAADABCcAQAAtAIAMJ0BAQAAAAGeAQEA7wEAIaQBAAC3AuEBIqUBQADyAQAhpgFAAPIBACG6AQEA7wEAIcIBEACrAgAh2AEBAO8BACHZAQEA7wEAIdoBAQDvAQAh2wEAAK4CACDcAQAAmQIAIN0BEAC1AgAh3gECAKcCACHfASAAtgIAIQIAAAAFACAXAADBAwAgAgAAALsDACAXAAC8AwAgEpoBAAC6AwAwmwEAALsDABCcAQAAugMAMJ0BAQDvAQAhngEBAO8BACGkAQAAtwLhASKlAUAA8gEAIaYBQADyAQAhugEBAO8BACHCARAAqwIAIdgBAQDvAQAh2QEBAO8BACHaAQEA7wEAIdsBAACuAgAg3AEAAJkCACDdARAAtQIAId4BAgCnAgAh3wEgALYCACESmgEAALoDADCbAQAAuwMAEJwBAAC6AwAwnQEBAO8BACGeAQEA7wEAIaQBAAC3AuEBIqUBQADyAQAhpgFAAPIBACG6AQEA7wEAIcIBEACrAgAh2AEBAO8BACHZAQEA7wEAIdoBAQDvAQAh2wEAAK4CACDcAQAAmQIAIN0BEAC1AgAh3gECAKcCACHfASAAtgIAIQ6dAQEAvAIAIZ4BAQC8AgAhpAEAAMAD4QEipQFAAL8CACGmAUAAvwIAIcIBEADnAgAh2AEBALwCACHZAQEAvAIAIdoBAQC8AgAh2wGAAAAAAdwBAAC9AwAg3QEQAL4DACHeAQIA1gIAId8BIAC_AwAhAu8BAQAAAAT2AQEAAAAFBe8BEAAAAAHyARAAAAAB8wEQAAAAAfQBEAAAAAH1ARAAAAABAe8BIAAAAAEB7wEAAADhAQIRCgAAxAMAIBAAAMIDACARAADDAwAgnQEBALwCACGeAQEAvAIAIaQBAADAA-EBIqUBQAC_AgAhpgFAAL8CACHCARAA5wIAIdgBAQC8AgAh2QEBALwCACHaAQEAvAIAIdsBgAAAAAHcAQAAvQMAIN0BEAC-AwAh3gECANYCACHfASAAvwMAIQUeAACoBAAgHwAAsgQAIOkBAACpBAAg6gEAALEEACDtAQAAAQAgCx4AAM4DADAfAADSAwAw6QEAAM8DADDqAQAA0AMAMOsBAACZAwAw7AEAAJkDADDtAQAAmQMAMO4BAADRAwAg7wEAAJkDADDwAQAA0wMAMPEBAACcAwAwCx4AAMUDADAfAADJAwAw6QEAAMYDADDqAQAAxwMAMOsBAADQAgAw7AEAANACADDtAQAA0AIAMO4BAADIAwAg7wEAANACADDwAQAAygMAMPEBAADTAgAwCQQAAIkDACAGAADcAgAgnQEBAAAAAaUBQAAAAAGmAUAAAAABtQEBAAAAAbcBAQAAAAG4AQIAAAABuQEBAAAAAQIAAAAWACAeAADNAwAgAwAAABYAIB4AAM0DACAfAADMAwAgARcAALAEADACAAAAFgAgFwAAzAMAIAIAAADUAgAgFwAAywMAIAedAQEAvAIAIaUBQAC_AgAhpgFAAL8CACG1AQEAvAIAIbcBAQC8AgAhuAECANYCACG5AQEAywIAIQkEAACHAwAgBgAA2QIAIJ0BAQC8AgAhpQFAAL8CACGmAUAAvwIAIbUBAQC8AgAhtwEBALwCACG4AQIA1gIAIbkBAQDLAgAhCQQAAIkDACAGAADcAgAgnQEBAAAAAaUBQAAAAAGmAUAAAAABtQEBAAAAAbcBAQAAAAG4AQIAAAABuQEBAAAAAQYGAADYAwAgnQEBAAAAAbcBAQAAAAHBAQIAAAABwgEQAAAAAcMBEAAAAAECAAAADgAgHgAA1wMAIAMAAAAOACAeAADXAwAgHwAA1QMAIAEXAACvBAAwAgAAAA4AIBcAANUDACACAAAAnQMAIBcAANQDACAFnQEBALwCACG3AQEAvAIAIcEBAgDWAgAhwgEQAOcCACHDARAA5wIAIQYGAADWAwAgnQEBALwCACG3AQEAvAIAIcEBAgDWAgAhwgEQAOcCACHDARAA5wIAIQUeAACqBAAgHwAArQQAIOkBAACrBAAg6gEAAKwEACDtAQAACgAgBgYAANgDACCdAQEAAAABtwEBAAAAAcEBAgAAAAHCARAAAAABwwEQAAAAAQMeAACqBAAg6QEAAKsEACDtAQAACgAgEQoAAN0DACAQAADbAwAgEQAA3AMAIJ0BAQAAAAGeAQEAAAABpAEAAADhAQKlAUAAAAABpgFAAAAAAcIBEAAAAAHYAQEAAAAB2QEBAAAAAdoBAQAAAAHbAYAAAAAB3AEAANoDACDdARAAAAAB3gECAAAAAd8BIAAAAAEB7wEBAAAABAMeAACoBAAg6QEAAKkEACDtAQAAAQAgBB4AAM4DADDpAQAAzwMAMO0BAACZAwAw7gEAANEDACAEHgAAxQMAMOkBAADGAwAw7QEAANACADDuAQAAyAMAIAQeAACzAwAw6QEAALQDADDtAQAAtwMAMO4BAAC2AwAgBB4AAKgDADDpAQAAqQMAMO0BAADzAgAw7gEAAKsDACAEHgAA7wIAMOkBAADwAgAw7QEAAPMCADDuAQAA8gIAIAQeAADdAgAw6QEAAN4CADDtAQAA4QIAMO4BAADgAgAgBB4AAMwCADDpAQAAzQIAMO0BAADQAgAw7gEAAM8CACADHgAAxgIAIOkBAADHAgAg7QEAAG0AIAAAAAAGDgAA_gMAIMUBAADpAwAgxgEAAOkDACDHAQAA6QMAIMgBAADpAwAgyQEAAOkDACAAAAAAAAAAAAAAAAAAAAAAAAAABR4AAKMEACAfAACmBAAg6QEAAKQEACDqAQAApQQAIO0BAADHAQAgAx4AAKMEACDpAQAApAQAIO0BAADHAQAgBgMAAOQDACAJAADmAwAgCgAA5wMAIAwAAOUDACANAADlAwAgDwAA6AMAIAAAAAAAAAAAAAAFHgAAngQAIB8AAKEEACDpAQAAnwQAIOoBAACgBAAg7QEAAMcBACADHgAAngQAIOkBAACfBAAg7QEAAMcBACAAAAALHgAAjwQAMB8AAJMEADDpAQAAkAQAMOoBAACRBAAw6wEAALcDADDsAQAAtwMAMO0BAAC3AwAw7gEAAJIEACDvAQAAtwMAMPABAACUBAAw8QEAALoDADARBQAAigQAIAoAAN0DACARAADcAwAgnQEBAAAAAZ4BAQAAAAGkAQAAAOEBAqUBQAAAAAGmAUAAAAABugEBAAAAAcIBEAAAAAHZAQEAAAAB2gEBAAAAAdsBgAAAAAHcAQAA2gMAIN0BEAAAAAHeAQIAAAAB3wEgAAAAAQIAAAAFACAeAACXBAAgAwAAAAUAIB4AAJcEACAfAACWBAAgARcAAJ0EADACAAAABQAgFwAAlgQAIAIAAAC7AwAgFwAAlQQAIA6dAQEAvAIAIZ4BAQC8AgAhpAEAAMAD4QEipQFAAL8CACGmAUAAvwIAIboBAQC8AgAhwgEQAOcCACHZAQEAvAIAIdoBAQC8AgAh2wGAAAAAAdwBAAC9AwAg3QEQAL4DACHeAQIA1gIAId8BIAC_AwAhEQUAAIkEACAKAADEAwAgEQAAwwMAIJ0BAQC8AgAhngEBALwCACGkAQAAwAPhASKlAUAAvwIAIaYBQAC_AgAhugEBALwCACHCARAA5wIAIdkBAQC8AgAh2gEBALwCACHbAYAAAAAB3AEAAL0DACDdARAAvgMAId4BAgDWAgAh3wEgAL8DACERBQAAigQAIAoAAN0DACARAADcAwAgnQEBAAAAAZ4BAQAAAAGkAQAAAOEBAqUBQAAAAAGmAUAAAAABugEBAAAAAcIBEAAAAAHZAQEAAAAB2gEBAAAAAdsBgAAAAAHcAQAA2gMAIN0BEAAAAAHeAQIAAAAB3wEgAAAAAQQeAACPBAAw6QEAAJAEADDtAQAAtwMAMO4BAACSBAAgBgUAAP4DACAKAADnAwAgEAAAnAQAIBEAAJsEACDbAQAA6QMAIN0BAADpAwAgBgQAAP4DACAFAAD-AwAgCAAAmwQAIAkAAOYDACAKAADnAwAgwAEAAOkDACAAAwMAAOQDACDaAQAA6QMAIOUBAADpAwAgDp0BAQAAAAGeAQEAAAABpAEAAADhAQKlAUAAAAABpgFAAAAAAboBAQAAAAHCARAAAAAB2QEBAAAAAdoBAQAAAAHbAYAAAAAB3AEAANoDACDdARAAAAAB3gECAAAAAd8BIAAAAAENCQAA4QMAIAoAAOIDACAMAADfAwAgDQAA4AMAIA8AAOMDACCdAQEAAAABngEBAAAAAZ8BAQAAAAGgAQEAAAABogEAAACiAQKkAQAAAKQBAqUBQAAAAAGmAUAAAAABAgAAAMcBACAeAACeBAAgAwAAAMoBACAeAACeBAAgHwAAogQAIA8AAADKAQAgCQAAwwIAIAoAAMQCACAMAADBAgAgDQAAwgIAIA8AAMUCACAXAACiBAAgnQEBALwCACGeAQEAvAIAIZ8BAQC8AgAhoAEBALwCACGiAQAAvQKiASKkAQAAvgKkASKlAUAAvwIAIaYBQAC_AgAhDQkAAMMCACAKAADEAgAgDAAAwQIAIA0AAMICACAPAADFAgAgnQEBALwCACGeAQEAvAIAIZ8BAQC8AgAhoAEBALwCACGiAQAAvQKiASKkAQAAvgKkASKlAUAAvwIAIaYBQAC_AgAhDQMAAN4DACAJAADhAwAgCgAA4gMAIAwAAN8DACANAADgAwAgnQEBAAAAAZ4BAQAAAAGfAQEAAAABoAEBAAAAAaIBAAAAogECpAEAAACkAQKlAUAAAAABpgFAAAAAAQIAAADHAQAgHgAAowQAIAMAAADKAQAgHgAAowQAIB8AAKcEACAPAAAAygEAIAMAAMACACAJAADDAgAgCgAAxAIAIAwAAMECACANAADCAgAgFwAApwQAIJ0BAQC8AgAhngEBALwCACGfAQEAvAIAIaABAQC8AgAhogEAAL0CogEipAEAAL4CpAEipQFAAL8CACGmAUAAvwIAIQ0DAADAAgAgCQAAwwIAIAoAAMQCACAMAADBAgAgDQAAwgIAIJ0BAQC8AgAhngEBALwCACGfAQEAvAIAIaABAQC8AgAhogEAAL0CogEipAEAAL4CpAEipQFAAL8CACGmAUAAvwIAIQedAQEAAAABngEBAAAAAaUBQAAAAAGmAUAAAAAB2gEBAAAAAeQBAQAAAAHlAQEAAAABAgAAAAEAIB4AAKgEACAPBAAApAMAIAUAALIDACAJAACmAwAgCgAApwMAIJ0BAQAAAAGkAQAAAMABAqUBQAAAAAGmAUAAAAABtQEBAAAAAboBAQAAAAG7AUAAAAABvAFAAAAAAb0BAgAAAAG-ARAAAAABwAEBAAAAAQIAAAAKACAeAACqBAAgAwAAAAgAIB4AAKoEACAfAACuBAAgEQAAAAgAIAQAAPsCACAFAACwAwAgCQAA_QIAIAoAAP4CACAXAACuBAAgnQEBALwCACGkAQAA-QLAASKlAUAAvwIAIaYBQAC_AgAhtQEBALwCACG6AQEAvAIAIbsBQAC_AgAhvAFAAL8CACG9AQIA1gIAIb4BEADnAgAhwAEBAMsCACEPBAAA-wIAIAUAALADACAJAAD9AgAgCgAA_gIAIJ0BAQC8AgAhpAEAAPkCwAEipQFAAL8CACGmAUAAvwIAIbUBAQC8AgAhugEBALwCACG7AUAAvwIAIbwBQAC_AgAhvQECANYCACG-ARAA5wIAIcABAQDLAgAhBZ0BAQAAAAG3AQEAAAABwQECAAAAAcIBEAAAAAHDARAAAAABB50BAQAAAAGlAUAAAAABpgFAAAAAAbUBAQAAAAG3AQEAAAABuAECAAAAAbkBAQAAAAEDAAAAKwAgHgAAqAQAIB8AALMEACAJAAAAKwAgFwAAswQAIJ0BAQC8AgAhngEBALwCACGlAUAAvwIAIaYBQAC_AgAh2gEBAMsCACHkAQEAvAIAIeUBAQDLAgAhB50BAQC8AgAhngEBALwCACGlAUAAvwIAIaYBQAC_AgAh2gEBAMsCACHkAQEAvAIAIeUBAQDLAgAhDp0BAQAAAAGeAQEAAAABpAEAAADhAQKlAUAAAAABpgFAAAAAAcIBEAAAAAHYAQEAAAAB2QEBAAAAAdoBAQAAAAHbAYAAAAAB3AEAANoDACDdARAAAAAB3gECAAAAAd8BIAAAAAENAwAA3gMAIAkAAOEDACAKAADiAwAgDAAA3wMAIA8AAOMDACCdAQEAAAABngEBAAAAAZ8BAQAAAAGgAQEAAAABogEAAACiAQKkAQAAAKQBAqUBQAAAAAGmAUAAAAABAgAAAMcBACAeAAC1BAAgAwAAAMoBACAeAAC1BAAgHwAAuQQAIA8AAADKAQAgAwAAwAIAIAkAAMMCACAKAADEAgAgDAAAwQIAIA8AAMUCACAXAAC5BAAgnQEBALwCACGeAQEAvAIAIZ8BAQC8AgAhoAEBALwCACGiAQAAvQKiASKkAQAAvgKkASKlAUAAvwIAIaYBQAC_AgAhDQMAAMACACAJAADDAgAgCgAAxAIAIAwAAMECACAPAADFAgAgnQEBALwCACGeAQEAvAIAIZ8BAQC8AgAhoAEBALwCACGiAQAAvQKiASKkAQAAvgKkASKlAUAAvwIAIaYBQAC_AgAhCp0BAQAAAAGkAQAAAMABAqUBQAAAAAGmAUAAAAABugEBAAAAAbsBQAAAAAG8AUAAAAABvQECAAAAAb4BEAAAAAHAAQEAAAABDQMAAN4DACAJAADhAwAgCgAA4gMAIA0AAOADACAPAADjAwAgnQEBAAAAAZ4BAQAAAAGfAQEAAAABoAEBAAAAAaIBAAAAogECpAEAAACkAQKlAUAAAAABpgFAAAAAAQIAAADHAQAgHgAAuwQAIBIFAACKBAAgCgAA3QMAIBAAANsDACCdAQEAAAABngEBAAAAAaQBAAAA4QECpQFAAAAAAaYBQAAAAAG6AQEAAAABwgEQAAAAAdgBAQAAAAHZAQEAAAAB2gEBAAAAAdsBgAAAAAHcAQAA2gMAIN0BEAAAAAHeAQIAAAAB3wEgAAAAAQIAAAAFACAeAAC9BAAgAwAAAAMAIB4AAL0EACAfAADBBAAgFAAAAAMAIAUAAIkEACAKAADEAwAgEAAAwgMAIBcAAMEEACCdAQEAvAIAIZ4BAQC8AgAhpAEAAMAD4QEipQFAAL8CACGmAUAAvwIAIboBAQC8AgAhwgEQAOcCACHYAQEAvAIAIdkBAQC8AgAh2gEBALwCACHbAYAAAAAB3AEAAL0DACDdARAAvgMAId4BAgDWAgAh3wEgAL8DACESBQAAiQQAIAoAAMQDACAQAADCAwAgnQEBALwCACGeAQEAvAIAIaQBAADAA-EBIqUBQAC_AgAhpgFAAL8CACG6AQEAvAIAIcIBEADnAgAh2AEBALwCACHZAQEAvAIAIdoBAQC8AgAh2wGAAAAAAdwBAAC9AwAg3QEQAL4DACHeAQIA1gIAId8BIAC_AwAhBZ0BAQAAAAG2AQEAAAABwQECAAAAAcIBEAAAAAHDARAAAAABDQMAAN4DACAKAADiAwAgDAAA3wMAIA0AAOADACAPAADjAwAgnQEBAAAAAZ4BAQAAAAGfAQEAAAABoAEBAAAAAaIBAAAAogECpAEAAACkAQKlAUAAAAABpgFAAAAAAQIAAADHAQAgHgAAwwQAIAMAAADKAQAgHgAAwwQAIB8AAMcEACAPAAAAygEAIAMAAMACACAKAADEAgAgDAAAwQIAIA0AAMICACAPAADFAgAgFwAAxwQAIJ0BAQC8AgAhngEBALwCACGfAQEAvAIAIaABAQC8AgAhogEAAL0CogEipAEAAL4CpAEipQFAAL8CACGmAUAAvwIAIQ0DAADAAgAgCgAAxAIAIAwAAMECACANAADCAgAgDwAAxQIAIJ0BAQC8AgAhngEBALwCACGfAQEAvAIAIaABAQC8AgAhogEAAL0CogEipAEAAL4CpAEipQFAAL8CACGmAUAAvwIAIQwFAAAAzwECnQEBAAAAAaQBAAAA0AECpQFAAAAAAaYBQAAAAAG1AQEAAAABygEBAAAAAcsBEAAAAAHMAQEAAAABzQEBAAAAAdABgAAAAAHRAUAAAAABDQMAAN4DACAJAADhAwAgDAAA3wMAIA0AAOADACAPAADjAwAgnQEBAAAAAZ4BAQAAAAGfAQEAAAABoAEBAAAAAaIBAAAAogECpAEAAACkAQKlAUAAAAABpgFAAAAAAQIAAADHAQAgHgAAyQQAIAMAAADKAQAgHgAAyQQAIB8AAM0EACAPAAAAygEAIAMAAMACACAJAADDAgAgDAAAwQIAIA0AAMICACAPAADFAgAgFwAAzQQAIJ0BAQC8AgAhngEBALwCACGfAQEAvAIAIaABAQC8AgAhogEAAL0CogEipAEAAL4CpAEipQFAAL8CACGmAUAAvwIAIQ0DAADAAgAgCQAAwwIAIAwAAMECACANAADCAgAgDwAAxQIAIJ0BAQC8AgAhngEBALwCACGfAQEAvAIAIaABAQC8AgAhogEAAL0CogEipAEAAL4CpAEipQFAAL8CACGmAUAAvwIAIQedAQEAAAABpQFAAAAAAaYBQAAAAAG1AQEAAAABtgEBAAAAAbgBAgAAAAG5AQEAAAABAwAAAMoBACAeAAC7BAAgHwAA0QQAIA8AAADKAQAgAwAAwAIAIAkAAMMCACAKAADEAgAgDQAAwgIAIA8AAMUCACAXAADRBAAgnQEBALwCACGeAQEAvAIAIZ8BAQC8AgAhoAEBALwCACGiAQAAvQKiASKkAQAAvgKkASKlAUAAvwIAIaYBQAC_AgAhDQMAAMACACAJAADDAgAgCgAAxAIAIA0AAMICACAPAADFAgAgnQEBALwCACGeAQEAvAIAIZ8BAQC8AgAhoAEBALwCACGiAQAAvQKiASKkAQAAvgKkASKlAUAAvwIAIaYBQAC_AgAhCp0BAQAAAAGkAQAAAMABAqUBQAAAAAGmAUAAAAABtQEBAAAAAbsBQAAAAAG8AUAAAAABvQECAAAAAb4BEAAAAAHAAQEAAAABDwQAAKQDACAFAACyAwAgCAAApQMAIAoAAKcDACCdAQEAAAABpAEAAADAAQKlAUAAAAABpgFAAAAAAbUBAQAAAAG6AQEAAAABuwFAAAAAAbwBQAAAAAG9AQIAAAABvgEQAAAAAcABAQAAAAECAAAACgAgHgAA0wQAIAMAAAAIACAeAADTBAAgHwAA1wQAIBEAAAAIACAEAAD7AgAgBQAAsAMAIAgAAPwCACAKAAD-AgAgFwAA1wQAIJ0BAQC8AgAhpAEAAPkCwAEipQFAAL8CACGmAUAAvwIAIbUBAQC8AgAhugEBALwCACG7AUAAvwIAIbwBQAC_AgAhvQECANYCACG-ARAA5wIAIcABAQDLAgAhDwQAAPsCACAFAACwAwAgCAAA_AIAIAoAAP4CACCdAQEAvAIAIaQBAAD5AsABIqUBQAC_AgAhpgFAAL8CACG1AQEAvAIAIboBAQC8AgAhuwFAAL8CACG8AUAAvwIAIb0BAgDWAgAhvgEQAOcCACHAAQEAywIAIQwFAAAAzwECnQEBAAAAAaQBAAAA0AECpQFAAAAAAaYBQAAAAAG3AQEAAAABygEBAAAAAcsBEAAAAAHMAQEAAAABzQEBAAAAAdABgAAAAAHRAUAAAAABDwQAAKQDACAFAACyAwAgCAAApQMAIAkAAKYDACCdAQEAAAABpAEAAADAAQKlAUAAAAABpgFAAAAAAbUBAQAAAAG6AQEAAAABuwFAAAAAAbwBQAAAAAG9AQIAAAABvgEQAAAAAcABAQAAAAECAAAACgAgHgAA2QQAIBIFAACKBAAgEAAA2wMAIBEAANwDACCdAQEAAAABngEBAAAAAaQBAAAA4QECpQFAAAAAAaYBQAAAAAG6AQEAAAABwgEQAAAAAdgBAQAAAAHZAQEAAAAB2gEBAAAAAdsBgAAAAAHcAQAA2gMAIN0BEAAAAAHeAQIAAAAB3wEgAAAAAQIAAAAFACAeAADbBAAgAwAAAAgAIB4AANkEACAfAADfBAAgEQAAAAgAIAQAAPsCACAFAACwAwAgCAAA_AIAIAkAAP0CACAXAADfBAAgnQEBALwCACGkAQAA-QLAASKlAUAAvwIAIaYBQAC_AgAhtQEBALwCACG6AQEAvAIAIbsBQAC_AgAhvAFAAL8CACG9AQIA1gIAIb4BEADnAgAhwAEBAMsCACEPBAAA-wIAIAUAALADACAIAAD8AgAgCQAA_QIAIJ0BAQC8AgAhpAEAAPkCwAEipQFAAL8CACGmAUAAvwIAIbUBAQC8AgAhugEBALwCACG7AUAAvwIAIbwBQAC_AgAhvQECANYCACG-ARAA5wIAIcABAQDLAgAhAwAAAAMAIB4AANsEACAfAADiBAAgFAAAAAMAIAUAAIkEACAQAADCAwAgEQAAwwMAIBcAAOIEACCdAQEAvAIAIZ4BAQC8AgAhpAEAAMAD4QEipQFAAL8CACGmAUAAvwIAIboBAQC8AgAhwgEQAOcCACHYAQEAvAIAIdkBAQC8AgAh2gEBALwCACHbAYAAAAAB3AEAAL0DACDdARAAvgMAId4BAgDWAgAh3wEgAL8DACESBQAAiQQAIBAAAMIDACARAADDAwAgnQEBALwCACGeAQEAvAIAIaQBAADAA-EBIqUBQAC_AgAhpgFAAL8CACG6AQEAvAIAIcIBEADnAgAh2AEBALwCACHZAQEAvAIAIdoBAQC8AgAh2wGAAAAAAdwBAAC9AwAg3QEQAL4DACHeAQIA1gIAId8BIAC_AwAhB50BAQAAAAGlAUAAAAABpgFAAAAAAbYBAQAAAAG3AQEAAAABuAECAAAAAbkBAQAAAAECAwYCCwAMBQUAAwomBwsACxAAARElBQcDBwIJHAYKHQcLAAoMCwQNGwQPHwkGBAADBQADCA8FCRMGChcHCwAIAgYABAcAAgIEAAMGAAQDBAADBgAEBwACAwgYAAkZAAoaAAEOAAMFAyAACSMACiQADCEADSIAAgooABEnAAEDKQAAAAADCwARJAASJQATAAAAAwsAESQAEiUAEwIFAAMQAAECBQADEAABBQsAGCQAGyUAHDYAGTcAGgAAAAAABQsAGCQAGyUAHDYAGTcAGgIEAAMGAAQCBAADBgAEBQsAISQAJCUAJTYAIjcAIwAAAAAABQsAISQAJCUAJTYAIjcAIwEOAAMBDgADAwsAKiQAKyUALAAAAAMLACokACslACwCBgAEBwACAgYABAcAAgULADEkADQlADU2ADI3ADMAAAAAAAULADEkADQlADU2ADI3ADMCBAADBQADAgQAAwUAAwULADokAD0lAD42ADs3ADwAAAAAAAULADokAD0lAD42ADs3ADwDBAADBgAEBwACAwQAAwYABAcAAgULAEMkAEYlAEc2AEQ3AEUAAAAAAAULAEMkAEYlAEc2AEQ3AEUAAAMLAEwkAE0lAE4AAAADCwBMJABNJQBOEgIBEyoBFC0BFS4BFi8BGDEBGTMNGjQOGzYBHDgNHTkPIDoBITsBIjwNJj8QJ0AUKEECKUICKkMCK0QCLEUCLUcCLkkNL0oVMEwCMU4NMk8WM1ACNFECNVINOFUXOVYdOlcGO1gGPFkGPVoGPlsGP10GQF8NQWAeQmIGQ2QNRGUfRWYGRmcGR2gNSGsgSWwmSm4JS28JTHEJTXIJTnMJT3UJUHcNUXgnUnoJU3wNVH0oVX4JVn8JV4ABDViDASlZhAEtWoUBBVuGAQVchwEFXYgBBV6JAQVfiwEFYI0BDWGOAS5ikAEFY5IBDWSTAS9llAEFZpUBBWeWAQ1omQEwaZoBNmqbAQRrnAEEbJ0BBG2eAQRunwEEb6EBBHCjAQ1xpAE3cqYBBHOoAQ10qQE4daoBBHarAQR3rAENeK8BOXmwAT96sQEHe7IBB3yzAQd9tAEHfrUBB3-3AQeAAbkBDYEBugFAggG8AQeDAb4BDYQBvwFBhQHAAQeGAcEBB4cBwgENiAHFAUKJAcYBSIoByAEDiwHJAQOMAcwBA40BzQEDjgHOAQOPAdABA5AB0gENkQHTAUmSAdUBA5MB1wENlAHYAUqVAdkBA5YB2gEDlwHbAQ2YAd4BS5kB3wFP"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AnyNull: () => AnyNull2,
  CategoryScalarFieldEnum: () => CategoryScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  GearItemScalarFieldEnum: () => GearItemScalarFieldEnum,
  JsonNull: () => JsonNull2,
  JsonNullValueFilter: () => JsonNullValueFilter,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullableJsonNullValueInput: () => NullableJsonNullValueInput,
  NullsOrder: () => NullsOrder,
  PaymentScalarFieldEnum: () => PaymentScalarFieldEnum,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  ProfileScalarFieldEnum: () => ProfileScalarFieldEnum,
  QueryMode: () => QueryMode,
  RentalItemScalarFieldEnum: () => RentalItemScalarFieldEnum,
  RentalOrderScalarFieldEnum: () => RentalOrderScalarFieldEnum,
  ReviewScalarFieldEnum: () => ReviewScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.10.1",
  engine: "d1b3f377ca835d73fd50954a5e22128b9ebdd6b8"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  Category: "Category",
  GearItem: "GearItem",
  Payment: "Payment",
  Profile: "Profile",
  RentalItem: "RentalItem",
  RentalOrder: "RentalOrder",
  Review: "Review",
  User: "User"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var CategoryScalarFieldEnum = {
  id: "id",
  name: "name",
  slug: "slug",
  description: "description",
  imageUrl: "imageUrl",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var GearItemScalarFieldEnum = {
  id: "id",
  providerId: "providerId",
  categoryId: "categoryId",
  name: "name",
  brand: "brand",
  description: "description",
  specifications: "specifications",
  images: "images",
  pricePerDay: "pricePerDay",
  securityDeposit: "securityDeposit",
  stockQuantity: "stockQuantity",
  isAvailable: "isAvailable",
  status: "status",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var PaymentScalarFieldEnum = {
  id: "id",
  transactionId: "transactionId",
  rentalOrderId: "rentalOrderId",
  customerId: "customerId",
  amount: "amount",
  currency: "currency",
  method: "method",
  provider: "provider",
  status: "status",
  gatewayResponse: "gatewayResponse",
  paidAt: "paidAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ProfileScalarFieldEnum = {
  id: "id",
  userId: "userId",
  profilePhoto: "profilePhoto",
  phone: "phone",
  address: "address",
  shopName: "shopName",
  shopAddress: "shopAddress",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var RentalItemScalarFieldEnum = {
  id: "id",
  rentalOrderId: "rentalOrderId",
  gearItemId: "gearItemId",
  quantity: "quantity",
  pricePerDay: "pricePerDay",
  subtotal: "subtotal"
};
var RentalOrderScalarFieldEnum = {
  id: "id",
  customerId: "customerId",
  providerId: "providerId",
  startDate: "startDate",
  endDate: "endDate",
  totalDays: "totalDays",
  totalAmount: "totalAmount",
  status: "status",
  notes: "notes",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ReviewScalarFieldEnum = {
  id: "id",
  customerId: "customerId",
  gearItemId: "gearItemId",
  rentalOrderId: "rentalOrderId",
  rating: "rating",
  comment: "comment",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  password: "password",
  role: "role",
  status: "status",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var NullableJsonNullValueInput = {
  DbNull: DbNull2,
  JsonNull: JsonNull2
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var JsonNullValueFilter = {
  DbNull: DbNull2,
  JsonNull: JsonNull2,
  AnyNull: AnyNull2
};
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/client.ts
globalThis["__dirname"] = path2.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/modules/user/user.service.ts
var registerUserIntoDB = async (payload) => {
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
  const hashedPassword = await bcrypt.hash(password, Number(config_default.bcrypt_salt_rounds));
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
          shopName: role === Role.PROVIDER ? shopName : void 0,
          shopAddress: role === Role.PROVIDER ? shopAddress : void 0
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
var getMyProfileFromDB = async (userId) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    omit: {
      password: true
    },
    include: {
      profile: true
    }
  });
  return user;
};
var updateMyProfileInDB = async (userId, role, payload) => {
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
            shopName: isProvider ? shopName : void 0,
            shopAddress: isProvider ? shopAddress : void 0
          },
          update: {
            profilePhoto,
            phone,
            address,
            // only providers can change shop details
            shopName: isProvider ? shopName : void 0,
            shopAddress: isProvider ? shopAddress : void 0
          }
        }
      }
    },
    omit: { password: true },
    include: { profile: true }
  });
  return updatedUser;
};
var userService = {
  registerUserIntoDB,
  getMyProfileFromDB,
  updateMyProfileInDB
};

// src/modules/user/user.controller.ts
var registerUser = catchAsync(async (req, res, next) => {
  const payload = req.body;
  const user = await userService.registerUserIntoDB(payload);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User registered successfully",
    data: { user }
  });
});
var getMyProfile = catchAsync(async (req, res, next) => {
  const profile = await userService.getMyProfileFromDB(req.user?.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User profile fetched successfully",
    data: { profile }
  });
});
var updateMyProfile = catchAsync(async (req, res, next) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const updatedProfile = await userService.updateMyProfileInDB(userId, role, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User profile updated successfully",
    data: { updatedProfile }
  });
});
var userController = {
  registerUser,
  getMyProfile,
  updateMyProfile
};

// src/utils/jwt.ts
import jwt from "jsonwebtoken";
var createToken = (payload, secret, expiresIn) => {
  const token = jwt.sign(
    payload,
    secret,
    {
      expiresIn
    }
  );
  return token;
};
var verifyToken = (token, secret) => {
  try {
    const verifiedToken = jwt.verify(token, secret);
    return {
      success: true,
      data: verifiedToken
    };
  } catch (error) {
    console.log("Token verification failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
};
var jwtUtils = {
  createToken,
  verifyToken
};

// src/middlewares/auth.ts
var auth = (...requiredRoles) => {
  return catchAsync(async (req, res, next) => {
    const token = req.cookies.accessToken ? req.cookies.accessToken : req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization?.split(" ")[1] : req.headers.authorization;
    if (!token) {
      throw new Error(
        "You are not logged in. Please log in to access this resource."
      );
    }
    const verifiedToken = jwtUtils.verifyToken(token, config_default.jwt_access_secret);
    if (!verifiedToken.success) {
      throw new Error(verifiedToken.error);
    }
    const { email, name, id, role } = verifiedToken.data;
    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new Error(
        "Forbidden. You don't have permission to access this resource."
      );
    }
    const user = await prisma.user.findUnique({
      where: {
        id,
        email,
        name,
        role
      }
    });
    if (!user) {
      throw new Error("User not found. Please log in again.");
    }
    if (user.status === "SUSPENDED") {
      throw new Error(
        "Your account has been suspended. Please contact support."
      );
    }
    req.user = {
      email,
      name,
      id,
      role
    };
    next();
  });
};

// src/modules/user/user.route.ts
var router = Router();
router.post("/register", userController.registerUser);
router.get("/me", auth(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER), userController.getMyProfile);
router.put("/my-profile", auth(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER), userController.updateMyProfile);
var userRoutes = router;

// src/modules/auth/auth.route.ts
import { Router as Router2 } from "express";

// src/modules/auth/auth.controller.ts
import httpStatus2 from "http-status";

// src/modules/auth/auth.service.ts
import bcrypt2 from "bcryptjs";
var loginUser = async (payload) => {
  const { email, password } = payload;
  const user = await prisma.user.findUniqueOrThrow({
    where: { email }
  });
  if (user.status === "SUSPENDED") {
    throw new Error("Your account has been suspended. Please contact support.");
  }
  const isPasswordMatched = await bcrypt2.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new Error("Password is incorrect");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config_default.jwt_access_secret,
    config_default.jwt_access_expires_in
  );
  const refreshToken3 = jwtUtils.createToken(
    jwtPayload,
    config_default.jwt_refresh_secret,
    config_default.jwt_refresh_expires_in
  );
  return {
    accessToken,
    refreshToken: refreshToken3
  };
};
var refreshToken = async (refreshToken3) => {
  const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken3, config_default.jwt_refresh_secret);
  if (!verifiedRefreshToken.success) {
    throw new Error(verifiedRefreshToken.error);
  }
  const { id } = verifiedRefreshToken.data;
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id
    }
  });
  if (user.status === "SUSPENDED") {
    throw new Error("Your account has been suspended. Please contact support.");
  }
  const jwtPayload = {
    id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config_default.jwt_access_secret,
    config_default.jwt_access_expires_in
  );
  return { accessToken };
};
var authService = {
  loginUser,
  refreshToken
};

// src/modules/auth/auth.controller.ts
var isProd = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
var cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax"
};
var loginUser2 = catchAsync(
  async (req, res, next) => {
    const payload = req.body;
    const { accessToken, refreshToken: refreshToken3 } = await authService.loginUser(payload);
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 1e3 * 60 * 60 * 24
      // 24 hour or 1 day
    });
    res.cookie("refreshToken", refreshToken3, {
      ...cookieOptions,
      maxAge: 1e3 * 60 * 60 * 24 * 7
      // 7 day
    });
    sendResponse(res, {
      success: true,
      statusCode: httpStatus2.OK,
      message: "User logged in successfully",
      data: { accessToken, refreshToken: refreshToken3 }
    });
  }
);
var refreshToken2 = catchAsync(
  async (req, res, next) => {
    const refreshToken3 = req.cookies.refreshToken;
    const { accessToken } = await authService.refreshToken(refreshToken3);
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 1e3 * 60 * 60 * 24
    });
    sendResponse(res, {
      success: true,
      statusCode: httpStatus2.OK,
      message: "Token Refreshed Successfully",
      data: {
        accessToken
      }
    });
  }
);
var logoutUser = catchAsync(
  async (req, res, next) => {
    const cookieOptions2 = {
      httpOnly: true,
      secure: false,
      sameSite: "none"
    };
    res.clearCookie("accessToken", cookieOptions2);
    res.clearCookie("refreshToken", cookieOptions2);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus2.OK,
      message: "User logged out successfully",
      data: null
    });
  }
);
var authController = {
  loginUser: loginUser2,
  refreshToken: refreshToken2,
  logoutUser
};

// src/modules/auth/auth.route.ts
var router2 = Router2();
router2.post("/login", authController.loginUser);
router2.post("/refresh-token", authController.refreshToken);
router2.post("/logout", authController.logoutUser);
var authRoutes = router2;

// src/middlewares/globalErrorHandler.ts
import httpStatus3 from "http-status";
var globalErrorHandler = (err, req, res, next) => {
  console.log("Error : ", err);
  let statusCode;
  let errorMessage = err.message || "Internal Server Error";
  let errorName = err.name || "Internal Server Error";
  if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    statusCode = httpStatus3.BAD_REQUEST;
    errorMessage = "You have provided incorrect field type or missing fields";
  } else if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = httpStatus3.BAD_REQUEST, errorMessage = "Duplicate Key Error";
    } else if (err.code === "P2003") {
      statusCode = httpStatus3.BAD_REQUEST, errorMessage = "Foreign key constraint failed";
    } else if (err.code === "P2025") {
      statusCode = httpStatus3.BAD_REQUEST, errorMessage = "An operation failed because it depends on one or more records that were required but not found.";
    }
  } else if (err instanceof prismaNamespace_exports.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = httpStatus3.UNAUTHORIZED;
      errorMessage = "Authentication failed against database server. Please Check Your Credentials";
    } else if (err.errorCode === "P1001") {
      statusCode = httpStatus3.BAD_REQUEST;
      errorMessage = "Can't reach database server";
    }
  } else if (err instanceof prismaNamespace_exports.PrismaClientUnknownRequestError) {
    statusCode = httpStatus3.INTERNAL_SERVER_ERROR;
    errorMessage = "Error occurred during query execution";
  }
  res.status(httpStatus3.INTERNAL_SERVER_ERROR).json({
    success: false,
    statusCode: statusCode || httpStatus3.INTERNAL_SERVER_ERROR,
    name: errorName,
    message: errorMessage,
    error: err.stack
  });
};

// src/middlewares/notFound.ts
var notFound = (req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
    date: /* @__PURE__ */ new Date()
  });
};

// src/modules/provider/provider.route.ts
import { Router as Router3 } from "express";

// src/modules/provider/provider.controller.ts
import httpStatus4 from "http-status";

// src/modules/provider/provider.service.ts
var validateGearNumbers = (payload) => {
  const { pricePerDay, securityDeposit, stockQuantity } = payload;
  if (pricePerDay !== void 0 && (typeof pricePerDay !== "number" || pricePerDay <= 0)) {
    throw new Error("pricePerDay must be a number greater than 0");
  }
  if (securityDeposit !== void 0 && (typeof securityDeposit !== "number" || securityDeposit < 0)) {
    throw new Error("securityDeposit must be a number of 0 or more");
  }
  if (stockQuantity !== void 0 && (!Number.isInteger(stockQuantity) || stockQuantity < 0)) {
    throw new Error("stockQuantity must be a whole number of 0 or more");
  }
};
var checkCategoryExist = async (categoryId) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId }
  });
  if (!category) {
    throw new Error("Category not found");
  }
};
var getOwnGearOrThrow = async (providerId, gearId) => {
  const gear = await prisma.gearItem.findUniqueOrThrow({
    where: { id: gearId }
  });
  if (gear.providerId !== providerId) {
    throw new Error("Forbidden. You can manage only your own gear");
  }
  return gear;
};
var addGearIntoDB = async (providerId, payload) => {
  const {
    name,
    brand,
    description,
    categoryId,
    specifications,
    images,
    pricePerDay,
    securityDeposit,
    stockQuantity,
    isAvailable
  } = payload;
  if (!name || !brand || !description || !categoryId || pricePerDay === void 0) {
    throw new Error("name, brand, description, categoryId and pricePerDay are required");
  }
  validateGearNumbers(payload);
  await checkCategoryExist(categoryId);
  const gear = await prisma.gearItem.create({
    data: {
      providerId,
      categoryId,
      name,
      brand,
      description,
      specifications,
      images: images ?? [],
      pricePerDay,
      securityDeposit,
      stockQuantity,
      isAvailable
    },
    include: {
      category: true
    }
  });
  return gear;
};
var updateGearInDB = async (providerId, gearId, payload) => {
  await getOwnGearOrThrow(providerId, gearId);
  const {
    name,
    brand,
    description,
    categoryId,
    specifications,
    images,
    pricePerDay,
    securityDeposit,
    stockQuantity,
    isAvailable
  } = payload;
  validateGearNumbers(payload);
  if (categoryId) {
    await checkCategoryExist(categoryId);
  }
  const updatedGear = await prisma.gearItem.update({
    where: { id: gearId },
    data: {
      name,
      brand,
      description,
      categoryId,
      specifications,
      images,
      pricePerDay,
      securityDeposit,
      stockQuantity,
      isAvailable
    },
    include: {
      category: true
    }
  });
  return updatedGear;
};
var deleteGearFromDB = async (providerId, gearId) => {
  await getOwnGearOrThrow(providerId, gearId);
  const rentalCount = await prisma.rentalItem.count({
    where: { gearItemId: gearId }
  });
  if (rentalCount > 0) {
    await prisma.gearItem.update({
      where: { id: gearId },
      data: {
        isAvailable: false,
        status: "HIDDEN"
      }
    });
    return { id: gearId, mode: "hidden" };
  }
  await prisma.gearItem.delete({
    where: { id: gearId }
  });
  return { id: gearId, mode: "deleted" };
};
var PROVIDER_STATUS_FLOW = {
  [RentalStatus.PLACED]: RentalStatus.CONFIRMED,
  [RentalStatus.PAID]: RentalStatus.PICKED_UP,
  [RentalStatus.PICKED_UP]: RentalStatus.RETURNED
};
var getProviderOrdersFromDB = async (providerId, query) => {
  const { status } = query;
  if (status && !Object.values(RentalStatus).includes(status)) {
    throw new Error("Invalid status filter");
  }
  const orders = await prisma.rentalOrder.findMany({
    where: {
      providerId,
      status
    },
    orderBy: { createdAt: "desc" },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: { select: { phone: true, address: true } }
        }
      },
      items: {
        include: { gearItem: { select: { id: true, name: true, images: true } } }
      },
      payments: {
        select: { id: true, status: true, amount: true, provider: true, paidAt: true }
      }
    }
  });
  return orders;
};
var updateOrderStatusInDB = async (providerId, orderId, status) => {
  const allowedStatuses = [
    RentalStatus.CONFIRMED,
    RentalStatus.PICKED_UP,
    RentalStatus.RETURNED
  ];
  if (!status || !allowedStatuses.includes(status)) {
    throw new Error("Status must be one of CONFIRMED, PICKED_UP or RETURNED");
  }
  const order = await prisma.rentalOrder.findUniqueOrThrow({
    where: { id: orderId }
  });
  if (order.providerId !== providerId) {
    throw new Error("Forbidden. You can manage only your own orders");
  }
  if (PROVIDER_STATUS_FLOW[order.status] !== status) {
    throw new Error(`Invalid status change: ${order.status} -> ${status}`);
  }
  const updatedOrder = await prisma.rentalOrder.update({
    where: { id: orderId },
    data: { status },
    include: {
      items: { include: { gearItem: { select: { id: true, name: true } } } }
    }
  });
  return updatedOrder;
};
var providerService = {
  addGearIntoDB,
  updateGearInDB,
  deleteGearFromDB,
  getProviderOrdersFromDB,
  updateOrderStatusInDB
};

// src/modules/provider/provider.controller.ts
var addGear = catchAsync(async (req, res, next) => {
  const providerId = req.user?.id;
  const gear = await providerService.addGearIntoDB(providerId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus4.CREATED,
    message: "Gear added successfully",
    data: { gear }
  });
});
var updateGear = catchAsync(async (req, res, next) => {
  const providerId = req.user?.id;
  const gearId = req.params.id;
  const gear = await providerService.updateGearInDB(providerId, gearId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus4.OK,
    message: "Gear updated successfully",
    data: { gear }
  });
});
var deleteGear = catchAsync(async (req, res, next) => {
  const providerId = req.user?.id;
  const gearId = req.params.id;
  const result = await providerService.deleteGearFromDB(providerId, gearId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus4.OK,
    message: result.mode === "deleted" ? "Gear deleted successfully" : "Gear has rental history, so it was hidden instead of deleted",
    data: result
  });
});
var getProviderOrders = catchAsync(async (req, res, next) => {
  const providerId = req.user?.id;
  const orders = await providerService.getProviderOrdersFromDB(providerId, req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus4.OK,
    message: "Orders fetched successfully",
    data: { orders }
  });
});
var updateOrderStatus = catchAsync(async (req, res, next) => {
  const providerId = req.user?.id;
  const orderId = req.params.id;
  const order = await providerService.updateOrderStatusInDB(providerId, orderId, req.body.status);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus4.OK,
    message: `Order status updated to ${order.status}`,
    data: { order }
  });
});
var providerController = {
  addGear,
  updateGear,
  deleteGear,
  getProviderOrders,
  updateOrderStatus
};

// src/modules/provider/provider.route.ts
var router3 = Router3();
router3.post("/gear", auth(Role.PROVIDER), providerController.addGear);
router3.put("/gear/:id", auth(Role.PROVIDER), providerController.updateGear);
router3.delete("/gear/:id", auth(Role.PROVIDER), providerController.deleteGear);
router3.get("/orders", auth(Role.PROVIDER), providerController.getProviderOrders);
router3.patch("/orders/:id", auth(Role.PROVIDER), providerController.updateOrderStatus);
var providerRoutes = router3;

// src/modules/gear/gear.route.ts
import { Router as Router4 } from "express";

// src/modules/gear/gear.controller.ts
import httpStatus5 from "http-status";

// src/modules/gear/gear.service.ts
var ALLOWED_SORT_FIELDS = ["pricePerDay", "createdAt", "name"];
var toNumber = (value) => {
  if (value === void 0 || value === "") return void 0;
  const num = Number(value);
  return Number.isNaN(num) ? void 0 : num;
};
var publicVisibilityFilter = {
  status: GearStatus.ACTIVE,
  provider: { status: UserStatus.ACTIVE }
};
var providerSelect = {
  select: {
    id: true,
    name: true,
    profile: {
      select: {
        shopName: true,
        shopAddress: true
      }
    }
  }
};
var getAllGearFromDB = async (query) => {
  const { searchTerm, category, brand, available, sortBy, sortOrder } = query;
  const minPrice = toNumber(query.minPrice);
  const maxPrice = toNumber(query.maxPrice);
  if (minPrice !== void 0 && maxPrice !== void 0 && minPrice > maxPrice) {
    throw new Error("minPrice can't be greater than maxPrice");
  }
  const page = Math.max(toNumber(query.page) ?? 1, 1);
  const limit = Math.min(Math.max(toNumber(query.limit) ?? 10, 1), 50);
  const skip = (page - 1) * limit;
  const orderField = sortBy && ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
  const orderDirection = sortOrder === "asc" ? "asc" : "desc";
  const andConditions = [publicVisibilityFilter];
  if (searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { brand: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } }
      ]
    });
  }
  if (category) {
    andConditions.push({
      category: {
        OR: [{ id: category }, { slug: category }]
      }
    });
  }
  if (brand) {
    andConditions.push({
      brand: { equals: brand, mode: "insensitive" }
    });
  }
  if (minPrice !== void 0 || maxPrice !== void 0) {
    andConditions.push({
      pricePerDay: {
        gte: minPrice,
        lte: maxPrice
      }
    });
  }
  if (available === "true") {
    andConditions.push({ isAvailable: true, stockQuantity: { gt: 0 } });
  } else if (available === "false") {
    andConditions.push({
      OR: [{ isAvailable: false }, { stockQuantity: { lte: 0 } }]
    });
  }
  const where = { AND: andConditions };
  const [gears, total] = await Promise.all([
    prisma.gearItem.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [orderField]: orderDirection },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        provider: providerSelect
      }
    }),
    prisma.gearItem.count({ where })
  ]);
  const ratings = await prisma.review.groupBy({
    by: ["gearItemId"],
    where: { gearItemId: { in: gears.map((gear) => gear.id) } },
    _avg: { rating: true },
    _count: { rating: true }
  });
  const ratingMap = new Map(ratings.map((r) => [r.gearItemId, r]));
  const data = gears.map((gear) => {
    const rating = ratingMap.get(gear.id);
    return {
      ...gear,
      averageRating: rating?._avg.rating ? Math.round(rating._avg.rating * 10) / 10 : 0,
      totalReviews: rating?._count.rating ?? 0
    };
  });
  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit)
    },
    gears: data
  };
};
var getGearByIdFromDB = async (gearId) => {
  const gear = await prisma.gearItem.findFirst({
    where: {
      id: gearId,
      ...publicVisibilityFilter
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      provider: providerSelect,
      reviews: {
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          customer: {
            select: {
              name: true,
              profile: { select: { profilePhoto: true } }
            }
          }
        }
      }
    }
  });
  if (!gear) {
    throw new Error("Gear not found");
  }
  const rating = await prisma.review.aggregate({
    where: { gearItemId: gearId },
    _avg: { rating: true },
    _count: { rating: true }
  });
  return {
    ...gear,
    averageRating: rating._avg.rating ? Math.round(rating._avg.rating * 10) / 10 : 0,
    totalReviews: rating._count.rating
  };
};
var gearService = {
  getAllGearFromDB,
  getGearByIdFromDB
};

// src/modules/gear/gear.controller.ts
var getAllGear = catchAsync(async (req, res, next) => {
  const result = await gearService.getAllGearFromDB(req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus5.OK,
    message: "Gear fetched successfully",
    data: result
  });
});
var getGearById = catchAsync(async (req, res, next) => {
  const gearId = req.params.id;
  const gear = await gearService.getGearByIdFromDB(gearId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus5.OK,
    message: "Gear details fetched successfully",
    data: { gear }
  });
});
var gearController = {
  getAllGear,
  getGearById
};

// src/modules/gear/gear.route.ts
var router4 = Router4();
router4.get("/", gearController.getAllGear);
router4.get("/:id", gearController.getGearById);
var gearRoutes = router4;

// src/modules/rental/rental.route.ts
import { Router as Router5 } from "express";

// src/modules/rental/rental.controller.ts
import httpStatus6 from "http-status";

// src/modules/rental/rental.service.ts
var STOCK_HOLDING_STATUSES = [
  RentalStatus.PLACED,
  RentalStatus.CONFIRMED,
  RentalStatus.PAID,
  RentalStatus.PICKED_UP
];
var DAY_MS = 24 * 60 * 60 * 1e3;
var toDateOnly = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date. Use the format YYYY-MM-DD");
  }
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};
var round2 = (value) => Math.round(value * 100) / 100;
var orderInclude = {
  items: {
    include: {
      gearItem: {
        select: { id: true, name: true, brand: true, images: true }
      }
    }
  },
  provider: {
    select: {
      id: true,
      name: true,
      profile: { select: { shopName: true, shopAddress: true, phone: true } }
    }
  }
};
var createRentalOrderIntoDB = async (customerId, payload) => {
  const { items, startDate, endDate, notes } = payload;
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("At least one item is required");
  }
  if (!startDate || !endDate) {
    throw new Error("startDate and endDate are required");
  }
  for (const item of items) {
    if (!item.gearItemId || !Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new Error("Each item needs a gearItemId and a quantity of 1 or more");
    }
  }
  const gearIds = items.map((item) => item.gearItemId);
  if (new Set(gearIds).size !== gearIds.length) {
    throw new Error("The same gear can't be added twice. Increase the quantity instead");
  }
  const start = toDateOnly(startDate);
  const end = toDateOnly(endDate);
  const today = toDateOnly((/* @__PURE__ */ new Date()).toISOString());
  if (start < today) {
    throw new Error("Start date can't be in the past");
  }
  if (end < start) {
    throw new Error("End date can't be before start date");
  }
  const totalDays = Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;
  const order = await prisma.$transaction(async (tx) => {
    const gears = await tx.gearItem.findMany({
      where: { id: { in: gearIds } },
      include: { provider: { select: { status: true } } }
    });
    if (gears.length !== gearIds.length) {
      throw new Error("One or more gear items were not found");
    }
    const providerId = gears[0].providerId;
    let totalAmount = 0;
    const orderItems = [];
    for (const item of items) {
      const gear = gears.find((g) => g.id === item.gearItemId);
      if (gear.status !== GearStatus.ACTIVE || !gear.isAvailable || gear.provider.status !== UserStatus.ACTIVE) {
        throw new Error(`"${gear.name}" is not available for rent`);
      }
      if (gear.providerId !== providerId) {
        throw new Error("All items in one order must be from the same provider");
      }
      const booked = await tx.rentalItem.aggregate({
        _sum: { quantity: true },
        where: {
          gearItemId: gear.id,
          rentalOrder: {
            status: { in: STOCK_HOLDING_STATUSES },
            startDate: { lte: end },
            endDate: { gte: start }
          }
        }
      });
      const available = gear.stockQuantity - (booked._sum.quantity ?? 0);
      if (item.quantity > available) {
        throw new Error(
          `Only ${Math.max(available, 0)} unit(s) of "${gear.name}" available for the selected dates`
        );
      }
      const pricePerDay = Number(gear.pricePerDay);
      const subtotal = round2(pricePerDay * item.quantity * totalDays);
      totalAmount += subtotal;
      orderItems.push({
        gearItemId: gear.id,
        quantity: item.quantity,
        pricePerDay,
        subtotal
      });
    }
    return tx.rentalOrder.create({
      data: {
        customerId,
        providerId,
        startDate: start,
        endDate: end,
        totalDays,
        totalAmount: round2(totalAmount),
        notes,
        items: { create: orderItems }
      },
      include: orderInclude
    });
  });
  return order;
};
var getMyRentalOrdersFromDB = async (customerId, query) => {
  const { status } = query;
  if (status && !Object.values(RentalStatus).includes(status)) {
    throw new Error("Invalid status filter");
  }
  const orders = await prisma.rentalOrder.findMany({
    where: {
      customerId,
      status
    },
    orderBy: { createdAt: "desc" },
    include: orderInclude
  });
  return orders;
};
var getRentalOrderByIdFromDB = async (customerId, orderId) => {
  const order = await prisma.rentalOrder.findFirst({
    where: { id: orderId, customerId },
    include: {
      ...orderInclude,
      payments: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          transactionId: true,
          amount: true,
          provider: true,
          status: true,
          paidAt: true,
          createdAt: true
        }
      },
      reviews: {
        select: { id: true, gearItemId: true, rating: true, comment: true }
      }
    }
  });
  if (!order) {
    throw new Error("Rental order not found");
  }
  return order;
};
var cancelRentalOrderInDB = async (customerId, orderId) => {
  const order = await prisma.rentalOrder.findFirst({
    where: { id: orderId, customerId }
  });
  if (!order) {
    throw new Error("Rental order not found");
  }
  if (order.status !== RentalStatus.PLACED) {
    throw new Error(`Only PLACED orders can be cancelled. Current status: ${order.status}`);
  }
  const cancelledOrder = await prisma.rentalOrder.update({
    where: { id: orderId },
    data: { status: RentalStatus.CANCELLED },
    include: orderInclude
  });
  return cancelledOrder;
};
var rentalService = {
  createRentalOrderIntoDB,
  getMyRentalOrdersFromDB,
  getRentalOrderByIdFromDB,
  cancelRentalOrderInDB
};

// src/modules/rental/rental.controller.ts
var createRental = catchAsync(async (req, res, next) => {
  const customerId = req.user?.id;
  const order = await rentalService.createRentalOrderIntoDB(customerId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus6.CREATED,
    message: "Rental order placed successfully",
    data: { order }
  });
});
var getMyRentals = catchAsync(async (req, res, next) => {
  const customerId = req.user?.id;
  const orders = await rentalService.getMyRentalOrdersFromDB(customerId, req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus6.OK,
    message: "Rental orders fetched successfully",
    data: { orders }
  });
});
var getRentalById = catchAsync(async (req, res, next) => {
  const customerId = req.user?.id;
  const orderId = req.params.id;
  const order = await rentalService.getRentalOrderByIdFromDB(customerId, orderId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus6.OK,
    message: "Rental order fetched successfully",
    data: { order }
  });
});
var cancelRental = catchAsync(async (req, res, next) => {
  const customerId = req.user?.id;
  const orderId = req.params.id;
  const order = await rentalService.cancelRentalOrderInDB(customerId, orderId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus6.OK,
    message: "Rental order cancelled successfully",
    data: { order }
  });
});
var rentalController = {
  createRental,
  getMyRentals,
  getRentalById,
  cancelRental
};

// src/modules/rental/rental.route.ts
var router5 = Router5();
router5.post("/", auth(Role.CUSTOMER), rentalController.createRental);
router5.get("/", auth(Role.CUSTOMER), rentalController.getMyRentals);
router5.get("/:id", auth(Role.CUSTOMER), rentalController.getRentalById);
router5.patch("/:id/cancel", auth(Role.CUSTOMER), rentalController.cancelRental);
var rentalRoutes = router5;

// src/modules/payment/payment.route.ts
import { Router as Router6 } from "express";

// src/modules/payment/payment.controller.ts
import httpStatus7 from "http-status";

// src/lib/stripe.ts
import Stripe from "stripe";
var stripe = new Stripe(config_default.stripe_secret_key);

// src/modules/payment/payment.service.ts
import crypto from "crypto";
import SSLCommerzPayment from "sslcommerz-lts";
var STRIPE_CURRENCY = "usd";
var SSLCOMMERZ_CURRENCY = "BDT";
var getSslcommerz = () => new SSLCommerzPayment(
  config_default.sslcommerz_store_id,
  config_default.sslcommerz_store_password,
  config_default.sslcommerz_is_live === "true"
);
var completePayment = async (transactionId, method, gatewayResponse) => {
  const payment = await prisma.payment.findUniqueOrThrow({
    where: { transactionId }
  });
  if (payment.status === PaymentStatus.COMPLETED) {
    return payment;
  }
  return prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.COMPLETED,
        paidAt: /* @__PURE__ */ new Date(),
        method,
        gatewayResponse
      }
    });
    await tx.rentalOrder.updateMany({
      where: { id: payment.rentalOrderId, status: RentalStatus.CONFIRMED },
      data: { status: RentalStatus.PAID }
    });
    return updatedPayment;
  });
};
var failPayment = async (transactionId, gatewayResponse) => {
  await prisma.payment.updateMany({
    where: { transactionId, status: PaymentStatus.PENDING },
    data: { status: PaymentStatus.FAILED, gatewayResponse }
  });
};
var createPaymentIntoDB = async (customer, payload) => {
  const { rentalOrderId, provider } = payload;
  if (!rentalOrderId || !provider) {
    throw new Error("rentalOrderId and provider are required");
  }
  if (provider !== PaymentProvider.STRIPE && provider !== PaymentProvider.SSLCOMMERZ) {
    throw new Error("Invalid payment provider. Use STRIPE or SSLCOMMERZ");
  }
  const order = await prisma.rentalOrder.findFirst({
    where: { id: rentalOrderId, customerId: customer.id },
    include: {
      items: { include: { gearItem: { select: { name: true } } } }
    }
  });
  if (!order) {
    throw new Error("Rental order not found");
  }
  if (order.status !== RentalStatus.CONFIRMED) {
    throw new Error(`Payment is allowed only for CONFIRMED orders. Current status: ${order.status}`);
  }
  const amount = Number(order.totalAmount);
  const transactionId = `GEARUP-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const payment = await prisma.payment.create({
    data: {
      transactionId,
      rentalOrderId: order.id,
      customerId: customer.id,
      amount,
      currency: provider === PaymentProvider.STRIPE ? STRIPE_CURRENCY.toUpperCase() : SSLCOMMERZ_CURRENCY,
      provider,
      status: PaymentStatus.PENDING
    }
  });
  try {
    if (provider === PaymentProvider.STRIPE) {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: customer.email,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: STRIPE_CURRENCY,
              unit_amount: Math.round(amount * 100),
              product_data: {
                name: `GearUp rental order #${order.id}`,
                description: order.items.map((item) => item.gearItem.name).join(", ")
              }
            }
          }
        ],
        metadata: { transactionId, rentalOrderId: order.id },
        success_url: `${config_default.app_url}/payment/success?transactionId=${transactionId}`,
        cancel_url: `${config_default.app_url}/payment/cancel?transactionId=${transactionId}`
      });
      await prisma.payment.update({
        where: { id: payment.id },
        data: { gatewayResponse: { sessionId: session.id } }
      });
      return { paymentUrl: session.url, transactionId, provider };
    }
    const profile = await prisma.profile.findUnique({
      where: { userId: customer.id }
    });
    const sslcz = getSslcommerz();
    const apiResponse = await sslcz.init({
      total_amount: amount,
      currency: SSLCOMMERZ_CURRENCY,
      tran_id: transactionId,
      success_url: `${config_default.server_url}/api/payments/sslcommerz/success`,
      fail_url: `${config_default.server_url}/api/payments/sslcommerz/fail`,
      cancel_url: `${config_default.server_url}/api/payments/sslcommerz/cancel`,
      shipping_method: "NO",
      product_name: `GearUp rental order #${order.id}`,
      product_category: "Rental",
      product_profile: "general",
      cus_name: customer.name,
      cus_email: customer.email,
      cus_add1: profile?.address ?? "N/A",
      cus_city: "Chattogram",
      cus_postcode: "4000",
      cus_country: "Bangladesh",
      cus_phone: profile?.phone ?? "01700000000"
    });
    if (!apiResponse?.GatewayPageURL) {
      throw new Error("Failed to start SSLCommerz payment session");
    }
    return { paymentUrl: apiResponse.GatewayPageURL, transactionId, provider };
  } catch (error) {
    await failPayment(transactionId, { error: error.message });
    throw error;
  }
};
var handleStripeEvent = async (event) => {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const transactionId = session.metadata?.transactionId;
      if (!transactionId || session.payment_status !== "paid") {
        return;
      }
      const payment = await prisma.payment.findUnique({ where: { transactionId } });
      if (!payment) {
        return;
      }
      if (session.amount_total !== Math.round(Number(payment.amount) * 100)) {
        await failPayment(transactionId, { reason: "Amount mismatch", sessionId: session.id });
        return;
      }
      await completePayment(transactionId, session.payment_method_types?.[0] ?? "card", {
        sessionId: session.id,
        paymentIntent: session.payment_intent
      });
      break;
    }
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      const session = event.data.object;
      const transactionId = session.metadata?.transactionId;
      if (transactionId) {
        await failPayment(transactionId, { sessionId: session.id, event: event.type });
      }
      break;
    }
    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }
};
var handleSslcommerzSuccess = async (body) => {
  const { tran_id, val_id } = body;
  if (!tran_id || !val_id) {
    throw new Error("tran_id and val_id are required");
  }
  const payment = await prisma.payment.findUniqueOrThrow({
    where: { transactionId: tran_id }
  });
  if (payment.status === PaymentStatus.COMPLETED) {
    return { transactionId: tran_id, success: true };
  }
  const sslcz = getSslcommerz();
  const validation = await sslcz.validate({ val_id });
  const isValid = (validation?.status === "VALID" || validation?.status === "VALIDATED") && validation?.tran_id === tran_id && Number(validation?.amount) === Number(payment.amount);
  if (!isValid) {
    await failPayment(tran_id, validation);
    return { transactionId: tran_id, success: false };
  }
  await completePayment(tran_id, validation.card_type ?? "sslcommerz", validation);
  return { transactionId: tran_id, success: true };
};
var handleSslcommerzFailure = async (body) => {
  const { tran_id } = body;
  if (tran_id) {
    await failPayment(tran_id, body);
  }
  return { transactionId: tran_id };
};
var confirmStripePaymentInDB = async (customerId, transactionId) => {
  if (!transactionId) {
    throw new Error("transactionId is required");
  }
  const payment = await prisma.payment.findFirst({
    where: { transactionId, customerId }
  });
  if (!payment) {
    throw new Error("Payment not found");
  }
  if (payment.provider !== PaymentProvider.STRIPE) {
    throw new Error("This payment was not made with Stripe");
  }
  if (payment.status === PaymentStatus.COMPLETED) {
    return { transactionId, status: payment.status };
  }
  const sessionId = payment.gatewayResponse?.sessionId;
  if (!sessionId) {
    throw new Error("Stripe session not found for this payment");
  }
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    throw new Error("Payment has not been completed on Stripe yet");
  }
  if (session.amount_total !== Math.round(Number(payment.amount) * 100)) {
    await failPayment(transactionId, { reason: "Amount mismatch", sessionId });
    throw new Error("Payment amount mismatch");
  }
  const completedPayment = await completePayment(
    transactionId,
    session.payment_method_types?.[0] ?? "card",
    { sessionId, paymentIntent: session.payment_intent }
  );
  return { transactionId, status: completedPayment.status };
};
var getMyPaymentsFromDB = async (customerId) => {
  const payments = await prisma.payment.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    omit: { gatewayResponse: true },
    include: {
      rentalOrder: {
        select: { id: true, status: true, totalAmount: true, startDate: true, endDate: true }
      }
    }
  });
  return payments;
};
var getPaymentByIdFromDB = async (customerId, paymentId) => {
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, customerId },
    omit: { gatewayResponse: true },
    include: {
      rentalOrder: {
        include: {
          items: { include: { gearItem: { select: { id: true, name: true, images: true } } } }
        }
      }
    }
  });
  if (!payment) {
    throw new Error("Payment not found");
  }
  return payment;
};
var paymentService = {
  createPaymentIntoDB,
  confirmStripePaymentInDB,
  handleStripeEvent,
  handleSslcommerzSuccess,
  handleSslcommerzFailure,
  getMyPaymentsFromDB,
  getPaymentByIdFromDB
};

// src/modules/payment/payment.controller.ts
var createPayment = catchAsync(async (req, res, next) => {
  const customer = {
    id: req.user?.id,
    name: req.user?.name,
    email: req.user?.email
  };
  const result = await paymentService.createPaymentIntoDB(customer, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus7.CREATED,
    message: "Payment session created successfully",
    data: result
  });
});
var confirmStripePayment = catchAsync(async (req, res, next) => {
  const customerId = req.user?.id;
  const result = await paymentService.confirmStripePaymentInDB(customerId, req.body.transactionId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus7.OK,
    message: "Payment confirmed successfully",
    data: result
  });
});
var stripeWebhook = catchAsync(async (req, res, next) => {
  const signature = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      config_default.stripe_webhook_secret
    );
  } catch (error) {
    return res.status(httpStatus7.BAD_REQUEST).json({
      success: false,
      message: `Webhook signature verification failed: ${error.message}`
    });
  }
  await paymentService.handleStripeEvent(event);
  res.status(httpStatus7.OK).json({ received: true });
});
var sslcommerzSuccess = catchAsync(async (req, res, next) => {
  const result = await paymentService.handleSslcommerzSuccess(req.body);
  res.redirect(
    `${config_default.app_url}/payment/${result.success ? "success" : "failed"}?transactionId=${result.transactionId}`
  );
});
var sslcommerzFail = catchAsync(async (req, res, next) => {
  const result = await paymentService.handleSslcommerzFailure(req.body);
  res.redirect(`${config_default.app_url}/payment/failed?transactionId=${result.transactionId}`);
});
var sslcommerzCancel = catchAsync(async (req, res, next) => {
  const result = await paymentService.handleSslcommerzFailure(req.body);
  res.redirect(`${config_default.app_url}/payment/cancel?transactionId=${result.transactionId}`);
});
var getMyPayments = catchAsync(async (req, res, next) => {
  const customerId = req.user?.id;
  const payments = await paymentService.getMyPaymentsFromDB(customerId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus7.OK,
    message: "Payment history fetched successfully",
    data: { payments }
  });
});
var getPaymentById = catchAsync(async (req, res, next) => {
  const customerId = req.user?.id;
  const paymentId = req.params.id;
  const payment = await paymentService.getPaymentByIdFromDB(customerId, paymentId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus7.OK,
    message: "Payment details fetched successfully",
    data: { payment }
  });
});
var paymentController = {
  createPayment,
  confirmStripePayment,
  stripeWebhook,
  sslcommerzSuccess,
  sslcommerzFail,
  sslcommerzCancel,
  getMyPayments,
  getPaymentById
};

// src/modules/payment/payment.route.ts
var router6 = Router6();
router6.post("/create", auth(Role.CUSTOMER), paymentController.createPayment);
router6.post("/confirm", auth(Role.CUSTOMER), paymentController.confirmStripePayment);
router6.get("/", auth(Role.CUSTOMER), paymentController.getMyPayments);
router6.post("/stripe/webhook", paymentController.stripeWebhook);
router6.post("/sslcommerz/success", paymentController.sslcommerzSuccess);
router6.post("/sslcommerz/fail", paymentController.sslcommerzFail);
router6.post("/sslcommerz/cancel", paymentController.sslcommerzCancel);
router6.get("/:id", auth(Role.CUSTOMER), paymentController.getPaymentById);
var paymentRoutes = router6;

// src/modules/review/review.route.ts
import { Router as Router7 } from "express";

// src/modules/review/review.controller.ts
import httpStatus8 from "http-status";

// src/modules/review/review.service.ts
var createReviewIntoDB = async (customerId, payload) => {
  const { rentalOrderId, gearItemId, rating, comment } = payload;
  if (!rentalOrderId || !gearItemId || rating === void 0) {
    throw new Error("rentalOrderId, gearItemId and rating are required");
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be a whole number from 1 to 5");
  }
  const order = await prisma.rentalOrder.findFirst({
    where: { id: rentalOrderId, customerId },
    include: { items: { select: { gearItemId: true } } }
  });
  if (!order) {
    throw new Error("Rental order not found");
  }
  if (order.status !== RentalStatus.RETURNED) {
    throw new Error("You can review only after the gear has been returned");
  }
  if (!order.items.some((item) => item.gearItemId === gearItemId)) {
    throw new Error("This gear is not part of the selected order");
  }
  const existingReview = await prisma.review.findUnique({
    where: {
      customerId_gearItemId_rentalOrderId: { customerId, gearItemId, rentalOrderId }
    }
  });
  if (existingReview) {
    throw new Error("You have already reviewed this gear for this order");
  }
  const review = await prisma.review.create({
    data: { customerId, gearItemId, rentalOrderId, rating, comment },
    include: {
      gearItem: { select: { id: true, name: true } },
      customer: { select: { id: true, name: true } }
    }
  });
  return review;
};
var reviewService = {
  createReviewIntoDB
};

// src/modules/review/review.controller.ts
var createReview = catchAsync(async (req, res, next) => {
  const customerId = req.user?.id;
  const review = await reviewService.createReviewIntoDB(customerId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus8.CREATED,
    message: "Review submitted successfully",
    data: { review }
  });
});
var reviewController = {
  createReview
};

// src/modules/review/review.route.ts
var router7 = Router7();
router7.post("/", auth(Role.CUSTOMER), reviewController.createReview);
var reviewRoutes = router7;

// src/modules/admin/admin.route.ts
import { Router as Router8 } from "express";

// src/modules/admin/admin.controller.ts
import httpStatus9 from "http-status";

// src/modules/admin/admin.service.ts
var getPagination = (pageValue, limitValue) => {
  const page = Math.max(Number(pageValue) || 1, 1);
  const limit = Math.min(Math.max(Number(limitValue) || 10, 1), 50);
  return { page, limit, skip: (page - 1) * limit };
};
var buildMeta = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPage: Math.ceil(total / limit)
});
var getAllUsersFromDB = async (query) => {
  const { searchTerm, role, status } = query;
  if (role && role !== Role.CUSTOMER && role !== Role.PROVIDER) {
    throw new Error("role must be CUSTOMER or PROVIDER");
  }
  if (status && !Object.values(UserStatus).includes(status)) {
    throw new Error("Invalid status filter");
  }
  const { page, limit, skip } = getPagination(query.page, query.limit);
  const andConditions = [
    { role: { in: [Role.CUSTOMER, Role.PROVIDER] } }
  ];
  if (role) {
    andConditions.push({ role });
  }
  if (status) {
    andConditions.push({ status });
  }
  if (searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } }
      ]
    });
  }
  const where = { AND: andConditions };
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      omit: { password: true },
      include: { profile: true }
    }),
    prisma.user.count({ where })
  ]);
  return { meta: buildMeta(page, limit, total), users };
};
var updateUserStatusInDB = async (adminId, userId, status) => {
  if (!status || !Object.values(UserStatus).includes(status)) {
    throw new Error("Status must be ACTIVE or SUSPENDED");
  }
  if (adminId === userId) {
    throw new Error("You can't change your own status");
  }
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!user) {
    throw new Error("User not found");
  }
  if (user.role === Role.ADMIN) {
    throw new Error("Admin accounts can't be suspended");
  }
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status },
    omit: { password: true },
    include: { profile: true }
  });
  return updatedUser;
};
var getAllGearFromDB2 = async (query) => {
  const { searchTerm, status, categoryId, providerId } = query;
  if (status && !Object.values(GearStatus).includes(status)) {
    throw new Error("Invalid status filter");
  }
  const { page, limit, skip } = getPagination(query.page, query.limit);
  const andConditions = [];
  if (status) {
    andConditions.push({ status });
  }
  if (categoryId) {
    andConditions.push({ categoryId });
  }
  if (providerId) {
    andConditions.push({ providerId });
  }
  if (searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { brand: { contains: searchTerm, mode: "insensitive" } }
      ]
    });
  }
  const where = andConditions.length ? { AND: andConditions } : {};
  const [gears, total] = await Promise.all([
    prisma.gearItem.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        provider: { select: { id: true, name: true, email: true, status: true } }
      }
    }),
    prisma.gearItem.count({ where })
  ]);
  return { meta: buildMeta(page, limit, total), gears };
};
var updateGearStatusInDB = async (gearId, status) => {
  if (!status || !Object.values(GearStatus).includes(status)) {
    throw new Error("Status must be ACTIVE or HIDDEN");
  }
  const gear = await prisma.gearItem.findUnique({
    where: { id: gearId }
  });
  if (!gear) {
    throw new Error("Gear not found");
  }
  const updatedGear = await prisma.gearItem.update({
    where: { id: gearId },
    data: { status },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      provider: { select: { id: true, name: true } }
    }
  });
  return updatedGear;
};
var getAllRentalsFromDB = async (query) => {
  const { status, customerId, providerId } = query;
  if (status && !Object.values(RentalStatus).includes(status)) {
    throw new Error("Invalid status filter");
  }
  const { page, limit, skip } = getPagination(query.page, query.limit);
  const where = {
    status,
    customerId,
    providerId
  };
  const [orders, total] = await Promise.all([
    prisma.rentalOrder.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        provider: {
          select: {
            id: true,
            name: true,
            profile: { select: { shopName: true } }
          }
        },
        items: {
          include: { gearItem: { select: { id: true, name: true } } }
        },
        payments: {
          select: { id: true, status: true, amount: true, provider: true, paidAt: true }
        }
      }
    }),
    prisma.rentalOrder.count({ where })
  ]);
  return { meta: buildMeta(page, limit, total), orders };
};
var adminService = {
  getAllUsersFromDB,
  updateUserStatusInDB,
  getAllGearFromDB: getAllGearFromDB2,
  updateGearStatusInDB,
  getAllRentalsFromDB
};

// src/modules/admin/admin.controller.ts
var getAllUsers = catchAsync(async (req, res, next) => {
  const result = await adminService.getAllUsersFromDB(req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus9.OK,
    message: "Users fetched successfully",
    data: result
  });
});
var updateUserStatus = catchAsync(async (req, res, next) => {
  const adminId = req.user?.id;
  const userId = req.params.id;
  const user = await adminService.updateUserStatusInDB(adminId, userId, req.body.status);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus9.OK,
    message: `User status updated to ${user.status}`,
    data: { user }
  });
});
var getAllGear2 = catchAsync(async (req, res, next) => {
  const result = await adminService.getAllGearFromDB(req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus9.OK,
    message: "Gear listings fetched successfully",
    data: result
  });
});
var updateGearStatus = catchAsync(async (req, res, next) => {
  const gearId = req.params.id;
  const gear = await adminService.updateGearStatusInDB(gearId, req.body.status);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus9.OK,
    message: `Gear status updated to ${gear.status}`,
    data: { gear }
  });
});
var getAllRentals = catchAsync(async (req, res, next) => {
  const result = await adminService.getAllRentalsFromDB(req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus9.OK,
    message: "Rental orders fetched successfully",
    data: result
  });
});
var adminController = {
  getAllUsers,
  updateUserStatus,
  getAllGear: getAllGear2,
  updateGearStatus,
  getAllRentals
};

// src/modules/admin/admin.route.ts
var router8 = Router8();
router8.use(auth(Role.ADMIN));
router8.get("/users", adminController.getAllUsers);
router8.patch("/users/:id", adminController.updateUserStatus);
router8.get("/gear", adminController.getAllGear);
router8.patch("/gear/:id", adminController.updateGearStatus);
router8.get("/rentals", adminController.getAllRentals);
var adminRoutes = router8;

// src/modules/category/category.route.ts
import { Router as Router9 } from "express";

// src/modules/category/category.controller.ts
import httpStatus10 from "http-status";

// src/modules/category/category.service.ts
var slugify = (name) => name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
var createCategoryIntoDB = async (payload) => {
  const { name, description, imageUrl } = payload;
  if (!name || !name.trim()) {
    throw new Error("Category name is required");
  }
  const cleanName = name.trim();
  const slug = slugify(cleanName);
  if (!slug) {
    throw new Error("Category name must contain letters or numbers");
  }
  const existingCategory = await prisma.category.findFirst({
    where: {
      OR: [{ name: { equals: cleanName, mode: "insensitive" } }, { slug }]
    }
  });
  if (existingCategory) {
    throw new Error("A category with this name already exists");
  }
  const category = await prisma.category.create({
    data: { name: cleanName, slug, description, imageUrl }
  });
  return category;
};
var getAllCategoriesFromDB = async () => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { gearItems: true } }
    }
  });
  return categories;
};
var updateCategoryInDB = async (categoryId, payload) => {
  const { name, description, imageUrl } = payload;
  const category = await prisma.category.findUnique({
    where: { id: categoryId }
  });
  if (!category) {
    throw new Error("Category not found");
  }
  let cleanName;
  let slug;
  if (name !== void 0) {
    cleanName = name.trim();
    slug = slugify(cleanName);
    if (!cleanName || !slug) {
      throw new Error("Category name must contain letters or numbers");
    }
    const duplicate = await prisma.category.findFirst({
      where: {
        id: { not: categoryId },
        OR: [{ name: { equals: cleanName, mode: "insensitive" } }, { slug }]
      }
    });
    if (duplicate) {
      throw new Error("A category with this name already exists");
    }
  }
  const updatedCategory = await prisma.category.update({
    where: { id: categoryId },
    data: { name: cleanName, slug, description, imageUrl }
  });
  return updatedCategory;
};
var deleteCategoryFromDB = async (categoryId) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId }
  });
  if (!category) {
    throw new Error("Category not found");
  }
  const gearCount = await prisma.gearItem.count({
    where: { categoryId }
  });
  if (gearCount > 0) {
    throw new Error(
      `This category has ${gearCount} gear item(s). Move or remove them before deleting the category`
    );
  }
  await prisma.category.delete({
    where: { id: categoryId }
  });
  return { id: categoryId };
};
var categoryService = {
  createCategoryIntoDB,
  getAllCategoriesFromDB,
  updateCategoryInDB,
  deleteCategoryFromDB
};

// src/modules/category/category.controller.ts
var createCategory = catchAsync(async (req, res, next) => {
  const category = await categoryService.createCategoryIntoDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus10.CREATED,
    message: "Category created successfully",
    data: { category }
  });
});
var getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await categoryService.getAllCategoriesFromDB();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus10.OK,
    message: "Categories fetched successfully",
    data: { categories }
  });
});
var updateCategory = catchAsync(async (req, res, next) => {
  const categoryId = req.params.id;
  const category = await categoryService.updateCategoryInDB(categoryId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus10.OK,
    message: "Category updated successfully",
    data: { category }
  });
});
var deleteCategory = catchAsync(async (req, res, next) => {
  const categoryId = req.params.id;
  const result = await categoryService.deleteCategoryFromDB(categoryId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus10.OK,
    message: "Category deleted successfully",
    data: result
  });
});
var categoryController = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory
};

// src/modules/category/category.route.ts
var router9 = Router9();
router9.get("/", categoryController.getAllCategories);
router9.post("/", auth(Role.ADMIN), categoryController.createCategory);
router9.put("/:id", auth(Role.ADMIN), categoryController.updateCategory);
router9.delete("/:id", auth(Role.ADMIN), categoryController.deleteCategory);
var categoryRoutes = router9;

// src/app.ts
var app = express();
app.use(cors({
  origin: config_default.app_url,
  credentials: true
}));
app.use("/api/payments/stripe/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send("Hello, World!");
});
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/provider", providerRoutes);
app.use("/api/gear", gearRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.get("/payment/success", (req, res) => {
  res.send(`Payment successful. Transaction: ${req.query.transactionId}`);
});
app.get("/payment/cancel", (req, res) => {
  res.send("Payment cancelled.");
});
app.get("/payment/failed", (req, res) => {
  res.send("Payment failed.");
});
app.use(notFound);
app.use(globalErrorHandler);
var app_default = app;
export {
  app_default as default
};
