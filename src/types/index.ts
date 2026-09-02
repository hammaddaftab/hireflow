/**
 * Global Application Envelope & Error Types
 */

export interface ApiInvalidParam {
  name: string;
  reason: string;
}

export interface ApiErrorDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  invalidParams?: ApiInvalidParam[];
}

export interface ApiMetadata {
  total?: number;
  page?: number;
  limit?: number;
  timestamp: string;
  [key: string]: unknown;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: ApiErrorDetail;
  metadata?: ApiMetadata;
}
