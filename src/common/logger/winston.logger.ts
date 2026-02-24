import * as winston from 'winston';
import 'winston-daily-rotate-file';

const isProd = process.env.NODE_ENV === 'production';

export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      isProd
        ? winston.format.json()
        : winston.format.combine(winston.format.colorize(), winston.format.simple())
    ),
    transports: [
        new winston.transports.DailyRotateFile({
            filename: 'logs/app-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d',
        }),
        new winston.transports.DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '30d',
        }),
    ],
});
