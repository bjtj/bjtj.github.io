import { useState, type ChangeEvent } from 'react';
import Button from '../components/Button';
import ErrorPanel from '../components/ErrorPanel';


export default function FileBase64() {
  const [file, setFile] = useState<File>();
  const [base64, setBase64] = useState<string>();
  const [error, setError] = useState<string>();

  async function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  }

  async function convertFile2base64() {
    if (file) {
      try {
        let base64 = await file_to_base64(file);
        setBase64(base64);
      } catch (err) {
        setError(`${err}`)
      }
    }
  }
  
  return (
    <div className="">
      <h1>File -&gt; Base64</h1>
      <div className="my-3">
        <input type="file" onChange={onFileChange} />
      </div>
      {
        file && (
          <div className="px-3 py-1 border rounded">
            <h2>File Information</h2>
            <ul className="">
              <li><strong>Name:</strong> {file.name}</li>
              <li><strong>Size:</strong> {file.size.toLocaleString()} bytes</li>
              <li><strong>Type:</strong> {file.type}</li>
              <li><strong>Last Modified:</strong> {new Date(file.lastModified).toLocaleString()}</li>
            </ul>
          </div>
        )
      }
      <Button onClick={convertFile2base64} disabled={file ? false : true}>Conver to Base64</Button>
      { base64 && (<>
        <h2>Base64:</h2>
        <pre className="overflow-auto whitespace-pre text-sm border border-gray-400 p-1 rounded">{base64}</pre>
        <p>{base64.length.toLocaleString()} bytes</p>
      </>)}
      <ErrorPanel error={error} label={'Error:'} />
    </div>
  )
}

export const file_to_base64 = async (a_file: File) => {
  let a_function = 
    (file: File) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let base64_string = String(reader.result).split(",")[1]
        resolve(base64_string)
      };
      reader.onerror = error => reject(error);
    })
  return (await a_function(a_file) as string)
}
