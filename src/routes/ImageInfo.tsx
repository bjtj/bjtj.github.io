import { SyntheticEvent, useEffect, useRef, useState } from "react";
import ExifReader from 'exifreader';

export default function ImageInfo() {

    const [file, setFile] = useState<File>();

    return (
        <>
            <h1>Image Information</h1>
            <div className="my-3">
                <input
                    type="file" onChange={e =>
                        e.target.files && e.target.files.length > 0 && setFile(e.target.files[0])
                    }
                    accept="image/png, image/gif, image/jpeg" />
            </div>
            {file && (
                <ImageView file={file} />
            )}
        </>
    )
}

type ImageViewProps = {
    file: File;
}

function ImageView({ file }: ImageViewProps) {
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [info, setInfo] = useState<{ [key: string]: string }>();
    const [tags, setTags] = useState<ExifReader.Tags>();

    function onImgRef(ref: HTMLImageElement | null) {
        if (imgRef) {
        }

        if (ref) {

        }

        imgRef.current = ref;

        return ref;
    }

    useEffect(() => {
        ExifReader.load(file).then(tags => {
            setTags(tags);
        });
    }, [file]);

    function onLoad(e: SyntheticEvent<HTMLImageElement, Event>) {
        setInfo({ size: `${e.currentTarget.width}px x ${e.currentTarget.height}px` });
    }

    return (
        <div>
            <h2>File Information</h2>
            <ul>
                <li><strong>Name:</strong> {file.name}</li>
                <li><strong>Size:</strong> {file.size.toLocaleString()} bytes</li>
                <li><strong>Type:</strong> {file.type}</li>
                <li><strong>Last Modified:</strong> {new Date(file.lastModified).toLocaleString()}</li>
            </ul>
            <h2>Preview</h2>
            <img ref={onImgRef} className="border" src={URL.createObjectURL(file)} alt="preview"
                onLoad={onLoad}
            />
            {info && (
                <>
                    <h2>Image Information</h2>
                    <ul>
                        {Object.keys(info).map((k, i) => (
                            <li key={`info-${i}`}><strong>{k}:</strong> {info[k]}</li>
                        ))}
                    </ul>
                </>
            )}
            {
                tags && (<><h2>Exif</h2><ul>{Object.keys(tags).map((k, i) => (
                    <li key={`tag-${i}`}><strong>{k}:</strong> {JSON.stringify(tags[k])}</li>
                ))}</ul></>)
            }

        </div>
    )
}