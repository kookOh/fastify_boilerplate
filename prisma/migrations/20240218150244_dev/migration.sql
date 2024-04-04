/*
  Warnings:

  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "TB_USER" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255),
    "name" VARCHAR(255),
    "nickname" VARCHAR(255),
    "thumbURL" VARCHAR(255),
    "photoURL" VARCHAR(255),
    "birthDay" TIMESTAMP(3),
    "gender" TEXT,
    "phone" VARCHAR(255),
    "verified" BOOLEAN,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TB_USER_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TB_USER_SOCIAL" (
    "id" UUID NOT NULL,
    "socialId" TEXT NOT NULL,
    "socialType" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "identityToken" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TB_USER_SOCIAL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TB_SESSION" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "userId" UUID NOT NULL,
    "nonce" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TB_SESSION_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TB_POST" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "userId" UUID NOT NULL,
    "characterId" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'short',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TB_POST_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TB_GROUP_CODE" (
    "cd" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "TB_GROUP_CODE_pkey" PRIMARY KEY ("cd")
);

-- CreateTable
CREATE TABLE "TB_COMMON_CODE" (
    "cd" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "groupCd" TEXT NOT NULL,
    "attr1" TEXT,
    "attr2" TEXT,
    "attr3" TEXT,
    "attr4" TEXT,
    "useYN" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TB_COMMON_CODE_pkey" PRIMARY KEY ("cd")
);

-- CreateTable
CREATE TABLE "TB_GAME_INFO" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "useYN" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TB_GAME_INFO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TB_SERVER_INFO" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "gameId" INTEGER NOT NULL,
    "useYN" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TB_SERVER_INFO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TB_CHARACTER_INFO" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "serverId" INTEGER NOT NULL,
    "mannerScore" INTEGER NOT NULL,
    "tierScore" INTEGER NOT NULL,
    "thermometer" DOUBLE PRECISION NOT NULL DEFAULT 36.5,
    "searchCnt" INTEGER NOT NULL DEFAULT 0,
    "linkUrl" TEXT,
    "imgUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TB_CHARACTER_INFO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TB_TIER_INFO" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "maxScore" INTEGER NOT NULL,
    "minScore" INTEGER NOT NULL,

    CONSTRAINT "TB_TIER_INFO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TB_FILE" (
    "id" SERIAL NOT NULL,
    "filename" TEXT,
    "mimetype" TEXT,
    "md5" TEXT,
    "size" INTEGER,
    "relativeURL" TEXT NOT NULL,
    "thumbnailURL" TEXT,
    "lowQualityURL" TEXT,
    "highQualityURL" TEXT,
    "videoThumbnailURL" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "postId" INTEGER,
    "characterId" INTEGER,
    "tierId" INTEGER,

    CONSTRAINT "TB_FILE_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TB_USER_SOCIAL_socialId_socialType_idx" ON "TB_USER_SOCIAL"("socialId", "socialType");

-- CreateIndex
CREATE UNIQUE INDEX "TB_SESSION_userId_nonce_key" ON "TB_SESSION"("userId", "nonce");

-- CreateIndex
CREATE INDEX "TB_POST_userId_idx" ON "TB_POST"("userId");

-- CreateIndex
CREATE INDEX "TB_POST_type_idx" ON "TB_POST"("type");

-- CreateIndex
CREATE INDEX "TB_COMMON_CODE_groupCd_idx" ON "TB_COMMON_CODE"("groupCd");

-- CreateIndex
CREATE INDEX "TB_GAME_INFO_name_idx" ON "TB_GAME_INFO"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TB_GAME_INFO_name_key" ON "TB_GAME_INFO"("name");

-- CreateIndex
CREATE INDEX "TB_SERVER_INFO_gameId_idx" ON "TB_SERVER_INFO"("gameId");

-- CreateIndex
CREATE INDEX "TB_CHARACTER_INFO_serverId_name_idx" ON "TB_CHARACTER_INFO"("serverId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "TB_CHARACTER_INFO_name_serverId_key" ON "TB_CHARACTER_INFO"("name", "serverId");

-- CreateIndex
CREATE UNIQUE INDEX "TB_FILE_tierId_key" ON "TB_FILE"("tierId");

-- AddForeignKey
ALTER TABLE "TB_USER_SOCIAL" ADD CONSTRAINT "TB_USER_SOCIAL_id_fkey" FOREIGN KEY ("id") REFERENCES "TB_USER"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TB_SESSION" ADD CONSTRAINT "TB_SESSION_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TB_USER"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TB_POST" ADD CONSTRAINT "TB_POST_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "TB_CHARACTER_INFO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TB_POST" ADD CONSTRAINT "TB_POST_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TB_USER"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TB_COMMON_CODE" ADD CONSTRAINT "TB_COMMON_CODE_groupCd_fkey" FOREIGN KEY ("groupCd") REFERENCES "TB_GROUP_CODE"("cd") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TB_SERVER_INFO" ADD CONSTRAINT "TB_SERVER_INFO_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "TB_GAME_INFO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TB_CHARACTER_INFO" ADD CONSTRAINT "TB_CHARACTER_INFO_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "TB_SERVER_INFO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TB_FILE" ADD CONSTRAINT "TB_FILE_postId_fkey" FOREIGN KEY ("postId") REFERENCES "TB_POST"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TB_FILE" ADD CONSTRAINT "TB_FILE_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "TB_CHARACTER_INFO"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TB_FILE" ADD CONSTRAINT "TB_FILE_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "TB_TIER_INFO"("id") ON DELETE SET NULL ON UPDATE CASCADE;
