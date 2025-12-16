import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import MultiSelect from "../MultiSelect";
import TextArea from "../input/TextArea";
import Input from "../input/InputField.jsx";

export default function TextInformation() {
    const [message, setMessage] = useState("");
  const handleSelectChange = (value) => {
    console.log("Selected value:", value);
  };
  const [selectedValues, setSelectedValues] = useState([]);

  const multiOptions = [
    { value: "1", text: "Option 1", selected: false },
    { value: "2", text: "Option 2", selected: false },
    { value: "3", text: "Option 3", selected: false },
    { value: "4", text: "Option 4", selected: false },
    { value: "5", text: "Option 5", selected: false },
  ];
  return (
    <ComponentCard title="Select Inputs">
      <div className="space-y-6">
        <Label>Story</Label>
          <TextArea
            value={message}
            onChange={(value) => setMessage(value)}
            rows={6}
          />
        </div>
         <div>
          <Label htmlFor="input">Tags</Label>
          <Input type="text" id="input" />
        </div>
        <div>
          <MultiSelect
            label="Select genre"
            options={multiOptions}
            defaultSelected={["1", "3"]}
            onChange={(values) => setSelectedValues(values)}
          />
          <p className="sr-only">
            Selected Values: {selectedValues.join(", ")}
          </p>
        </div>
    </ComponentCard>
  );
}
