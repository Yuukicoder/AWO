import axiosInstance from '@/utils/axiosInstance';

const ingestService = {
  /** List ingest payloads with optional filters */
  listIngests: (params = {}) =>
    axiosInstance.get('/ingest', { params }),

  /** Get single ingest by ID */
  getIngestById: (id) =>
    axiosInstance.get(`/ingest/${id}`),

  /**
   * Submit a manual ingest from the web form → goes through AI triage
   * @param {object} payload - { title, description, priority, category, requestedBy, createdBy }
   */
  submitManual: (payload) =>
    axiosInstance.post('/ingest/manual', {
      source: 'manual',
      ...payload,
    }),

  /**
   * Approve an ingest → creates ticket
   * @param {string} id - ingest _id
   * @param {object} overrides - optional field overrides: { title, priority, category, assignedTo }
   */
  approveIngest: (id, overrides = {}) =>
    axiosInstance.post(`/ingest/${id}/approve`, overrides),

  /**
   * Reject an ingest
   * @param {string} id - ingest _id
   * @param {string} reason
   */
  rejectIngest: (id, reason = '') =>
    axiosInstance.post(`/ingest/${id}/reject`, { reason }),
};

export default ingestService;
