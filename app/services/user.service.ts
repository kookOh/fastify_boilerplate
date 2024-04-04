import httpErrors from 'http-errors'
import { hash } from 'bcrypt'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js'

import type { Prisma, PrismaClient } from '@prisma/client'
import type { FastifyJWT, JWT } from '@fastify/jwt'
import { FromSchema } from 'json-schema-to-ts'
import { signIn, user, kakaoCallback, kakaoAuthToken } from '../validations/user.schema.js'
import { JwksClient } from 'jwks-rsa';
import type TokenService from './token.service.js'
import { TokenTypes, env } from '../config/index.js'
import axios from 'axios';
interface IUserCreate {
  name: string
  email: string
  password: string
}


interface createUserInput {
  email : string ,
  name? : string | null,
  nickname? : string | null,
  password? : string | null, 
  phone? : string | null, 
  thumbURL? : string | null, 
  photoURL? : string | null, 
  gender? : string | null, 
  verified? : boolean, 
  userType : string,
  sns : {
      socialType : string, 
      socialId : string, 
      accessToken : string, 
      refreshToken? : string | null, 
      identityToken? : string  | null
  }
}

interface AppleJwtTokenPayload {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string;
  nonce: string;
  c_hash: string;
  email?: string;
  email_verified?: string;
  is_private_email?: string;
  auth_time: number;
  nonce_supported: boolean;
}

interface KakaoLoginRefreshTokenSuccessResponse {
  access_token?: string;
  token_type?: "bearer";
  refresh_token?: string;
  refresh_token_expires_in?: number;
  expires_in?: number;
}

interface KakaoLoginUserInformationSuccessResponse {
  id: number;
  kakao_account?: {
    profile? : {
      nickname: string;
      profile_image_url: string;
      thumbnail_image_url: string;
      profile_needs_agreement: boolean;
      is_default_image: boolean;
    };
    email?: string;
    email_needs_agreement?: boolean;
    is_email_valid?: boolean;
    is_email_verified?: boolean;
    age_range?: string;
    age_range_needs_agreement?: boolean;
    birthday?: string;
    birthday_needs_agreement?: boolean;
    birthday_type?: string;
    gender?: string;
    gender_needs_agreement?: boolean;
    phone_number?: string;
    phone_number_needs_agreement?: boolean;
    ci?: string;
    ci_needs_agreement?: boolean;
    ci_authenticated_at?: string;
  };
}


export class UserService {
  constructor(
    private prisma: PrismaClient, 
    private jwt: JWT,
    private tokenService : TokenService
    ) {}

  user = this.prisma.user;

  verifyAppleToken = async (appleIdToken: string): Promise<AppleJwtTokenPayload> => {
    
    const decodedToken = this.jwt.decode(appleIdToken, { complete: true }) as {
      header: { kid: string; alg: 
        "HS256" | "HS384" | "HS512" |
       "RS256" | "RS384" | "RS512" |
       "ES256" | "ES384" | "ES512" |
       "PS256" | "PS384" | "PS512" |
       "none" };
      payload: { sub: string };
    };
    const keyIdFromToken = decodedToken.header.kid;
  
    const applePublicKeyUrl = 'https://appleid.apple.com/auth/keys';
  
    const jwksClient = new JwksClient({ jwksUri: applePublicKeyUrl });
  
    const key = await jwksClient.getSigningKey(keyIdFromToken);
    const publicKey = key.getPublicKey();
  
    const verifiedDecodedToken: AppleJwtTokenPayload =
      this.jwt.verify(appleIdToken, { algorithms: [decodedToken.header.alg], key: publicKey}) as AppleJwtTokenPayload;


    //  require('jsonwebtoken').verify(appleIdToken, publicKey, {
    //   algorithms: [decodedToken.header.alg]
    // }) as AppleJwtTokenPayload;

  
    return verifiedDecodedToken;
  }


  getUserByEmail = (
    email: string,
    opts: Omit<Prisma.UserFindUniqueArgs, 'where'> = {}
  ) => this.user.findUnique({ where: { id : email }, ...opts })

  getUserById = (
    userId: string,
    opts: Omit<Prisma.UserFindUniqueArgs, 'where'> = {}
  ) => this.user.findUnique({ where: { id: userId }, ...opts })

