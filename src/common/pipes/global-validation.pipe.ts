// src/common/pipes/global-validation.pipe.ts
import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export function createGlobalValidationPipe() {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (validationErrors: ValidationError[]) => {
      const errors: Record<string, string[]> = {};

      validationErrors.forEach((err) => {
        if (!err.constraints) return;

        errors[err.property] = Object.values(err.constraints);
      });

      return new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          errors,
        },
        HttpStatus.BAD_REQUEST,
      );
    },
  });
}
