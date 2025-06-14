import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_KEY, CACHE_TTL } from '../decorators/cache.decorator';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private cache = new Map<string, { data: any; expiry: number }>();

  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const cacheKey = this.reflector.get<string>(
      CACHE_KEY,
      context.getHandler(),
    );
    const cacheTtl = this.reflector.get<number>(
      CACHE_TTL,
      context.getHandler(),
    );

    if (!cacheKey) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const fullCacheKey = `${cacheKey}:${JSON.stringify(request.params)}:${JSON.stringify(request.query)}`;

    // Check cache
    const cached = this.cache.get(fullCacheKey);
    if (cached && cached.expiry > Date.now()) {
      return of(cached.data);
    }

    return next.handle().pipe(
      tap((response) => {
        // Store in cache
        this.cache.set(fullCacheKey, {
          data: response,
          expiry: Date.now() + cacheTtl * 1000,
        });
      }),
    );
  }
}
