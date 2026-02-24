// API response formatters
import { BaseResponse, PaginatedResponse } from '../types';

export const successResponse = <T>(message: string, object: T | null = null): BaseResponse<T> => ({
  Success: true,
  Message: message,
  Object: object,
  Errors: null
});

export const errorResponse = (message: string, errors: string[]): BaseResponse => ({
  Success: false,
  Message: message,
  Object: null,
  Errors: errors
});

export const paginatedResponse = <T>(
  message: string,
  data: T[],
  pageNumber: number,
  pageSize: number,
  totalSize: number
): PaginatedResponse<T> => ({
  Success: true,
  Message: message,
  Object: data,
  PageNumber: pageNumber,
  PageSize: pageSize,
  TotalSize: totalSize,
  Errors: null
});
