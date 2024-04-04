export const orderCallback = {
    description : '결제 승인 요청 API',
    tags : ['pg'],
    headers : {
        $ref : 'authHeader#'
    },
    body : { 
        type : 'object',
        required : ['imp_uid', 'merchant_uid'],
        properties : {
            imp_uid : { type : 'string' },
            merchant_uid : { type : 'string' },
        },
    },
    response : {
        200 : {
            type : 'object',
            properties : {
                status : { type : 'string' },
                message : { type : 'string' },
                data : {
                    type : 'object', 
                    properties : {
                        success : {type : 'boolean'}, 
                        error_code : {type : 'string'}, 
                        error_msg : {type : 'string'},
                        imp_uid : {type : 'string'},
                        merchat_uid : {type : 'string'},
                        pay_method : {type : 'string'},
                        paid_amount : {type : 'number'},
                        status : {type : 'string'},
                        name : {type : 'string'},
                        pg_provider : {type : 'string'},
                        emb_pg_provider : {type : 'string'},
                        pg_tid : {type : 'string'},
                        buyer_name : {type : 'string'},
                        buyer_email : {type : 'string'},
                        buyer_tel : {type : 'string'},
                        buyer_addr : {type : 'string'},
                        buyer_postcode : {type : 'string'},
                        custom_data : {type : 'string'},
                        paid_at : {type : 'string'},
                        receipt_url : {type : 'string'},
                        apply_num : {type : 'string'},
                        vbank_num : {type : 'string'},
                        vbank_name : {type : 'string'},
                        vbank_holder : {type : 'string'},
                        vbank_date : {type : 'string'},
                    }
                }, 
                
                
            }
        }
    
    }

} as const;

export const orderRequest = { 
    description : '결제 등록 요청 API',
    tags : ['pg'],
    headers : {
        $ref : 'authHeader#'
    },
    body : { 
        type : 'object',
        required : ['amount', 'characterId'],
        properties : {
            amount : { type : 'number' },
            characterId : { type : 'number' },
        },
    },
    response : {
        200 : {
            type : 'object',
            properties : {
                id : { type : 'string' },
            }
        }
    
    }
} as const 

export default {orderCallback, orderRequest};