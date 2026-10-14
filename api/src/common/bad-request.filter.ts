import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';

const PARSER_MESSAGE = /JSON|position \d+|Unexpected token|Unterminated/i;

/**
 * Body-parser failures reach Nest as a BadRequestException carrying the raw parser message
 * (e.g. "Expected property name or '}' in JSON at position 1"). Validation errors keep their
 * detail; parser internals are replaced by a generic message.
 */
@Catch(BadRequestException)
export class BadRequestFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const body = exception.getResponse();
    const message =
      typeof body === 'string'
        ? body
        : ((body as { message?: string | string[] }).message ?? '');

    if (typeof message === 'string' && PARSER_MESSAGE.test(message)) {
      res
        .status(400)
        .json({ statusCode: 400, message: 'Invalid request body', error: 'Bad Request' });
      return;
    }
    res
      .status(400)
      .json(
        typeof body === 'string'
          ? { statusCode: 400, message: body, error: 'Bad Request' }
          : body,
      );
  }
}
