"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Gallery() {
    const [images, setImages] = useState<{ id: string; variants: string[] }[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await axios.get("https://3523110052-javierapi-backend.rvdental.fun/imagenes/all");
                console.log("Respuesta completa de la API:", response.data);

                // Verifica la estructura correcta de la respuesta
                const imagenes = response.data?.result?.images || response.data?.images || [];
                
                if (Array.isArray(imagenes)) {
                    setImages(imagenes);
                } else {
                    console.error("Estructura inesperada en la respuesta:", response.data);
                    setImages([]);
                }
            } catch (error) {
                console.error("Error al obtener las imágenes:", error);
                setError("Error al obtener las imágenes.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchImages();
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        
        if (!selectedFile) return;

        if (!selectedFile.type.startsWith("image/") || selectedFile.size > 5 * 1024 * 1024) {
            setError("El archivo debe ser una imagen y no debe superar los 5 MB.");
            return;
        }
        setError("");
        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return setError("Selecciona un archivo para subir.");

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post(
                "https://3523110052-javierapi-backend.rvdental.fun/imagenes/upload",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            console.log("Imagen subida con éxito:", response.data);
            
            const newImage = response.data?.result;
            if (newImage) {
                setImages((prevImages) => [...prevImages, newImage]);
            } else {
                console.error("Error: la imagen subida no tiene la estructura esperada.", response.data);
            }
            
            setError("");
        } catch (error) {
            console.error("Error al subir la imagen:", error);
            setError("Error al subir la imagen.");
        } finally {
            setLoading(false);
        }
    };

    if (!isMounted) return null;
    if (isLoading) return <p>Cargando...</p>;

    return (
        <div className="container mt-4">
            <h1 className="mb-4 text-center">Galería de Imágenes</h1>
            <div className="mb-3">
                <input type="file" onChange={handleFileChange} className="form-control" />
                <button
                    className="btn btn-primary btn-lg mt-2"
                    onClick={handleUpload}
                    disabled={loading}
                >
                    {loading ? <div className="spinner-border text-light" role="status"></div> : "Subir Imagen"}
                </button>
            </div>
            {error && <p className="text-danger">{error}</p>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "10px" }}>
                {images.map((img) => (
                    <img
                        key={img.id}
                        srcSet={`${img.variants[0]} 1x, ${img.variants[1]} 2x`}
                        src={img.variants[0]}
                        alt="Imagen subida"
                        style={{
                            width: "250px",
                            height: "250px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            cursor: "pointer"
                        }}
                        loading="lazy"
                        onClick={() => setSelectedImage(img.variants[1])}
                    />
                ))}
            </div>
            {selectedImage && (
                <div
                    className="modal"
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.7)"
                    }}
                    onClick={() => setSelectedImage(null)}
                >
                    <img
                        src={selectedImage}
                        alt="Imagen ampliada"
                        style={{
                            width: "750px",
                            height: "750px",
                            objectFit: "contain",
                            borderRadius: "8px"
                        }}
                    />
                </div>
            )}
        </div>
    );
}
