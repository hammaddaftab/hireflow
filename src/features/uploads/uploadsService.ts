// Singleton registry for uploaded resumes stored in Vercel Blob Storage

export interface UploadedResumeRecord {
  id: string;
  filename: string;
  size: number;
  contentType: string;
  status: "stored" | "uploading" | "error";
  blobUrl: string;
  pathname: string;
  hash: string;
  jobId: string | null;
  uploadedAt: string;
}

// Initial seed data reflecting sample resumes in workspace
const INITIAL_SEEDS: UploadedResumeRecord[] = [
  {
    id: "upl_mock_resume_a",
    filename: "mock_resume_a.pdf",
    size: 292618,
    contentType: "application/pdf",
    status: "stored",
    blobUrl: "storage://resumes/mock_resume_a.pdf",
    pathname: "resumes/mock_resume_a.pdf",
    hash: "2dc311a21fd4bfab3102ecdccd7bd226a0ac8fc927722bc162873a49d23183b5",
    jobId: "job-sample-1",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: "upl_mock_resume_b",
    filename: "mock_resume_b.pdf",
    size: 517151,
    contentType: "application/pdf",
    status: "stored",
    blobUrl: "storage://resumes/mock_resume_b.pdf",
    pathname: "resumes/mock_resume_b.pdf",
    hash: "ae32a851ce3e56b6c00f76798732a39eb207cc569d437de005bdbbf517ebfefa",
    jobId: "job-sample-1",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
];

export class UploadsService {
  private registry: Map<string, UploadedResumeRecord> = new Map();

  constructor(initialRecords?: UploadedResumeRecord[]) {
    const seeds = initialRecords || INITIAL_SEEDS;
    seeds.forEach((rec) => this.registry.set(rec.id, rec));
  }

  getAll(): UploadedResumeRecord[] {
    return Array.from(this.registry.values()).sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  getById(id: string): UploadedResumeRecord | null {
    return this.registry.get(id) || null;
  }

  add(record: UploadedResumeRecord): UploadedResumeRecord {
    this.registry.set(record.id, record);
    return record;
  }

  addBatch(records: UploadedResumeRecord[]): UploadedResumeRecord[] {
    records.forEach((rec) => this.registry.set(rec.id, rec));
    return records;
  }

  delete(id: string): boolean {
    return this.registry.delete(id);
  }

  clear(): void {
    this.registry.clear();
  }

  getStats() {
    const items = this.getAll();
    const totalBytes = items.reduce((acc, item) => acc + item.size, 0);
    const stored = items.filter((item) => item.status === "stored").length;
    return {
      total: items.length,
      totalBytes,
      stored,
    };
  }
}

// Global singleton instance for in-memory persistence in development / API routes
const globalForUploads = globalThis as unknown as { uploadsService?: UploadsService };
export const uploadsService = globalForUploads.uploadsService ?? new UploadsService();

if (process.env.NODE_ENV !== "production") {
  globalForUploads.uploadsService = uploadsService;
}
