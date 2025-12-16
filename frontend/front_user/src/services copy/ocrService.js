import axios from "axios";

export const sendPDFtoOCR = async (pdfBase64) => {
  try {
    const response = await axios.post("http://localhost:3000/api/ocr", {
      file: pdfBase64
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
