export interface ApiResponseError {
  status: number;
  name: string;
  message: string;
  info: string;
}

export interface ApiResponse extends Record<string, any> {
  status: number;
}
