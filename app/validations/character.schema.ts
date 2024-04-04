import { commonDt } from "./common.schema.js"

export const character = { 
    $id : 'characterInfo', 
    type : 'object', 
    properties : {
        id : {type : 'number'},
        name : {type : 'string'},
        mannerScore : {type : 'number'},
        tierScore : {type : 'number'},
        thermometer : {type : 'number'},
        searchCnt : {type : 'number'},
        linkUrl : {type : 'string', description : '링크 url'},
        imgUrl : {type : 'string', description : '캐릭터 신분증 url'},
        serverCd : {type : 'string'},
        file : {type : 'array', items : {type : 'object', $ref : 'fileInfo#'}},
        mannerPost : {type : 'array', items : {type : 'object', $ref : 'postInfo#'}},
        tier : { 
            type : 'object', 
            properties : {
                name : {type : 'string', description : '티어명'}, 
                score : {type : 'number', description : '티어 점수'}, 
                iconName : {type : 'string', description : '아이콘명=티어멍'}, 
                iconUrl : {type : 'string', description : '아이콘 url'}
            }

        }, 
        ranking : { 
            type : 'object',
            properties : { 
                top : {type : 'number', description : '상위 몇%'}, 
                total : {type : 'number' , description : '전체 등록된 캐릭터 수'}, 
                rank : {type : 'number', description : '내 순위'}
            }
        }, 
        goodPostCnt : {type : 'number', default : 0},
        badPostCnt : {type : 'number', default : 0},
        /**
         * tier : { 
            name : "마스터", 
            score : "",
            iconName : "왕관", 
            iconUrl : "/path/to/image(상대경로값)"
            }, 
            ranking : { 
            top : 1, 
            total : 2333020, 
            rank : 12, 
            }, 
            goodPostCnt : 15, 
            badPostCnt : 15, 
         */
        createdAt : {$ref : commonDt.$id},
        deletedAt : {$ref : commonDt.$id},
        updatedAt : {$ref : commonDt.$id},
    }
} as const 

export const create = { 
    $id :'characterCreate',
    tags : ['character'],
    body : { 
        type : 'object', 
        required : ['name', 'serverCd'],
        properties : { 
            name : {type : 'string'},
            serverCd : {type : 'string'},
            file : { 
                type : 'object',
                required : ['name', 'mimetype', 'ext', 'data'],
                properties : { 
                    name : {type : 'string', description : '파일명 '},
                    mimetype : {type : 'string', description : 'mimetype'},
                    ext : {type : 'string', description : '확장자'},
                    data : {type : 'string', description: 'base64 인코딩된 파일 데이터'},
                }
            }
        }
    }, 
    response : { 
        200 : { 
            type : 'object', 
            $ref : 'characterInfo#'
        }
    }

} as const
export const update = {
    tags : ['character'],
    body : { 
        type : 'object', 
        required : ['characterId', 'file'],
        properties : { 
            characterId : {type : 'number'},
            file : { 
                type : 'object',
                required : ['name', 'mimetype', 'ext', 'data'],
                properties : { 
                    name : {type : 'string', description : '파일명 '},
                    mimetype : {type : 'string', description : 'mimetype'},
                    ext : {type : 'string', description : '확장자'},
                    data : {type : 'string', description: 'base64 인코딩된 파일 데이터'},
                }
            }
        }
    }, 
    response :{
        200 : { 
            type : 'object', 
            $ref : 'characterInfo#'
        }
    }
} as const

export const get = { 
    $id : 'getCharacterInfo', 
    tags : ['character'],
    querystring : { 
        type : 'object', 
        required : ['serverCd', 'name'],
        properties : { 
            serverCd : {type : 'string'},
            name : {type : 'string'},
        }
    }, 
    response : {
        200 : { 
            $ref : 'characterInfo#'
        }
    }
} as const

export default { 
    character, 
    create,
    get,
    update, 
}