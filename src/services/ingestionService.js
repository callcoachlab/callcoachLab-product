import api from './api';
import { API_ENDPOINTS, INGESTION_BASE_URL } from '../config/api';

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

const toIngestionUrl = (path) => {
  const base = INGESTION_BASE_URL.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return `${base}/${cleanPath}`;
};

export const ingestionService = {
  async createSingleUpload(payload = {}) {
    const response = await api.post(
      toIngestionUrl(API_ENDPOINTS.INGESTION_SINGLE),
      payload,
      { withCredentials: true }
    );
    return unwrap(response);
  },

  async finalizeSingleUpload(callUploadId) {
    const response = await api.post(
      toIngestionUrl(`${API_ENDPOINTS.INGESTION_SINGLE}/${callUploadId}/finalize`),
      {},
      { withCredentials: true }
    );
    return unwrap(response);
  },

  async getSingleUploadStatus(callUploadId) {
    const response = await api.get(
      toIngestionUrl(`${API_ENDPOINTS.INGESTION_SINGLE}/${callUploadId}`),
      { withCredentials: true }
    );
    return unwrap(response);
  },

  async createBulkUpload(payload = {}) {
    const normalizedPayload = {
      ...(payload || {}),
      csvFileName: payload?.csvFileName || payload?.fileName || payload?.filename || '',
    };

    const response = await api.post(
      toIngestionUrl(API_ENDPOINTS.INGESTION_BULK_UPLOAD),
      normalizedPayload,
      { withCredentials: true }
    );
    return unwrap(response);
  },

  async uploadBulkCsv(jobId, file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('csvFileName', file.name);
    formData.append('fileName', file.name);
    formData.append('filename', file.name);

    const response = await api.post(
      toIngestionUrl(`${API_ENDPOINTS.INGESTION_BULK}/${jobId}/upload-csv`),
      formData,
      {
        withCredentials: true,
        headers: {
          // The shared `api` instance defaults Content-Type to 'application/json'.
          // For FormData bodies we must clear that so axios/the browser can set
          // 'multipart/form-data; boundary=...' itself — otherwise the file never
          // actually reaches the server.
          'Content-Type': undefined,
        },
        onUploadProgress: (event) => {
          if (event.total) {
            console.log('CSV upload progress:', Math.round((event.loaded / event.total) * 100));
          }
        },
      }
    );

    return unwrap(response);
  },

  async getBulkJob(jobId) {
    const response = await api.get(
      toIngestionUrl(`${API_ENDPOINTS.INGESTION_BULK}/${jobId}`),
      { withCredentials: true }
    );
    return unwrap(response);
  },

  async commitBulkJob(jobId, payload = {}) {
    const normalizedPayload = {
      ...(payload || {}),
      jobId,
      csvFileName: payload?.csvFileName || payload?.fileName || payload?.filename || '',
      fileName: payload?.fileName || payload?.csvFileName || payload?.filename || '',
      filename: payload?.filename || payload?.csvFileName || payload?.fileName || '',
    };

    const response = await api.post(
      toIngestionUrl(`${API_ENDPOINTS.INGESTION_BULK}/${jobId}/commit`),
      normalizedPayload,
      { withCredentials: true }
    );
    return unwrap(response);
  },

  async uploadToPresignedUrl(uploadUrl, file, onProgress) {
    const response = await api.put(uploadUrl, file, {
      withCredentials: false,
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    });

    return unwrap(response);
  },
};