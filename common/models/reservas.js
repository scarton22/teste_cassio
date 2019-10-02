'use strict';


module.exports = (Reservas) => {

  // function RetornaDataHoraAtual(){
  //   var dNow = new Date();
  //   var localdate = dNow.getDate() + '/' + (dNow.getMonth()+1) + '/' + dNow.getFullYear() + ' ' + dNow.getHours() + ':' + dNow.getMinutes();
  //   return localdate;
  // }


  function validaHora(reservas) {
    if (reservas.inicioem && reservas.fimem) {


      return true;
    }
    return false;

  }
  //////////////
  async function validaReserva(reservas) {
    return new Promise((resolve, reject) => {
      let filter = {
        where: {
          tipo: reservas.tipo,
          or: [
              {and:[{inicioem : {lte:(reservas.inicioem.toISOString())}},{fimem:{gt:(reservas.inicioem.toISOString())}},
                  {or:[{status:'Ativa'}]}]},

                  {and:[{inicioem : {lt:(reservas.fimem.toISOString())}},{fimem:{gte:(reservas.fimem.toISOString())}},
                  {or:[{status:'Ativa'}]}]},

            ]
        }
      };
      Reservas.find(filter).then(dados => {
        if (dados.length == 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      }).catch(err => {
        reject(err)
      })
    })
  }


  ////////////////////////
  Reservas.observe('before save', function (ctx, next) {
    if (!ctx.instance) {

      next();
      return;
    }



    if (!validaHora(ctx.instance)) {
      let customError = new Error('hora invalida');
      customError.statusCode = 400;
      next(customError);
      return;

    }

    validaReserva(ctx.instance).then(reservaValida => {
      if (!reservaValida) {
        let customError = new Error('Horario ocupado');
        customError.statusCode = 422;
        next(customError);
        return;
  
      } else {
  
  
        //Tratamento total de horas.
  
        let inicioEm = ctx.instance.inicioem.getTime();
        let fimEm = ctx.instance.fimem.getTime();
        let duracao = ((fimEm - inicioEm) / 3600000) * 60;
  
  
  
  
        // if (duracao < 60){
        //      let customError= new Error('hora invalida');
        //     erro.statusCode = 422;
        //    }
  
  
        ctx.instance.duracao = duracao;
  
        //calculo do valor de acordo com o tempo
        let valor = duracao * 0.5;
        ctx.instance.valor = valor;
        ctx.instance.status = 'ativa';
        next()
        return;
      }
    });
  });

  //overhead deleteById aftersave
  Reservas.on('attached', function (ctx, next) {
    Reservas.deleteById = function (id, options, callback) {
      if (id) {
        Reservas.updateAll(
          { id: id },
          {
            status: "cancelada",
            canceladaem: new Date(),
          },
          callback
        );
        // } else{
        //   let erro = new Error('id não encontrado')
        //   erro.statusCode = 400;
        // }
      };
    };
  });

};
