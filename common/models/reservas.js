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
    // return new Promise((resolve, reject) => {
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
        const dados = await Reservas.find(filter)
        return dados.length === 0 ? true:false;
      } catch(e){ throw new Error(e.message);
      

      }
      
      // Reservas.find(filter).then(dados => {
      //   if (dados.length === 0) {
      //     resolve(true);
      //   } else {
      //     resolve(false);
      //   }
      // }).catch(err => {
      //   reject(err)
      // })
  //  })
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

    validaReserva(ctx.instance).then(estaVazio => {
      if (!estaVazio) {
        let customError = new Error('Horario ocupado');
        customError.statusCode = 422;
        next(customError);
        return;
  
      } else {
  
  
        //Tratamento total de horas.
  
        let inicioEm = ctx.instance.inicioem.getTime();
        let fimEm = ctx.instance.fimem.getTime();
        let duracao = ((fimEm - inicioEm) / 3600000) * 60;
  
  
  
  
        //  if (duracao < 60){
        //       let customError= new Error('hora invalida');
        //      erro.statusCode = 422;
        //     }
  
  
        ctx.instance.duracao = duracao;`  `
  
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
// const verificaSaldo = function() {
//   return new Promise(function(resolve) {
//     setTimeout(function() {
//       resolve()
//     }, 10000);
//   })

// }
// async function wololo() {
//   try {
//     let validado = await verificaSaldo();
//   } catch(e) {

//   }
//   return true;
// }