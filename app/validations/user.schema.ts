export const create = {
  $id : 'userCreated', 
  tags : ['admin'],
  headers : {
    $ref : 'authHeader#'
  },
  body: {
    type: 'object',
    required: ['name', 'email', 'password'],
    properties: {
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      password: { type: 'string' }
    }
  }
} as const

export const list = {
  tags : ['admin'],
  headers : {
    $ref : 'authHeader#'
  },
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' }
        }
      }
    }
  }
} as const



export const signIn = { 
  $id : 'signIn',
  tags : ['auth'],
  body : { 
      type : 'object', 
      required : [],
      properties : {
          accessToken : {type : 'string', description : 'KAKAO, NAVER, GOOGLE, APPLE 로그인시에 필요'},
          refreshToken : {type : 'string'},
          identityToken : {type : 'string', description : 'apple 로그인시에만 필요'},
          service : {type : 'string', description : 'KAKAO, NAVER, GOOGLE, APPLE'},
      }
  }, 
  response : { 
      200 : { 
          type : 'object', 
          properties : { 
              token : { type : 'string'},
              user : { 
                  $ref : 'userInfo#'
                  
                  
              }
          }
      }
  }
} as const;

export const kakaoCallback = { 
  $id : 'kakaoCallback', 
  tags : ['auth'],
  querystring : { 
      type : 'object', 
      required : [],
      properties : { 
          code : {type : 'string'},
          error : {type : 'string'},
          error_description : {type : 'string'},
          state : {type : 'string'},
      }
  },
} as const;

export const kakaoAuthToken = { 
  $id : 'kakaoAuthToken', 
  tags : ['auth'],
  body : { 
      type : 'object', 
      required : ['code'],
      properties : { 
          code : {type : 'string'},
      }
  },
} as const;

export const user = {
  $id : 'userInfo',
  tags : ['admin', 'auth'],
  type : 'object' , 
  properties : { 
      id : { type : 'string'},
      name : { type : 'string'},
      nickname : { type : 'string'},
      email : { type : 'string'},
      thumbURL : { type : 'string'},
      photoURL : { type : 'string'},
      gender : { type : 'string'},
      phone : { type : 'string'},
      birthDay : { type : 'string'},
      sns : { $ref : 'snsInfo#'},
      posts : { type : 'array', items : { $ref : 'postInfo#'}},
  }
} as const;

export const getUserInfo = { 
  $id :'getUserInfo', 
  tags : ['auth'], 
  type : 'object', 
  response : { 
    200 : {
        $ref : 'userInfo#',
    }
  }
} as const;

export const sns = { 
  $id : 'snsInfo', 
  type : 'object',
  properties : { 
      id : {type : 'string'},
      socialId : {type : 'string'},
      socialType :  {type : 'string'},
      accssToken : {type : 'string'},
      refreshToken : {type : 'string'},
      identityToken : {type : 'string'},
      createdAt : {$ref : 'dt#'},
      updatedAt : {$ref : 'dt#'},
      deletedAt : {$ref : 'dt#'},
  }
} as const


export const deleteUser = {
  tags : ['admin'],
  headers : {
    $ref : 'authHeader#'
  },
  params: {
    type: 'object',
    required: ['userId'],
    properties: {
      userId: { type: 'string', minLength: 1 }
    }
  }
} as const



export default { create, list, deleteUser, user, signIn , sns, kakaoCallback, kakaoAuthToken, getUserInfo, }
