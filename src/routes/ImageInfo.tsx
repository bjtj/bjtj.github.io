import React, { SyntheticEvent, useEffect, useRef, useState } from "react";
import ExifReader from 'exifreader';
import Button from '../components/Button';
import { file_to_base64 } from './FileBase64';

export default function ImageInfo() {

  const [file, setFile] = useState<File>();

  return (
    <>
      <div className="py-3 sticky top-0 bg-white/90">
        <h1>Image Information</h1>
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
  const [base64Image, setBase64Image] = useState<string>();
  const [processingBase64Image, setProcessingBase64Image] = useState<boolean>(false);

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

  async function toBase64Image() {
    try {
      setProcessingBase64Image(true);
      let base64 = await file_to_base64(file);
      setBase64Image(`data:${file.type};base64,${base64}`);
    } finally {
      setProcessingBase64Image(false);
    }
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
      <Button
        processing={processingBase64Image}
        disabled={processingBase64Image}
        onClick={toBase64Image}>To Base64 Image</Button>
      {
        base64Image && (
          <div className="border p-3 rounded">
          <pre className="overflow-auto border border-gray-500 text-sm">
            {base64Image}
          </pre>
          <div className="text-sm"><strong>Size:</strong> {base64Image.length.toLocaleString()} bytes</div>
          </div>
        )
      }
      
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
        tags && (<>
          <h2>Exif <span className="text-base font-light">by <a href="https://github.com/mattiasw/ExifReader" target="_blank">exifreader</a></span></h2>
          <ul className="space-y-1">{Object.keys(tags).map((k, i) => (
            <li key={`tag-${i}`}><strong>{k}:</strong> <code>{JSON.stringify(tags[k].value) ?? ''}</code> {
              true ? (<ExifTag tag={tags[k]} />) : (<span>{JSON.stringify(tags?.[k])}</span>)}</li>
            ))}</ul></>)
      }

    </div>
  )
}

type ExifTagProps = {
  tag: any;
};

function ExifTag({tag}: ExifTagProps) {
  return (
    <div>
      <pre className="border text-sm p-1 my-1 roudned bg-gray-100/20 overflow-auto">
        { JSON.stringify(tag, null, 2) }
      </pre>
    </div>
  );
}
