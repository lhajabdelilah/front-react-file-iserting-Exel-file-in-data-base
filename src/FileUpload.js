import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';


const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [errorFilePath, setErrorFilePath] = useState('');
  const [insertedRows, setInsertedRows] = useState([]);
  const [errorRows, setErrorRows] = useState([]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadStatus('');
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert('Please select a file!');
      return;
    }

    setUploading(true);
    setUploadStatus('Uploading...');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:9090/api/import-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('File uploaded:', response.data);
      setInsertedRows(response.data.insertedSoins);
      setErrorRows(response.data.errorDetails);
      setUploadStatus('File uploaded successfully!');
      setErrorFilePath(response.data.errorFilePath);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('Error uploading file!');
    } finally {
      setUploading(false);
    }
  };

  const downloadErrorFile = async () => {
    try {
      if (errorFilePath) {
        const response = await axios.get(
          `http://localhost:9090/api/download-error-file?file=${encodeURIComponent(errorFilePath)}`,
          {
            responseType: 'blob',
          }
        );
  
        const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', 'error_details.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        alert('No error file available.');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file!');
    }
  };
  
  return (
    <div>
    <nav className="navbar navbar-expand-lg navbar-light bg-primary">
      <div className="container">
        <a className="navbar-brand" href="#">File Upload</a>
      </div>
    </nav>
  
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8"> {/* Utiliser col-md-8 pour 80% */}
          <input type="file" onChange={handleFileChange} className='bg-success' />
  
          <button onClick={handleSubmit} disabled={uploading} className="btn btn-primary mt-4 co">
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          {selectedFile && <p>Selected file: {selectedFile.name}</p>}
          {uploadStatus && <p>{uploadStatus}</p>}
  
          {insertedRows.length > 0 && (
            <div className="mt-2">
              <h3 className='bg-success'>Inserted Rows</h3>
              <table className="table">
                {/* Table headers */}
                <thead>
                  <tr>
                    <th>Region</th>
                    <th>Delegation</th>
                    <th>Commune</th>
                    <th>Establishment Name</th>
                    <th>Category</th>
                  </tr>
                </thead>
                {/* Table body */}
                <tbody>
                  {insertedRows.map((row, index) => (
                    <tr key={index}>
                      <td className="table-success">{row.region}</td>
                      <td className="table-warning">{row.delegation}</td>
                      <td className="table-danger">{row.commune}</td>
                      <td className="table-info">{row['nom_établissement']}</td>
                      <td className="table-primary">{row.categorie}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
  
        <div className="col-md-4"> {/* Utiliser col-md-4 pour 20% */}
          {errorRows.length > 0 && (
            <div className="mt-6">
              <h3 className='bg-danger'>Error Rows</h3>
              <table className="table table-danger">
                {/* Table headers */}
                <thead>
                  <tr>
                    <th>Row Number</th>
                    <th>Error Type</th>
                  </tr>
                </thead>
                {/* Table body */}
                <tbody>
                  {errorRows.map((error, index) => (
                    <tr key={index}>
                      <td>{error.rowNumber}</td>
                      <td>{error.errorType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  

  );
};

export default FileUpload;
