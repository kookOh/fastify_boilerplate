export const create = { 
    $id : 'fileCreate', 
    tags : ['upload'],
    body : { 
        type : 'object',
        properties : { 
            name : {type : 'string', description : '파일명 '},
            mimetype : {type : 'string', description : 'mimetype'},
            ext : {type : 'string', description : '확장자'},
            data : {type : 'string', description : 'base64 인코딩된 파일 데이터'},
        }
    }, 
    response : { 
        200 : { 
            type : 'object', 
            $ref : 'fileInfo#'
        }
    }
} as const


export const file = { 
    $id : 'fileInfo', 
    type : 'object',
    properties : { 
        id : {type : 'number'},
        filename : {type : 'string', },
        mimetype : {type : 'string', },
        md5 : {type : 'string', },
        size : {type : 'number', },
        imgUrl : {type : 'string', },
        relateiveURL : {type : 'string', },
        thumbnailURL : {type : 'string', },
        lowQualityURL : {type : 'string', },
        highQualityURL : {type : 'string', },
        videoThumbnailURL : {type : 'string', },
        priority : {type : 'number', },
        createdAt : {$ref : 'dt#'},
        deletedAt : {$ref : 'dt#'},
        updatedAt : {$ref : 'dt#'}
    }
} as const

export default { 
    create, 
    file,
}