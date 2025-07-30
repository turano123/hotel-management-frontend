// components/ImageUploadPreview.jsx
import React from 'react';

function ImageUploadPreview({ images, setImages }) {
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setImages(selectedFiles);
  };

  return (
    <div style={{ marginTop: '10px' }}>
      <label>Oda Görselleri (birden fazla seçebilirsiniz):</label>
      <input
        type="file"
        name="images"
        accept="image/*"
        multiple
        onChange={handleFileChange}
      />

      {images.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
          {images.map((img, idx) => (
            <img
              key={idx}
              src={URL.createObjectURL(img)}
              alt={`preview-${idx}`}
              style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '6px' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageUploadPreview;
