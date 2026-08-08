export interface BaseResponse<T> {
  data: T;
  total: number;
}

export interface PartialResponse<T> {
  data: T;
}