"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";

export default function Gallery() {
    const [images, setImages] = useState<{ id: string; variants: string[] }[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const response = await axios.get('http://localhost:3001/images');
            setImages(response.data.result.images);
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Selecciona un archivo para subir.');
            return;
        }
        
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            await axios.post('http://localhost:3001/images/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setError('');
            fetchImages();
        } catch (error) {
            setError('Error al subir la imagen.');
            console.error('Upload error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Galería de Imágenes</h1>
            <input type="file" onChange={handleFileChange} className="form-control" />
            <button type="button" className="btn btn-primary btn-lg" onClick={handleUpload} disabled={loading}>
                {loading ? <div className="spinner-border text-light" role="status"></div> : "Subir Imagen"}
            </button>
            {error && <p className="text-danger">{error}</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
                {images.map((img) => (
                    <img 
                        key={img.id} 
                        src={img.variants[0]} 
                        alt="Imagen subida" 
                        style={{ width: '100%', borderRadius: '8px', cursor: 'pointer' }} 
                        onClick={() => setSelectedImage(img.variants[0])} 
                    />
                ))}
            </div>
            {selectedImage && (
                <div className="modal" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.7)' }} onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage} alt="Imagen ampliada" style={{ width: '750px', height: '750px', objectFit: 'contain', borderRadius: '8px' }} />
                </div>
            )}
        </div>
    );
}
