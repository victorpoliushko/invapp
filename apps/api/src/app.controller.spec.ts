import { of, throwError } from 'rxjs';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appService: any;
  let httpService: any;
  let controller: AppController;

  beforeEach(() => {
    appService = {};
    httpService = { get: jest.fn() };
    controller = new AppController(appService, httpService);
  });

  describe('getLocation', () => {
    const makeReq = (headers: Record<string, string>, remoteAddress: string) =>
      ({ headers, socket: { remoteAddress } }) as any;

    it('uses the first IP from x-forwarded-for when present', async () => {
      httpService.get.mockReturnValue(of({ data: { country: 'Ukraine', city: 'Lviv' } }));
      const req = makeReq({ 'x-forwarded-for': '203.0.113.5, 10.0.0.1' }, '10.0.0.1');

      const result = await controller.getLocation(req);

      expect(httpService.get).toHaveBeenCalledWith('http://ip-api.com/json/203.0.113.5');
      expect(result).toEqual({ country_name: 'Ukraine', city: 'Lviv' });
    });

    it('falls back to the socket remote address when there is no x-forwarded-for header', async () => {
      httpService.get.mockReturnValue(of({ data: { country: 'USA', city: 'NYC' } }));
      const req = makeReq({}, '198.51.100.7');

      await controller.getLocation(req);

      expect(httpService.get).toHaveBeenCalledWith('http://ip-api.com/json/198.51.100.7');
    });

    it('queries the local endpoint (no ip suffix) for loopback addresses', async () => {
      httpService.get.mockReturnValue(of({ data: { country: null, city: null } }));
      const req = makeReq({}, '127.0.0.1');

      await controller.getLocation(req);

      expect(httpService.get).toHaveBeenCalledWith('http://ip-api.com/json/');
    });

    it('returns nulls when the geo lookup fails', async () => {
      httpService.get.mockReturnValue(throwError(() => new Error('network error')));
      const req = makeReq({}, '198.51.100.7');

      const result = await controller.getLocation(req);

      expect(result).toEqual({ country_name: null, city: null });
    });
  });
});
