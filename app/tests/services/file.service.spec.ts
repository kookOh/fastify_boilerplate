import { PrismaClient } from "@prisma/client";
import { FileService } from "../../services/file.service.js";
import { create } from "../../validations/file.schema";
import chai, { expect } from 'chai'
import fs from 'fs';
import Sinon from "sinon";
import { prismaModel } from "../mocks.js";
import path from "path";



describe("FileService", () => {
    let fileService: FileService;
    let prisma: PrismaClient;

    beforeEach(() => {
        prisma = new PrismaClient();
        fileService = new FileService(prisma);
    });

    afterEach(async () => {
        await prisma.$disconnect();
    });

    describe("createFile", () => {
        it("should create a new file", async () => {
            // Arrange
            
            console.log('path.resolve=', path.resolve())
            const imagePath = `${path.join(path.resolve(), '뽀미.jpg')}`;
            const imageData = fs.readFileSync(imagePath);
            const base64Data = imageData.toString('base64');
            const fileData = {
                data: base64Data,
                ext: "jpg",
                name: "example.jpg",
                mimetype: "image/jpeg",
            };

            // Act
            const createdFile = await fileService.createFile(fileData, 1);
            console.log(createdFile);

            // Assert
            await expect(createdFile).to.be.ok;
            // Add more assertions based on your requirements
        });

        // Add more test cases for different scenarios if needed
    });

    // Add more test cases for other methods in FileService if needed
});
