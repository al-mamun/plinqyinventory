import { Injectable, ExecutionContext, CallHandler } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const { httpAdapter } = this.httpAdapterHost;

    const isGetRequest = httpAdapter.getRequestMethod(request) === 'GET';
    const excludePaths = ['/api/auth', '/api/users/me'];
    const requestPath = httpAdapter.getRequestUrl(request);

    if (
      !isGetRequest ||
      excludePaths.some((path) => requestPath.includes(path))
    ) {
      return undefined;
    }

    return httpAdapter.getRequestUrl(request);
  }
}
