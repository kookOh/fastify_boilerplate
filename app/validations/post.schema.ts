import type { FromSchema } from 'json-schema-to-ts'
import fileSchema, { file} from './file.schema.js'
import { commonDt } from './common.schema.js';
import { character } from './character.schema.js';

export const create = {
    $id : 'postCreate',
    tags : ['post'],
    headers : {
        $ref : 'authHeader#'
    },
    body : { 
        type : 'object', 
        required:['characterId', ], 
        properties : { 
            characterId : {type : 'number', description : '캐릭터 아이디'},
            title : {type : 'string', description : '제목'},
            content : {type : 'string', description : '내용'},
            html_content : {type : 'string', description : 'HTML 내용'},
            type : {type : 'string', description : '게시글 타입 (short, long))'},
            isManner : {type : 'boolean', description : '매너글 여부'},
            files : { 
                type : 'array',
                items : { 
                    type : 'object',
                    required : ['name', 'mimetype', 'ext', 'data'],
                    properties : { 
                        name : {type : 'string', description : '파일명 '},
                        mimetype : {type : 'string', description : 'mimetype'},
                        ext : {type : 'string', description : '확장자'},
                        data : {type : 'string', description: 'base64 인코딩된 파일 데이터'},
                    }
                }
            },
            merchant_uid : { type : 'string', description : '주문번호 아이디'}
            // userId : {type : 'string'}
        }
    }, 
    response : { 
        200 : { 
            type : 'object', 
            $ref : 'postInfo#'
        }
    }
} as const;

export const update = {
    $id : 'postUpdate',
    tags : ['post'],
    headers : {
        $ref : 'authHeader#'
    },
    body : { 
        type : 'object', 
        required:['postId'], 
        properties : { 
            postId : {type : 'number', description : 'POST 아이디'},
            title : {type : 'string', description : '제목'},
            content : {type : 'string', description : '내용'},
            html_content : {type : 'string', description : 'HTML 내용'},
            // type : {type : 'string', description : '게시글 타입 (short, long))'},
            // isManner : {type : 'boolean', description : '매너글 여부'},
            fileIds : {
                type : 'array',
                items : { 
                    type : 'object', 
                    required : ['id'],
                    properties : { 
                        id : { type : 'number'}
                    }
                }
            },
            files : { 
                type : 'array',
                items : { 
                    type : 'object',
                    required : ['name', 'mimetype', 'ext', 'data'],
                    properties : { 
                        name : {type : 'string', description : '파일명 '},
                        mimetype : {type : 'string', description : 'mimetype'},
                        ext : {type : 'string', description : '확장자'},
                        data : {type : 'string', description: 'base64 인코딩된 파일 데이터'},
                    }
                }
            },
        }
    }, 
    response : { 
        200 : { 
            type : 'object', 
            $ref : 'postInfo#'
        }
    }
} as const;

export const deletePost = {
    $id : 'postDelete',
    tags : ['post'],
    headers : {
        $ref : 'authHeader#'
    },
    body : { 
        type : 'object', 
        required:['postId'], 
        properties : { 
            postId : {type : 'number', description : 'POST 아이디'},
        }
    }, 
    response : { 
        200 : { 
            type : 'object', 
            $ref : 'postInfo#'
        }
    }
} as const;


export const getList = {
    $id : 'postGetList',
    tags : ['post'],
    querystring : {
        type : 'object',
        required : ['characterId'],
        properties : {
            characterId : {type : 'number'},
            page : {type : 'number', default : 0},
            pageSize : {type : 'number', default : 10},
        }
    },
    response : {
        200 : {
            type : 'array',
            items : { 
                $ref : 'postInfo#'
            }
        }
    }
} as const;

export const post = { 
    $id : 'postInfo', 
    type : 'object', 
    tags : ['post'],
    required : [], 
    properties : { 
        id : {type : 'number'},
        title : {type : 'string'},
        content : {type : 'string'},
        html_content : {type : 'string', description : 'HTML 내용'},
        type : {type : 'string'},
        isManner : {type : 'boolean'},
        files : {
            type : 'array', 
            items : { 
                type : 'object', 
                $ref : file.$id
                
            }
        },
        user : {
            type : 'object', 
            $ref : 'userInfo#'
        },
        character : {
            $ref : 'characterInfo#'
        },
        createdAt : {$ref : commonDt.$id},
        updatedAt : {$ref : commonDt.$id},
        deletedAT : {$ref : commonDt.$id},
    }
} as const


export default {
    create, 
    update,
    post ,
    deletePost,
    getList
}