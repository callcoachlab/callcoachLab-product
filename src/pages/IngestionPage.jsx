import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CloudUpload, FileAudio, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { ingestionService } from '../services/ingestionService';
import { useToast } from '../hooks/useToast';
import { ErrorBoundary } from '../components/ErrorBoundary';

const SINGLE_MODE = 'single';
const BULK_MODE = 'bulk';
const INGESTION_MODE_STORAGE_KEY = 'callcoach.ingestion.mode';
const INGESTION_SINGLE_STORAGE_KEY = 'callcoach.ingestion.single';
const INGESTION_BULK_STORAGE_KEY = 'callcoach.ingestion.bulk';

const formatBytes = (bytes = 0) => {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

function UploadProgress({ progress, label }) {
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function SingleUploadCard() {
  const toast = useToast();
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileMeta, setSelectedFileMeta] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(INGESTION_SINGLE_STORAGE_KEY) || 'null');
      if (saved) {
        setSelectedFileMeta(saved.selectedFileMeta || null);
        setUploadProgress(saved.uploadProgress || 0);
        setStatus(saved.status || 'idle');
        setResult(saved.result || null);
        setError(saved.error || '');
      }
    } catch {
      // Ignore malformed storage data.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      INGESTION_SINGLE_STORAGE_KEY,
      JSON.stringify({
        selectedFileMeta,
        uploadProgress,
        status,
        result,
        error,
      })
    );
  }, [selectedFileMeta, uploadProgress, status, result, error]);

  const reset = () => {
    setSelectedFile(null);
    setSelectedFileMeta(null);
    setUploadProgress(0);
    setStatus('idle');
    setError('');
    setResult(null);
    localStorage.removeItem(INGESTION_SINGLE_STORAGE_KEY);
  };

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('audio/') && file.name.match(/\.(mp3|wav|m4a|aac|ogg|webm)$/i) === null) {
      toast.error('Please select a valid audio file.');
      return;
    }
    setSelectedFile(file);
    setSelectedFileMeta({ name: file.name, size: file.size });
    setError('');
    setStatus('ready');
  };

  const onSubmit = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setError('');
      setStatus('uploading');
      setUploadProgress(0);

      const init = await ingestionService.createSingleUpload();
      const callUploadId = init?.callUploadId || init?.data?.callUploadId;
      const uploadUrl = init?.uploadUrl || init?.data?.uploadUrl;

      if (!callUploadId || !uploadUrl) {
        throw new Error('The server did not return upload details.');
      }

      await ingestionService.uploadToPresignedUrl(uploadUrl, selectedFile, setUploadProgress);
      await ingestionService.finalizeSingleUpload(callUploadId);

      let finalStatus = null;
      for (let i = 0; i < 30; i += 1) {
        const poll = await ingestionService.getSingleUploadStatus(callUploadId);
        const current = poll?.state || poll?.data?.state || poll?.status;
        finalStatus = current;
        if (current === 'COMPLETED' || current === 'SUCCEEDED' || current === 'READY') {
          break;
        }
        if (current === 'FAILED' || current === 'ERROR') {
          throw new Error('Upload processing failed.');
        }
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      setStatus('completed');
      setResult({ callUploadId, fileName: selectedFile.name, size: selectedFile.size });
      toast.success('Audio upload completed successfully.');
    } catch (e) {
      const message = e?.response?.data?.error?.message || e?.message || 'Upload failed.';
      setError(message);
      setStatus('error');
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Single call upload</p>
          <p className="text-xs text-gray-500">Upload one audio file and finalize the ingestion.</p>
        </div>
        <button onClick={reset} className="text-xs text-gray-500 hover:text-gray-700">Reset</button>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
        onClick={() => inputRef.current?.click()}
        className={`mt-4 cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
          isDragging ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <CloudUpload className={`mx-auto h-10 w-10 ${isDragging ? 'text-green-600' : 'text-gray-400'}`} />
        <p className="mt-3 text-sm font-medium text-gray-700">Drop audio file here or click to browse</p>
      </div>

      {(selectedFile || selectedFileMeta) && (
        <div className="mt-4 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileAudio className="h-4 w-4 text-green-600" />
              <span className="font-medium">{selectedFile?.name || selectedFileMeta?.name}</span>
            </div>
            <span className="text-xs text-gray-500">{formatBytes(selectedFile?.size || selectedFileMeta?.size || 0)}</span>
          </div>
        </div>
      )}

      {isUploading && <UploadProgress progress={uploadProgress} label="Uploading audio" />}

      {status === 'error' && error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {status === 'completed' && result && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          Upload finished for {result.callUploadId}
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={!selectedFile || isUploading}
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isUploading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</>
        ) : (
          'Start upload'
        )}
      </button>
    </div>
  );
}

function BulkUploadCard() {
  const toast = useToast();
  const [job, setJob] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [csvFileName, setCsvFileName] = useState('');
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [status, setStatus] = useState('idle');
  const [stats, setStats] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [error, setError] = useState('');
  const csvInputRef = useRef(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(INGESTION_BULK_STORAGE_KEY) || 'null');
      if (saved) {
        setJob(saved.job || null);
        setCsvFileName(saved.csvFileName || '');
        setStatus(saved.status || 'idle');
        setStats(saved.stats || null);
        setWarnings(saved.warnings || []);
        setError(saved.error || '');
      }
    } catch {
      // Ignore malformed storage data.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      INGESTION_BULK_STORAGE_KEY,
      JSON.stringify({
        job,
        csvFileName,
        status,
        stats,
        warnings,
        error,
      })
    );
  }, [job, csvFileName, status, stats, warnings, error]);

  const refreshJob = useCallback(async (jobId) => {
    const data = await ingestionService.getBulkJob(jobId);
    setJob(data);
    setStats({
      totalRows: data?.totalRows ?? data?.data?.totalRows ?? 0,
      okCount: data?.okCount ?? data?.data?.okCount ?? 0,
      warningCount: data?.warningCount ?? data?.data?.warningCount ?? 0,
      errorCount: data?.errorCount ?? data?.data?.errorCount ?? 0,
    });
    setWarnings(data?.warnings ?? data?.data?.warnings ?? []);
  }, []);

  const createJob = async () => {
    try {
      setIsCreatingJob(true);
      setError('');
      const data = await ingestionService.createBulkUpload({});
      const nextJob = data?.jobId || data?.data?.jobId || data;
      setJob(nextJob);
      setStatus('job-created');
      toast.success('Bulk upload job created.');
    } catch (e) {
      const message = e?.response?.data?.error?.message || e?.message || 'Could not create bulk job.';
      setError(message);
      toast.error(message);
    } finally {
      setIsCreatingJob(false);
    }
  };

  const uploadCsv = async (file) => {
    if (!job) return;
    try {
      setIsUploadingCsv(true);
      setError('');
      setCsvFile(file);
      setCsvFileName(file.name);
      await ingestionService.uploadBulkCsv(job, file);
      await refreshJob(job);
      setStatus('csv-uploaded');
      toast.success('CSV uploaded successfully.');
    } catch (e) {
      const message = e?.response?.data?.error?.message || e?.message || 'CSV upload failed.';
      setError(message);
      toast.error(message);
    } finally {
      setIsUploadingCsv(false);
    }
  };

  const commitJob = async () => {
    if (!job) return;
    try {
      setIsCommitting(true);
      setError('');
      await ingestionService.commitBulkJob(job);
      await refreshJob(job);
      setStatus('committed');
      toast.success('Bulk upload committed.');
    } catch (e) {
      const message = e?.response?.data?.error?.message || e?.message || 'Commit failed.';
      setError(message);
      toast.error(message);
    } finally {
      setIsCommitting(false);
    }
  };

  useEffect(() => {
    let interval;
    if (job && status !== 'committed') {
      interval = setInterval(async () => {
        try {
          await refreshJob(job);
        } catch {}
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [job, refreshJob, status]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Bulk upload</p>
          <p className="text-xs text-gray-500">Create a job, upload a CSV, review warnings, and commit.</p>
        </div>
        <button onClick={createJob} disabled={isCreatingJob} className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white disabled:bg-gray-300">
          {isCreatingJob ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          {job ? 'New job' : 'Create job'}
        </button>
      </div>

      {job && (
        <div className="mt-4 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
          <span className="font-medium">Job ID:</span> {job}
        </div>
      )}

      {csvFileName && (
        <div className="mt-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
          <span className="font-medium">CSV:</span> {csvFileName}
        </div>
      )}

      {job && (
        <div className="mt-4 rounded-2xl border border-dashed border-gray-200 p-6 text-center">
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => uploadCsv(e.target.files?.[0])}
          />
          <FileSpreadsheet className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm font-medium text-gray-700">Upload CSV file</p>
          <button
            onClick={() => csvInputRef.current?.click()}
            disabled={isUploadingCsv}
            className="mt-3 inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:bg-gray-300"
          >
            {isUploadingCsv ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Select CSV
          </button>
        </div>
      )}

      {stats && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <p className="text-xs text-gray-500">Total rows</p>
            <p className="text-lg font-semibold text-gray-900">{stats.totalRows}</p>
          </div>
          <div className="rounded-xl bg-green-50 p-3 text-center">
            <p className="text-xs text-gray-500">OK</p>
            <p className="text-lg font-semibold text-green-700">{stats.okCount}</p>
          </div>
          <div className="rounded-xl bg-yellow-50 p-3 text-center">
            <p className="text-xs text-gray-500">Warnings</p>
            <p className="text-lg font-semibold text-yellow-700">{stats.warningCount}</p>
          </div>
          <div className="rounded-xl bg-red-50 p-3 text-center">
            <p className="text-xs text-gray-500">Errors</p>
            <p className="text-lg font-semibold text-red-700">{stats.errorCount}</p>
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-xl border border-yellow-200">
          <div className="bg-yellow-50 px-3 py-2 text-sm font-semibold text-yellow-800">Warnings</div>
          <div className="max-h-64 overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Row</th>
                  <th className="px-3 py-2 text-left">Message</th>
                </tr>
              </thead>
              <tbody>
                {warnings.map((warning, idx) => (
                  <tr key={idx} className="border-t border-gray-100">
                    <td className="px-3 py-2">{warning.row ?? warning.index ?? idx + 1}</td>
                    <td className="px-3 py-2">{warning.message ?? warning.reason ?? JSON.stringify(warning)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {job && (
        <button
          onClick={commitJob}
          disabled={isCommitting || !stats || stats.errorCount > 0}
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isCommitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Commit job
        </button>
      )}
    </div>
  );
}

export function IngestionPage() {
  const [mode, setMode] = useState(() => {
    try {
      const savedMode = localStorage.getItem(INGESTION_MODE_STORAGE_KEY);
      return savedMode === BULK_MODE ? BULK_MODE : SINGLE_MODE;
    } catch {
      return SINGLE_MODE;
    }
  });

  useEffect(() => {
    localStorage.setItem(INGESTION_MODE_STORAGE_KEY, mode);
  }, [mode]);

  return (
    <ErrorBoundary>
      <div className="min-h-full bg-gray-50 p-5">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-green-600">Ingestion</p>
              <h1 className="text-2xl font-bold text-gray-900">Upload calls</h1>
            </div>
            <div className="inline-flex rounded-xl bg-white p-1 shadow-sm ring-1 ring-gray-200">
              {[
                { key: SINGLE_MODE, label: 'Single upload' },
                { key: BULK_MODE, label: 'Bulk upload' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setMode(tab.key)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === tab.key ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {mode === SINGLE_MODE ? <SingleUploadCard /> : <BulkUploadCard />}
        </div>
      </div>
    </ErrorBoundary>
  );
}
