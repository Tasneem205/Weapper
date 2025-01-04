import responses from "../helper/responses.js";

function errorHandler (error, req, res, next){
    console.log(error);
    responses.internalServerError(res);
}

export default errorHandler;