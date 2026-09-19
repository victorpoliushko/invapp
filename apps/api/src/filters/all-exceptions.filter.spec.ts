import { ArgumentsHost, BadRequestException, HttpStatus, Logger } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

function createHost(request: any, response: any): ArgumentsHost {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let response: { status: jest.Mock; json: jest.Mock };
  let request: { method: string; url: string };

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    request = { method: 'GET', url: '/api/portfolios/123' };
  });

  it('preserves the status and body shape for an HttpException', () => {
    const exception = new BadRequestException({
      message: 'Validation failed',
      errors: [{ field: 'name', errors: ['name must be defined'] }],
    });

    filter.catch(exception, createHost(request, response));

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Validation failed',
        errors: [{ field: 'name', errors: ['name must be defined'] }],
        path: '/api/portfolios/123',
        timestamp: expect.any(String),
      }),
    );
  });

  it('returns a generic 500 without leaking internal details for an unknown error', () => {
    const exception = new Error('secret db connection string exposed');

    filter.catch(exception, createHost(request, response));

    expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      }),
    );
    const body = response.json.mock.calls[0][0];
    expect(JSON.stringify(body)).not.toContain('secret db connection string');
  });

  it('logs the exception with method, url, status, and stack trace', () => {
    const errorSpy = jest.spyOn(Logger.prototype, 'error');
    const exception = new Error('boom');

    filter.catch(exception, createHost(request, response));

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('GET /api/portfolios/123 500: boom'),
      exception.stack,
    );
  });
});
