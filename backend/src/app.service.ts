import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Automation Hub API is running! Visit /docs for API documentation.';
  }
}
