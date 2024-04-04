import { PrismaClient } from "@prisma/client";
import {  create, file} from "../validations/file.schema.js";
import { FromSchema } from "json-schema-to-ts";

import sharp from 'sharp';
import util from 'util';
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { join, dirname } from 'node:path'
import { fileURLToPath, } from 'node:url'
import { env } from "../config/index.js";
const dir = dirname(fileURLToPath(import.meta.url))


export class FileService { 
    constructor(private prisma: PrismaClient) {
    }
    uploadPath = path.resolve('uploads');
    
    THUMBNAIL_PREFIX = 'thumbnail_';

    getMD5  = async (path : string) : Promise<string> => {
        const readFile = util.promisify(fs.readFile);
        const buffer = await readFile(path);
        const hash = crypto.createHash("md5");
        return hash.update(buffer).digest("hex");
    };

    resizeImage =  async ( data : FromSchema<typeof file> | any) => {
        let { id, relativeURL } = await data; 
        relativeURL= relativeURL?.replace(`${env.FRONTEND_IMG_URL}`, '');
        const fullPath = path.join(this.uploadPath, relativeURL);
        const fileName =  path.basename(relativeURL);
        const dirName = path.dirname(relativeURL);
  
        try {
          const metadata = await sharp(fullPath).metadata(); 
          const isLandscape = metadata.width! >= metadata.height!;
          const resizeOption = (quality: 240 | 480 | 1080) => {
            if (isLandscape === true) return { height: quality };
            else return { width: quality };
          };
  
          const result = await Promise.all([
            sharp(fullPath)
            .withMetadata()
            .resize(resizeOption(240))
            .toFile(
                path.join(
                this.uploadPath,
                dirName,
                `${this.THUMBNAIL_PREFIX}${fileName}`
                )
            ),
          ]).then( async a=> {
  
            const updated = await this.prisma.file.update ({
              where : {
                id : data.id
              },
              data : {
                thumbnailURL : `${path.join('/', dirName, `${this.THUMBNAIL_PREFIX}${fileName}`)}`,
              }
            });
            return updated;
          });
          return result; 
          
        } catch (error) {
          console.error('resize error : ', error);
          return null;
        }
    }

    createFile = async ({data, ext, name, mimetype } : FromSchema<typeof create.body>, characterId : number | undefined | null) => { 
        const fileContent = Buffer.from(data!, "base64");
        const metadata = await sharp(fileContent).metadata();
        const hash = crypto.createHash("md5");
        const md5 = hash.update(fileContent).digest("hex");
        const saveFileName = `${characterId ?? 0}/${md5}.${ext}`;
        const savePath = path.join(this.uploadPath, `${saveFileName}`);
        
        const mkdir = util.promisify(fs.mkdir);
        if (!fs.existsSync(path.dirname(savePath))) {
          await mkdir(path.dirname(savePath));
        }
        fs.writeFileSync(savePath, fileContent);

        
        const record = await this.prisma.file.create({
            data : {
                filename : name, 
                mimetype : mimetype, 
                size : metadata.size, 
                md5 : md5, 
                // path.join 안되어있으므로 / 추가
                relativeURL : `${path.join('/',saveFileName)}`,
                lowQualityURL : null,
                highQualityURL : null, 
                videoThumbnailURL :  null,
                priority :  1,
            }
        });
        const result = await this.resizeImage(record);
        if ( result == null) {
          throw Error('파일업로드 오류가 발생하였습니다.');
        }
        return result; 
    }

   
}

export default FileService;