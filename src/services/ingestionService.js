import axios from 'axios';
import api from './api';
import { API_ENDPOINTS, INGESTION_BASE_URL } from '../config/api';

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

const ingestionApi = axios.create({
  baseURL: INGESTION_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ingestionService = {
  async createSingleUpload(payload = {}) {
    const response = await ingestionApi.post(API_ENDPOINTS.INGESTION_SINGLE, payload);
    return unwrap(response);
  },

  async finalizeSingleUpload(callUploadId) {
    const response = await ingestionApi.post(`${API_ENDPOINTS.INGESTION_SINGLE}/${callUploadId}/finalize`);
    return unwrap(response);
  },

  async getSingleUploadStatus(callUploadId) {
    const response = await ingestionApi.get(`${API_ENDPOINTS.INGESTION_SINGLE}/${callUploadId}`);
    return unwrap(response);
  },

  async createBulkUpload(payload = {}) {
    const response = await ingestionApi.post(API_ENDPOINTS.INGESTION_BULK_UPLOAD, payload);
    return unwrap(response);
  },

  async uploadBulkCsv(jobId, file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await ingestionApi.post(
      `${API_ENDPOINTS.INGESTION_BULK}/${jobId}/upload-csv`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return unwrap(response);
  },

  async getBulkJob(jobId) {
    const response = await ingestionApi.get(`${API_ENDPOINTS.INGESTION_BULK}/${jobId}`);
    return unwrap(response);
  },

  async commitBulkJob(jobId) {
    const response = await ingestionApi.post(`${API_ENDPOINTS.INGESTION_BULK}/${jobId}/commit`);
    return unwrap(response);
  },

  async uploadToPresignedUrl(uploadUrl, file, onProgress) {
    return axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'x-amz-server-side-encryption': 'AES256',
      },
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    });
  },
};
