import { PrismaClient } from "@prisma/client";
import { post , create, getList, update, deletePost} from "../validations/post.schema";
import { FromSchema } from "json-schema-to-ts";
import FileService from "./file.service.js";
import type { UserType } from "@fastify/jwt";



export class PostService { 
    constructor(
        private prisma: PrismaClient
        ) {}

    fileServce = new FileService(this.prisma);

    createPost = async ({characterId, title, content, type, isManner, files, html_content, merchant_uid}: FromSchema<typeof create.body>, userId : string ) => { 
        let fileIds = [];
        if ( files?.length != null && files.length > 0 ) {
            for ( let i = 0; i < files.length; i++) {
                const file = files[i];
                const rslt = await this.fileServce.createFile(file, characterId);
                if ( rslt != null) {
                    fileIds.push({id : rslt.id});
                }
            }
        }
        
        const created =  await this.prisma.post.create({
            data : { 
                title : title, 
                content : content, 
                html_content : html_content,
                userId : userId!, 
                type : type, 
                characterId : characterId!, 
                files : {
                    connect : fileIds ?? []
                },
                isManner : isManner,
                order : {
                    connect : { 
                        id : merchant_uid,
                    }
                }
            },
            include : { 
                files : true,
                character : true, 
                user : true, 
            }
        })

        // 점수 반영
        if ( created && isManner ) {
            let score = type== 'short' ? 1 : type=="long" ? 12 : 0
            await this.prisma.character.update({
                where : { id : characterId!},
                data : {
                    mannerScore : {
                        increment : score
                    },
                    thermometer : { 
                        increment : 0.1
                    },
                    tierScore : {
                        increment : score
                    }
                }
            });
        }
        else if ( created && !isManner) {
            let score = type== 'short' ? 1 : type=="long" ? 12 : 0
            await this.prisma.character.update({
                where : { id : characterId!},
                data : {
                    mannerScore : {
                        decrement : score
                    },
                    thermometer : { 
                        decrement : 0.1
                    },
                    tierScore : {
                        decrement : score
                    }
                }
            });
        }

        return created; 
    }

    updatePost = async (data : FromSchema<typeof update.body>,  user: UserType) => {
        // FILE ID가 기존 파일과 다르면 기존 파일은 삭제하지 않고 ID만 업데이트
        const post = await this.prisma.post.findUnique({
            where : { id : data.postId},
            include : { files : true}
        });
        if ( post == null) {
            throw new Error('Post not found');
        }
        if ( post.userId != user.sub) {
            throw new Error('Permission denied');
        }
        const newFiles = data.files ?? [];
        const oldFiles = post.files;
        const oldFileIds = oldFiles.map( f => { return {id : f.id}});
        const newFileIds = [];
        for ( let i = 0; i < newFiles.length; i++) {
            const file = newFiles[i];
            const rslt = await this.fileServce.createFile(file, post.characterId);
            if ( rslt != null) {
                newFileIds.push({id : rslt.id});
            }
        }
        
        const toBeConnected =  newFileIds.length == 0 ?  oldFileIds : newFileIds;
        const updated = await this.prisma.post.update({
            where : { id : data.postId},
            data : {
                title : data.title, 
                content : data.content, 
                html_content : data.html_content,
                files : {
                    set : toBeConnected
                }
            },
            include : {
                files : true, 
                character : true, 
                user : true
            }
        });
        return updated;
    }
    deletePost = async (data : FromSchema<typeof deletePost.body>, user: UserType) => {
        const post = await this.prisma.post.findUnique({
            where : { id : data.postId},
        });
        if ( post == null) {
            throw new Error('Post not found');
        }
        if ( post.userId != user.sub) {
            throw new Error('Permission denied');
        }

        const rslt = await this.prisma.post.delete({
            where : { id : data.postId}
        });
        if (rslt) {
            return rslt;
        }
        else {
            throw new Error('Post delete failed');
        }
    }

    getList = async (data : FromSchema<typeof getList.querystring>) => {
        await this.prisma.character.update({
            where : { id : data.characterId},
            data : {
                searchCnt : {
                    increment : 1
                }
            }
        });
        const pageNum = data.page == 0 ? 1 : data.page; 
        return await this.prisma.post.findMany({
            where : { 
                characterId : data.characterId
            },
            skip : (pageNum-1) * data.pageSize, 
            take : data.pageSize, 
            include : {
                files : true, 
                character : true, 
                user : true
            },
            orderBy : {
                createdAt : 'desc'
            }
        
        });
    }
}

export default PostService;