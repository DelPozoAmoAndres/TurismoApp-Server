import { NextFunction } from "express";
import moment from 'moment-timezone'

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const loggerDefault = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.splat(),
        winston.format.simple(),
        winston.format.timestamp({
            format: () => moment().tz('Europe/Madrid').format('YYYY-MM-DD HH:mm:ss')
        }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new DailyRotateFile({
            filename: 'logs/AsTour-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            dirname: 'logs',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            meta:true,
            format: winston.format.combine(
                winston.format.printf(({ level, message, timestamp, ip}: { level: string, message: string, timestamp: string, ip: string })=> {
                    return `${timestamp} [${level.toUpperCase()}] ${ip ?"("+ip+")" : ''} ${message} `;
                })
            )
        })
    ]
});

let logger: any = loggerDefault;

const loggerMiddleware = (req: any, res: Response, next: NextFunction) => {
    logger = loggerDefault.child({ ip: req.ip });
    next();
};

export { logger, loggerMiddleware }