  updateUserById = (
    userId: string,
    opts: Omit<Prisma.UserUpdateArgs, 'where'>
  ) => this.user.update({ where: { id: userId }, ...opts })

  queryUsers = (args?: Prisma.UserFindManyArgs) => this.user.findMany(args)

  createuser = async ( prisma : PrismaClient, data : createUserInput) => {
    const sns = data.sns; 
  
    const isUser = await prisma.userSocial.findFirst({
      where : { 
        // socialId : sns.socialId, 
        // socialType : sns.socialType,
        socialId : sns.socialId, 
        socialType : sns.socialType,
      }, 
      include : { 
        user : {
          include : {
            sns :true, 
  
          }
        }, 
         
      },
    });
    if ( isUser !== null ) {
      await prisma.userSocial.update({
        where : { 
          id : isUser.id
        },
        data : {
          accessToken : sns.accessToken, 
        },
            });
      return {
        token : this.jwt.sign({sub : isUser.id, type :TokenTypes.ACCESS, jti:this.tokenService.generateNonce() }),
        user : isUser.user
      };
    }
    
    if ( data.name !== undefined && data.name!.length > 10) {
      data.name = data.name?.slice(0,10);
    }
    if ( data?.nickname !== undefined && data.nickname!.length > 10) {
      data.nickname = data.nickname!.slice(0,10);
    }
    const user = await prisma.user.create({
      data : { 
        email : data?.email, 
        name : data?.name ?? null, 
        nickname : data?.nickname, 
        password : data?.password, 
        phone : data?.phone, 
        verified : data?.verified,
        sns : { 
          create : {
            socialId : sns.socialId, 
            socialType : sns.socialType, 
            accessToken : sns.accessToken, 
            identityToken : sns.identityToken, 
            refreshToken : sns.refreshToken
          }, 
  
        },    
      }, 
      include : { 
        sns : true, 
      }
      
    });
    return {
      token : this.jwt.sign({sub : user.id, type :TokenTypes.ACCESS, jti:this.tokenService.generateNonce() }),
      user : user
    };
  }

  kakaoOauthCallback = async (body : FromSchema<typeof kakaoAuthToken.body> ) => {
   
    const params = new URLSearchParams();

    params.append('grant_type', 'authorization_code');
    params.append('client_id', `${env.KAKAO_REST_API_KEY!}`);
    params.append('redirect_uri', `${env.KAKAO_REDIRECT_URI!}`);
    params.append('code', body.code!);
    
    const response = await axios.post('https://kauth.kakao.com/oauth/token', 
    params,
    {
      headers: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
    });
    const res = response.data;
    return await this.signInSns({accessToken : res.access_token, refreshToken : res.refresh_token, service : 'KAKAO', identityToken : res.id_token ?? ''});
  }

