import { SyntheticEvent, useEffect, useRef, useState } from "react";
import ExifReader from 'exifreader';
import Button from '../components/Button';
import Divider from '../components/Divider';
import Image from '../components/Image';
import { file_to_base64 } from '../utils/base64';

export default function ImageInfo() {

  const [file, setFile] = useState<File>();

  return (
    <>
      <div className="py-3 bg-white/90">
        <h1>Image Information</h1>
        <input
          className="bg-gray-100 p-3"
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
  const foldTable = useRef<boolean[]>([]);
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
      foldTable.current = [...new Array(Object.keys(tags).length)].map(() => true);
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
      <Divider />
      <h2>Preview</h2>
      <Image
        ref={onImgRef}
        className="border"
        src={URL.createObjectURL(file)}
        alt="preview"
        onLoad={onLoad}
        enableFullscreen
      />
      <Divider />
      <Button
        processing={processingBase64Image}
        disabled={processingBase64Image}
        onClick={toBase64Image}>To Base64 Image</Button>
      {
        base64Image && (
          <div className="">
            <pre className="overflow-auto border border-gray-500 text-sm">
              {base64Image}
            </pre>
            <div className="text-sm"><strong>Size:</strong> {base64Image.length.toLocaleString()} bytes</div>
          </div>
        )
      }
      <Divider />
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
      <Divider />
      {
        tags && (<>
          <h2>Exif <span className="text-base font-light">by <a href="https://github.com/mattiasw/ExifReader" target="_blank" rel="noreferrer">exifreader</a></span></h2>
          <div className="flex gap-1">
            <Button onClick={() => {
              foldTable.current = foldTable.current.map(() => true);
            }}>Fold all</Button>
            <Button onClick={() => {
              foldTable.current = foldTable.current.map(() => false);
            }}>Unfold all</Button>
          </div>
          <ul className="space-y-1">{Object.keys(tags).map((k, i) => (
            <li key={`tag-${i}`}>
              <div className="flex gap-1 items-center">
                <Button
                  variant="sm" icon={foldTable.current[i] ? 'arrow_right' : 'arrow_drop_down'}
                  onClick={e => {
                    foldTable.current[i] = !foldTable.current[i];
                  }}
                />
                <strong>{k}:</strong> <code>{JSON.stringify(tags[k].value) ?? ''}</code>
              </div>
              {
                (!foldTable.current[i]) && (<ExifTag tag={tags[k]} />)
              }
            </li>
            ))}</ul>
          
        </>)
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
