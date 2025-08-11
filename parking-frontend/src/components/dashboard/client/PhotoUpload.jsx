import { useState } from 'react';
import toast from 'react-hot-toast';

const PhotoUpload = () => {
  const [photos, setPhotos] = useState([
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400',
      title: 'Main Entrance',
      description: 'Well-lit main entrance with clear signage',
      category: 'entrance',
      isMain: true,
      uploadDate: '2024-01-15'
    },
    {
      id: '2', 
      url: 'https://images.unsplash.com/photo-1522444195799-478538b28823?w=400',
      title: 'Parking Area A',
      description: 'Covered parking spaces with numbered spots',
      category: 'parking_area',
      isMain: false,
      uploadDate: '2024-01-15'
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 
      title: 'Security Camera',
      description: '24/7 CCTV monitoring for vehicle safety',
      category: 'security',
      isMain: false,
      uploadDate: '2024-01-16'
    }
  ]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    file: null,
    title: '',
    description: '',
    category: 'parking_area',
    isMain: false
  });
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const categories = [
    { value: 'entrance', label: 'Entrance/Exit', icon: '' },
    { value: 'parking_area', label: 'Parking Area', icon: '' },
    { value: 'security', label: 'Security Features', icon: '' },
    { value: 'amenities', label: 'Amenities', icon: '' },
    { value: 'signage', label: 'Signage', icon: '' },
    { value: 'accessibility', label: 'Accessibility', icon: '' }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (file.type.startsWith('image/')) {
      setUploadForm({ ...uploadForm, file });
    } else {
      toast.error('Please select an image file');
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.file) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);

    try {
      // Simulate file upload process
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newPhoto = {
        id: Date.now().toString(),
        url: URL.createObjectURL(uploadForm.file),
        title: uploadForm.title,
        description: uploadForm.description,
        category: uploadForm.category,
        isMain: uploadForm.isMain && photos.filter(p => p.isMain).length === 0, // Only one main photo allowed
        uploadDate: new Date().toISOString().split('T')[0]
      };

      setPhotos([...photos, newPhoto]);
      setShowUploadModal(false);
      setUploadForm({
        file: null,
        title: '',
        description: '',
        category: 'parking_area',
        isMain: false
      });
      
      toast.success('Photo uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (photoId) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      setPhotos(photos.filter(p => p.id !== photoId));
      toast.success('Photo deleted successfully');
    }
  };

  const handleSetMain = (photoId) => {
    setPhotos(photos.map(photo => ({
      ...photo,
      isMain: photo.id === photoId
    })));
    toast.success('Main photo updated successfully');
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.icon : '📷';
  };

  const getCategoryLabel = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Photo Management</h2>
          <p className="text-gray-600">Upload and manage photos of your parking facility</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload Photo
        </button>
      </div>

      {/* Photo Gallery */}
      {photos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No photos uploaded yet</h3>
          <p className="text-gray-500">Upload photos to showcase your parking facility to potential customers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div key={photo.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative">
                <img 
                  src={photo.url} 
                  alt={photo.title}
                  className="w-full h-48 object-cover"
                />
                {photo.isMain && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Main Photo
                    </span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                    {getCategoryIcon(photo.category)}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{photo.title}</h3>
                  <div className="flex items-center space-x-2">
                    {!photo.isMain && (
                      <button
                        onClick={() => handleSetMain(photo.id)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        title="Set as main photo"
                      >
                        Set Main
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(photo.id)}
                      className="text-red-600 hover:text-red-800 text-xs font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{photo.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {getCategoryLabel(photo.category)}
                  </span>
                  <span>Uploaded {photo.uploadDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Upload New Photo</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                {/* File Upload Area */}
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center ${
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  {uploadForm.file ? (
                    <div className="space-y-2">
                      <svg className="w-12 h-12 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-medium text-green-600">{uploadForm.file.name}</p>
                      <p className="text-xs text-gray-500">File selected successfully</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photo Title *
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Main Entrance"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                    placeholder="Brief description of what this photo shows"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isMain"
                    checked={uploadForm.isMain}
                    onChange={(e) => setUploadForm({...uploadForm, isMain: e.target.checked})}
                    className="mr-2 rounded"
                    disabled={photos.some(p => p.isMain)}
                  />
                  <label htmlFor="isMain" className="text-sm text-gray-700">
                    Set as main photo
                    {photos.some(p => p.isMain) && (
                      <span className="text-gray-500 ml-1">(You already have a main photo)</span>
                    )}
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !uploadForm.file}
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </div>
                    ) : (
                      'Upload Photo'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;