  signInSns = async (args: FromSchema<typeof signIn.body> ) =>{
    const { service, accessToken, refreshToken, identityToken } = args;
    if ( service === "KAKAO") {
      const response = await fetch(`https://kapi.kakao.com/v2/user/me`, {
        method : 'GET',
        headers : {
            "content-type" : "application/x-www-form-url-encoded",
            Authorization : `Bearer ${accessToken}`
        }
      });

      if ( response.ok) {
       
        const kakaoRes = (await response.json()) as KakaoLoginUserInformationSuccessResponse;
        const email = kakaoRes.kakao_account?.email ??  kakaoRes.id.toString();
        const name = kakaoRes.kakao_account?.profile?.nickname ?? '';
        const socialId = kakaoRes.id.toString();
        const hashedPassword = await hash(socialId, 10);


        const createData : createUserInput = { 
          email : email, 
          name : name, 
          nickname : kakaoRes.kakao_account?.profile?.nickname?? '',
          thumbURL : kakaoRes.kakao_account?.profile?.thumbnail_image_url ?? '',
          photoURL : kakaoRes.kakao_account?.profile?.profile_image_url ?? '',
          password : hashedPassword, 
          phone : kakaoRes.kakao_account?.phone_number ?? null, 
          gender : kakaoRes.kakao_account?.gender ?? null,
          verified : true,
          userType : 'user',
          sns : {
              accessToken : accessToken! , 
              identityToken : identityToken ?? undefined, 
              refreshToken : refreshToken ?? undefined, 
              socialType : service, 
              socialId : socialId,
          },
        };

        return await this.createuser(this.prisma, createData);  
      }
      else {
        throw new Error('Kakao login not success. response : ' + response.json());
      }

    }
    else if ( service === "NAVER") { 
      const response = await fetch(`https://openapi.naver.com/v1/nid/me`, {
        method : 'GET', 
        headers : {
            Authorization : `Bearer ${accessToken}`
        }
      });
      const responseJson = await response.json(); 
      if ( responseJson.message === 'success') {
        const _user = responseJson.response; 
        const socialId = _user.id.toString(); 
        const hashedPassword = await hash(socialId, 10);
        const createData : createUserInput = {
          email : _user.email ?? socialId, 
          name : _user.nickname ?? "",
          nickname : _user.nickname ?? "", 
          gender : _user.gender ?? null, 
          password : hashedPassword, 
          phone : _user.phone ?? null, 
          photoURL : _user.photoURL ?? null, 
          thumbURL : _user.thumbURL ?? null, 
          verified : false , 
          userType : 'user',
          sns : {
              accessToken : accessToken!, 
              identityToken : identityToken ?? undefined, 
              refreshToken : refreshToken ?? undefined, 
              socialId : socialId, 
              socialType : "NAVER"
          }
        };

        return await this.createuser(this.prisma, createData);  
        
      }
      else {
        throw new Error('Naver login not success. response : ' + responseJson);
      }


    }
    else if ( service === "GOOGLE") {
      console.debug("google login");

      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${args.accessToken}` },
        }
      );
      const user = await response.json();
      const email = user.email ;
      const name = user.given_name ?? user.name; 
      const socialId = user.id; 

      const hashedPassword = await hash(socialId, 10);
      const pic = user.picture ?? null;

      const createData : createUserInput = { 
        email : email, 
        name : name, 
        nickname : name, 
        password : hashedPassword, 
        phone : null, 
        photoURL : null , 
        thumbURL : null , 
        verified : false, 
        userType : 'user',
        sns : { 
            accessToken : accessToken!,
            identityToken : identityToken ?? undefined, 
            refreshToken : refreshToken ?? undefined, 
            socialId : socialId, 
            socialType : "GOOGLE", 
        }

      }
      return await this.createuser(this.prisma, createData);

    }
    else if ( service === "APPLE") {
      let response : AppleJwtTokenPayload  | null = null;
      try {
        response = await this.verifyAppleToken(identityToken as string) ; 
      } catch( err) {
        console.error('AppleJwtTokenPayload not verified : ' , err);
        throw new Error('AppleJwtTokenPayload not verified');
      }
      if ( !response ) {
        console.error('AppleJwtTokenPayload is null');
        throw new Error('AppleJwtTokenPayload is null');
      }

      console.info('apple token verifed. response : ', response, {label : "signUp"});
      const socialId = response.sub; 
      const hashedPassword = await hash(socialId, 10);
      const createData : createUserInput = {
        email : response.email_verified ? response.email ? response.email : response.sub : response.sub, 
        password : hashedPassword, 
        verified : true, 
        userType : 'user',
        sns : {
            socialId : socialId, 
            socialType : "APPLE",
            accessToken : accessToken!, 
            identityToken : identityToken ?? undefined, 
            refreshToken : refreshToken ?? undefined, 
        }
      }
      return await this.createuser(this.prisma, createData);  
    }
    else {
      throw new Error('SNS TYPE UNDEFINED');
    }
  }

  createUser = async ({ name, email, password }: IUserCreate) => {
    const passwordHash = await hash(password, 10)

    try {
      return await this.user.create({
        data: { name, email, password : passwordHash },
        select: {
          id: true,
          name: true,
          email: true
        }
      })
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new httpErrors.BadRequest('Email already registered')
        }
      }

      throw e
    }
  }

  deleteUserById = async (id: string) => {
    try {
      return await this.user.delete({ where: { id } })
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          return null
        }
      }

      throw e
    }
  }

  updateUsername = async ( id : string, name : string) => {
    try {
      return await this.user.update({
        where : {
          id : id
        }, 
        data : { 
          nickname : name
        }
      })
    } catch (e) {
      throw e
    }
  }
}

export default UserService
