"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const request_context_1 = require("../request-context/request-context");
let AllExceptionsFilter = class AllExceptionsFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        const requestId = request_context_1.RequestContext.get('requestId');
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'object') {
                const objResponse = exceptionResponse;
                message = objResponse.message || exception.message;
            }
            else {
                message = exception.message;
            }
        }
        else if (exception instanceof Error) {
            // Handle Prisma errors
            const err = exception;
            if (err.code === 'P2002') {
                // Unique constraint violation
                status = common_1.HttpStatus.CONFLICT;
                message = 'Unique constraint violation';
            }
            else if (err.code === 'P2025') {
                // Record not found
                status = common_1.HttpStatus.NOT_FOUND;
                message = 'Record not found';
            }
            else if (err.code === 'P2003') {
                // Foreign key constraint violation
                status = common_1.HttpStatus.BAD_REQUEST;
                message = 'Invalid reference';
            }
            else {
                message = err.message || 'Internal server error';
            }
        }
        const errorResponse = {
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
            ...(requestId && { requestId }),
        };
        response.status(status).json(errorResponse);
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map