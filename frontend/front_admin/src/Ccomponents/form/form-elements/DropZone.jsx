import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import { useDropzone } from "react-dropzone";
import Label from "../Label";
import Select from "../Select";
import Input from "../input/InputField.jsx";
import { EnvelopeIcon } from "../../../icons";
import DatePicker from "../date-picker.jsx";

const DropzoneComponent = ({ onChange }) => {
  // Transforme un objet Date en string "YYYY-MM-DD"
  const toDatePickerFormat = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    image: null,
    amount: "",
    dateOfPayment: "",
    payment_type: null,
  });

  const options = [
    { value: "annual", label: "annual" },
    { value: "quarterly", label: "quarterly" },
  ];

  const updateFormData = (newData) => {
    setFormData((prev) => {
      const updated = { ...prev, ...newData };
      if (onChange) onChange(updated); // Remonter au parent
      return updated;
    });
  };

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setLoading(true);

    const data = new FormData();
    data.append("image", file);

    try {
      const response = await fetch(`${import.meta.env.VITE_GATEWAY_URL}/payment/info`, {
        method: "POST",
        body: data,
      });

      const res = await response.json();
      setLoading(false);

      // Extraire infos backend
      const newFormData = {
        image:file,
        amount: parseFloat(res.data.payment_info.amount[0]) || "",
        dateOfPayment: toDatePickerFormat(new Date(res.data.payment_info.date[0])),
      };

      updateFormData(newFormData);
    } catch (err) {
      console.error("Upload failed:", err);
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/png": [], "image/jpeg": [], "image/webp": [], "image/svg+xml": [] },
  });

  return (
    <ComponentCard title="Payment Receipt">
      <div className="space-y-6">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`relative transition border border-dashed cursor-pointer rounded-xl p-7 lg:p-10 flex items-center justify-center
            ${isDragActive ? "border-brand-500 bg-gray-100 dark:bg-gray-800" :
            "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"}`}
          style={{ minHeight: "200px" }}
        >
          <input {...getInputProps()} />

          {/* Preview Image */}
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover rounded-xl"
            />
          )}

          {/* Icon + Text */}
          {!preview && (
            <div className="flex flex-col items-center z-10">
              <div className="mb-5 flex justify-center">
                <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  <svg className="fill-current" width="29" height="28" viewBox="0 0 29 28" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.5 3.916L8.573 9.532 9.634 10.593 13.752 6.478V18.667C13.752 19.081 14.088 19.417 14.502 19.417C14.916 19.417 15.252 19.081 15.252 18.667V6.482L19.365 10.593C19.658 10.886 20.133 10.886 20.426 10.593C20.719 10.3 20.719 9.825 20.426 9.532L15.084 4.194C14.946 4.025 14.737 3.917 14.502 3.917ZM5.916 18.667C5.916 18.253 5.58 17.917 5.166 17.917C4.752 17.917 4.416 18.253 4.416 18.667V21.834C4.416 23.076 5.424 24.084 6.666 24.084H22.334C23.577 24.084 24.584 23.076 24.584 21.834V18.667C24.584 18.253 24.248 17.917 23.834 17.917C23.42 17.917 23.084 18.253 23.084 18.667V21.834C23.084 22.248 22.748 22.584 22.334 22.584H6.666C6.252 22.584 5.916 22.248 5.916 21.834V18.667Z" />
                  </svg>
                </div>
              </div>
              <h4 className="mb-3 font-semibold text-gray-800 text-xl dark:text-white/90">
                {isDragActive ? "Drop Files Here" : "Drag & Drop Files Here"}
              </h4>
              <span className="text-center text-sm text-gray-700 dark:text-gray-400">
                Drag and drop your PNG, JPG, WebP, SVG images here or browse
              </span>
              <span className="font-medium underline text-sm text-brand-500">
                Browse File
              </span>
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-20">
              <div className="loader border-4 border-t-4 border-white rounded-full w-12 h-12 animate-spin"></div>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div>
            <Label>Type of Subscribe</Label>
            <Select
              options={options}
              placeholder="Select Option"
              value={formData.type ? { value: formData.payment_type, label: formData.payment_type } : null}
              onChange={(selectedvalue)=>updateFormData({payment_type:selectedvalue})}
              className="dark:bg-dark-900"
            />
          </div>

          <div>
            <Label>Amount</Label>
            <div className="relative">
              <Input
                value={formData.amount}
                onChange={(e) => updateFormData({ amount: e.target.value })}
                placeholder="Enter amount"
                type="text"
                className="pl-[62px]"
              />
              <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <EnvelopeIcon className="size-6" />
              </span>
            </div>
          </div>

          <div>
            <DatePicker
              id="date-picker"
              label="Date Picker Input"
              placeholder="Select a date"
              defaultDate={formData.dateOfPayment} // utilise defaultDate pour Flatpickr
              onChange={(dates, currentDateString) => updateFormData({ date: currentDateString })}
            />
          </div>
        </div>
      </div>
    </ComponentCard>
  );
};

export default DropzoneComponent;
