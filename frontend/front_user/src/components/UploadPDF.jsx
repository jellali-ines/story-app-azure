import { useState } from "react";
import axios from "axios";

export default function UploadPDF() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("اختر PDF أولاً");

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64File = reader.result; // base64

      try {
        const response = await axios.post(
          "http://localhost:3000/api/ocr", // API Gateway
          { file: base64File }
        );
        setText(response.data.text);
      } catch (err) {
        console.error(err);
        alert("حدث خطأ أثناء تحويل PDF إلى نص");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleUpload}>رفع وتحويل إلى نص</button>
      <pre>{text}</pre>
    </div>
  );
}






 APPS.JSX  import UploadPDF from "./components/UploadPDF";

function App() {
  return (
    <div>
      <h1 style={{ textAlign: "center", marginTop: "2rem" }}>📄 OCR React + Vite</h1>
      <UploadPDF />
    </div>
  );
}

export default App;
