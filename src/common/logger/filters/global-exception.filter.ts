import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { logger } from '../winston.logger';
import { RequestWithContext } from '../types/request-with-context.type';
import { PrismaService } from '../../../prisma/prisma.service';


@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    constructor(private prisma: PrismaService) {}

    async catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const req = ctx.getRequest<RequestWithContext>();
        const res = ctx.getResponse<Response>();

        const status =
          exception instanceof HttpException
            ? exception.getStatus()
            : 500;

        const response =
          exception instanceof HttpException
            ? exception.getResponse()
            : { message: 'Internal server error' };

        const errorMessage =
          typeof response === 'string'
            ? response
            : response['message']
              ? Array.isArray(response['message'])
                ? response['message'].join(', ')
                : String(response['message'])
              : 'Internal server error';

        if (status >= 500) {
            logger.error(errorMessage, {
                requestId: req.requestId,
                status,
                response,
                stack: exception instanceof Error ? exception.stack : undefined,
            });

            await this.prisma.serverErrorLog.create({
                data: {
                    status,
                    message: errorMessage,
                    stack: exception instanceof Error ? exception.stack : undefined,
                    path: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    userId: req.user?.id,
                    requestId: req.requestId,
                },
            });
        }

        res.status(status).json({
            ...(typeof response === 'object' ? response : { message: response }),
            requestId: req.requestId,
        });
    }
}
