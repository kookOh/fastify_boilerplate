import orderSchema from '../../../validations/order.schema.js';
import type { FastifyPluginAsync } from 'fastify'
import {  RouteHandler } from 'fastify'
import type { FromSchema } from 'json-schema-to-ts'

const routes : FastifyPluginAsync = async(f) => {
    const prisma = f.prisma;
    

    f.route({
        method:'POST', 
        url :'/request', 
        onRequest : f.authenticate(),
        schema : orderSchema.orderRequest,
        handler : async (req, rep) => {
           
           
            rep.send('created');
        }
    });

    f.route({
        method:'POST', 
        url :'/complete',
        onRequest : f.authenticate(),
        schema : orderSchema.orderCallback,
        handler : async (req, rep) => {
            
            rep.send('');
        }
    });

    // f.route({
    //     method:'POST', 
    //     url :'/register', 
    //     schema : {
    //         description : '결제 등록 요청 API',
    //         tags : ['pg']
    //     },
    //     handler : async (req, rep) => {
    //         rep.send('register');
    //     }
    // });

    // f.route({
    //     method:'POST', 
    //     url :'/cancel', 
        
    //     schema : {
    //         description : '결제 취소 요청 API',
    //         tags : ['pg'],
    //         headers : {
    //             $ref : 'authHeader#'
    //         },
    //     },
    //     handler : async (req, rep) => {
    //         rep.send('cancel');
    //     }
    // });

    // f.route({
    //     method:'get', 
    //     url :'/history', 
    //     schema : {
    //         description : '결제 내역 API',
    //         tags : ['pg', 'admin'],
    //         headers : {
    //             $ref : 'authHeader#'
    //         },
    //     },
    //     handler : async (req, rep) => {
    //         rep.send('history by admin');
    //     }
    // });
}

export default routes;