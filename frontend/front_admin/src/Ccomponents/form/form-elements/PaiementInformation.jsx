import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Select from "../Select";
import Radio from "../input/Radio";
export default function PaiementInformation() {
  const options = [
    { value: "annuel", label: "annuel" },
    { value: "semesteriel", label: "annuel" },
  ];
  const handleSelectChange = (value) => {
    console.log("Selected value:", value);
  };
  const [selectedValue, setSelectedValue] = useState("option2");

  const handleRadioChange = (value) => {
    setSelectedValue(value);
  };
  return (
    <ComponentCard title="subscription information">
      <div className="space-y-6">
        <div>
          <Label>Select Input</Label>
          <Select
            options={options}
            placeholder="Select Option"
            onChange={handleSelectChange}
            className="dark:bg-dark-900"
          />
        </div>
        <div className="flex flex-wrap items-center gap-8">
        <Radio
          id="radio1"
          name="group1"
          value="option1"
          checked={selectedValue === "option1"}
          onChange={handleRadioChange}
          label="déja payé"
        />
        <Radio
          id="radio2"
          name="group1"
          value="option2"
          checked={selectedValue === "option2"}
          onChange={handleRadioChange}
          label="non payé"
        />
        </div>
      </div>
    </ComponentCard>
  );
}
