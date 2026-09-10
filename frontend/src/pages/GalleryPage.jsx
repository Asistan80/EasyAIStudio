import { useEffect, useState } from "react";

export default function GalleryPage() {

    const [images, setImages] = useState([]);

    const [loading, setLoading] = useState(true);

    async function loadGallery() {

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/api/gallery"
            );

            const data = await response.json();

            setImages(
                data.images || []
            );

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    }

    useEffect(() => {

        loadGallery();

    }, []);

    if (loading) {

        return <h2>Loading Gallery...</h2>;

    }

    return (

        <div className="gallery-page">

            <h1>Gallery</h1>

            <p>

                Total Images : {images.length}

            </p>

            <pre>

                {JSON.stringify(
                    images,
                    null,
                    4
                )}

            </pre>

        </div>

    );

}