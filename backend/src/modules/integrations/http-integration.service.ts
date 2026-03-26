import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HttpIntegrationService {
  constructor(private http: HttpService) {}

  async execute(config: any) {
    const { url, method = 'GET', headers = {}, body } = config;

    if (!url) {
      throw new Error('HTTP integration requires URL');
    }

    try {
      const response = await firstValueFrom(
        this.http.request({
          url,
          method,
          headers,
          data: body,
        }),
      );

      return {
        status: response.status as number,
        statusText: response.statusText as string,
        data: response.data as any,
      };
    } catch (error: any) {
      throw new Error(`HTTP request failed: ${error.response?.statusText || error.message}`);
    }
  }
}
