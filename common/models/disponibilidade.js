'use strict';
const moment = require("moment");


module.exports = (Disponibilidade) => {
       const app = require('./../../server/server')

       const consultaInicioFim = function(quadra, operador, inicioem, fimem, horasAdd, horasSubtrair) {
        let horarioInicio = moment.utc(inicioem)
        let horarioFim = moment.utc(fimem)
       if(horasAdd) {
         horarioInicio.add(horasAdd * 60, "minutes");
         horarioFim.add(horasAdd * 60, "minutes");
       }
       if(horasSubtrair) {
         horarioInicio.subtract(horasSubtrair * 60, "minutes")
         horarioFim.subtract(horasSubtrair * 60, "minutes")
       }
       let tipo = {};
        tipo[operador] = quadra;
       return [
        {tipo: tipo},
        {inicioem: {gte: horarioInicio.toDate()}},
        {fimem: {lte: horarioFim.toDate()}},
        {status: "ativo"}
     ]
     };
     
    
    Disponibilidade.sharedClass.methods().forEach(method => {
        Disponibilidade.disableRemoteMethod(method.name, true);
    });

    Disponibilidade.obterDisponibilidade = async (ctx) => {

         try{
             //se tem resultado, precisa de similares, pois o horario esta ocupado
        //se nao tem resultado, nao precisa de similares, por que o horario esta disponivel
        let disponibilidade = await obterDisponibilidade(ctx);
        if(!disponibilidade) {
            return {
                dados: [],
                status_consulta: 1
            };
        }
        let horarioInicio = moment(ctx.inicioem);
        let horarioFim = moment(ctx.fimem);
        let filter = {
            where: {
              or: [
                 {and: consultaInicioFim(ctx.tipo, "neq", horarioInicio, horarioFim)},
                 {and: consultaInicioFim(ctx.tipo, "eq", horarioInicio, horarioFim,1.1, null)},
                 {and: consultaInicioFim(ctx.tipo, "eq", horarioInicio, horarioFim,null, 1.1)},
                 {and: consultaInicioFim(ctx.tipo, "neq", horarioInicio, horarioFim,1.1, null)},
                 {and: consultaInicioFim(ctx.tipo, "neq", horarioInicio, horarioFim,null, 1.1)},
                 {and: consultaInicioFim(ctx.tipo, "eq", horarioInicio, horarioFim,2.1, null)},
                 {and: consultaInicioFim(ctx.tipo, "eq", horarioInicio, horarioFim,null, 2.1)},
              ]
           }
         };console.log(JSON.stringify(filter, null,2))
            const dados = await app.models.Reservas.find(filter)
            if(dados) {
                return {
                    dados: dados,
                    status_consulta: 2
                };
            } else {
                return {
                    dados: [],
                    status_consulta: 3
                };
            }
          } catch(e){ 
            return {
                dados: [],
                status_consulta: 4
            };
          }
         
    }
    Disponibilidade.remoteMethod(
       'obterDisponibilidade', {
           accepts: {
               arg: 'reserva',
               type: 'object',
               default: {
                'tipo':'string',
                'inicioem':'string',
                'fimem':'string'
               },
               http: {
                   source: 'body'
               }
           },
         http: { 
             path: '/',
             verb: 'post'
         },
         returns: {
             arg: 'óbterstatus',
             type: 'array'
         }
       }
    )
   async function obterDisponibilidade(reservas){

        let filter = {
            where: {
              tipo: reservas.tipo,
    
                    and:[
                    {
                      inicioem : 
                        {
                          gte:(reservas.inicioem)
                    }
                    },
                    {
                      fimem:
                        {
                          lte:(reservas.fimem)
                        }
                    },
                    {
                      status: 'ativa'
                    }
                   ]
            }
          };
          try{
            const dados = await app.models.Reservas.find(filter)
            return dados
          } catch(e){ throw new Error(e.message);
          }
    }

};













