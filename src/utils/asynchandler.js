const asynchandler = (requesHandler) => {
  return (req, res, next) => {
    Promise.resolve(requesHandler(req, res, next)).catch((err) => next(err));
  };
};
export { asynchandler };
/////////////////////////////////////////////////////////////////////
// const asynhandler = ()=>{}
// const asynchandler = (fun)=>{
//     () => {}
//   }
// we can write this as "const asynchandler = () => (fun) => { }

// 2nd way of deffine asynchandler

// const asynchandler = (fun) => async (req, res, next) => {
//   try {
//     await fun(req, res, next);
//   } catch (error) {
//     res.status(error.code || 500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
