import { useState } from 'react';
import UploadForm from './components/UploadForm';
import Dashboard from './pages/Dashboard';

function App() {
  const [uploaded, setUploaded] = useState(false);

  return (
    <div>
      {!uploaded ? (
        <UploadForm onUploadSuccess={() => setUploaded(true)} />
      ) : (
        <Dashboard />
      )}
    </div>
  );
}

export default App;
