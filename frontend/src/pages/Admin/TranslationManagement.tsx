import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';

interface TranslationItem {
  id: number;
  key: string;
  en: string;
  de: string;
}

export const TranslationManagement = () => {
  const [translations, setTranslations] = useState<TranslationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t, refreshTranslations } = useTranslation();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ key: '', en: '', de: '' });

  const fetchTranslations = async () => {
    try {
      const response = await api.get('/translations/');
      setTranslations(response.data);
    } catch (err) {
      setError(t('error_fetching_translations'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranslations();
  }, []);

  const handleSave = async (id?: number) => {
    try {
      if (id) {
        await api.put(`/translations/${id}/`, editForm);
      } else {
        await api.post('/translations/', editForm);
      }
      setEditingId(null);
      setEditForm({ key: '', en: '', de: '' });
      await fetchTranslations();
      refreshTranslations();
    } catch (err) {
      setError(t('error_saving_translation'));
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm(t('confirm_delete'))) {
      try {
        await api.delete(`/translations/${id}/`);
        await fetchTranslations();
        refreshTranslations();
      } catch (err) {
        setError(t('error_deleting_translation'));
      }
    }
  };

  if (loading) return <div>{t('loading_data') || 'Loading...'}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t('translations')}</h2>
        <button
          onClick={() => { setEditingId(-1); setEditForm({ key: '', en: '', de: '' }); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          {t('add_translation')}
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('key')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('english_en') || 'English (en)'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('deutsch_de') || 'Deutsch (de)'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {editingId === -1 && (
              <tr>
                <td className="px-6 py-4"><input className="border p-1 w-full" value={editForm.key} onChange={e => setEditForm({...editForm, key: e.target.value})} placeholder="Key" /></td>
                <td className="px-6 py-4"><input className="border p-1 w-full" value={editForm.en} onChange={e => setEditForm({...editForm, en: e.target.value})} placeholder="English" /></td>
                <td className="px-6 py-4"><input className="border p-1 w-full" value={editForm.de} onChange={e => setEditForm({...editForm, de: e.target.value})} placeholder="Deutsch" /></td>
                <td className="px-6 py-4">
                  <button onClick={() => handleSave()} className="text-green-600 mr-2">{t('save')}</button>
                  <button onClick={() => setEditingId(null)} className="text-gray-600">{t('cancel')}</button>
                </td>
              </tr>
            )}
            {translations.map((item) => (
              <tr key={item.id}>
                {editingId === item.id ? (
                  <>
                    <td className="px-6 py-4"><input className="border p-1 w-full" value={editForm.key} onChange={e => setEditForm({...editForm, key: e.target.value})} /></td>
                    <td className="px-6 py-4"><input className="border p-1 w-full" value={editForm.en} onChange={e => setEditForm({...editForm, en: e.target.value})} /></td>
                    <td className="px-6 py-4"><input className="border p-1 w-full" value={editForm.de} onChange={e => setEditForm({...editForm, de: e.target.value})} /></td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleSave(item.id)} className="text-green-600 mr-2">{t('save')}</button>
                      <button onClick={() => setEditingId(null)} className="text-gray-600">{t('cancel')}</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">{item.key}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.en}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.de}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => { setEditingId(item.id); setEditForm(item); }} className="text-indigo-600 hover:text-indigo-900 mr-4">{t('edit')}</button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">{t('delete')}</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
