import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';

interface Document {
  id: number;
  name: string;
  description: string;
  file: string;
  uploaded_at: string;
  dependent: number;
  institution: number | null;
  institution_detail: { id: number; name: string } | null;
}

interface Institution {
  id: number;
  name: string;
}

export const DependentDocuments: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [institutionId, setInstitutionId] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
    fetchInstitutions();
  }, [id]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/documents/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // The endpoint returns all documents for user's dependents, filter for this dependent
        const dependentDocs = data.filter((doc: Document) => doc.dependent.toString() === id);
        setDocuments(dependentDocs);
      }
    } catch (err) {
      console.error("Failed to fetch documents", err);
    }
  };

  const fetchInstitutions = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settlement/institutions/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setInstitutions(data);
      }
    } catch (err) {
      console.error("Failed to fetch institutions", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name || !id) return;

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('file', file);
    formData.append('dependent', id);
    if (institutionId) {
      formData.append('institution', institutionId);
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/documents/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload document');
      }

      setSuccessMsg('Document uploaded successfully.');
      setName('');
      setDescription('');
      setFile(null);
      setInstitutionId('');

      // Reset file input visually
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      fetchDocuments();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred during upload.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (docId: number, filename: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/documents/${docId}/download/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to download file", err);
      alert("Failed to download document");
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">

        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">{t('documents_title') || 'Documents'}</h1>
          <Link to="/dependents" className="text-teal-600 hover:text-teal-900 font-medium text-sm">
            &larr; {t('back_to_dependents') || 'Back to Dependents'}
          </Link>
        </div>

        <div className="bg-white shadow sm:rounded-2xl overflow-hidden mb-8">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6 bg-teal-50">
            <h3 className="text-lg leading-6 font-medium text-teal-900">
              {t('upload_document') || 'Upload Document'}
            </h3>
          </div>

          <div className="px-4 py-5 sm:p-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-4">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="documentName" className="block text-sm font-medium text-gray-700">Document Name *</label>
                  <input
                    id="documentName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="institutionSelect" className="block text-sm font-medium text-gray-700">Institution (Optional)</label>
                  <select
                    id="institutionSelect"
                    value={institutionId}
                    onChange={(e) => setInstitutionId(e.target.value)}
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-xl shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  >
                    <option value="">None</option>
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="documentDescription" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="documentDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">File *</label>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  required
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || !file || !name}
                  className="w-full sm:w-auto flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400"
                >
                  {isLoading ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-2xl overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {t('document_list') || 'Document List'}
            </h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {documents.length === 0 ? (
              <li className="px-4 py-5 sm:px-6 text-gray-500 text-sm">
                No documents found.
              </li>
            ) : (
              documents.map(doc => (
                <li key={doc.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                    <span className="text-sm text-gray-500">{doc.description}</span>
                    <div className="flex space-x-4 mt-1">
                      <span className="text-xs text-gray-400">
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </span>
                      {doc.institution_detail && (
                        <span className="text-xs text-teal-600 font-medium">
                          {doc.institution_detail.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => handleDownload(doc.id, doc.name)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-xl shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none"
                    >
                      Download
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

      </div>
    </div>
  );
};
