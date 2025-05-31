import { useState } from 'react';

function UploadForm({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setStatus('Please select a file first.');
      return;
    }

    setLoading(true);
    setStatus('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setStatus('Upload successful!');
        if (onUploadSuccess) onUploadSuccess();
      } else {
        const err = await response.json();
        setStatus(`Upload failed: ${err.message || 'Server error'}`);
      }
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Upload Shipment Data</h2>
      <p className="font-bold mb-6 text-gray-800 text-center">Import your freight shipment records in CSV format to get started.</p>
      <form onSubmit={handleUpload} className="space-y-4">
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
            className="flex-1 text-sm text-gray-700
                       file:mr-4 file:py-2 file:px-4
                       file:rounded file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
          />
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-500 font-medium py-2 px-5 rounded shadow 
                        hover:bg-blue-600 transition
                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        {status && (
          <p className="text-sm text-gray-700">{status}</p>
        )}

        {loading && (
          <p className="text-sm text-gray-500 italic">Please wait, uploading file...</p>
        )}
      </form>
    </div>
  </div>
);

}

export default UploadForm;
