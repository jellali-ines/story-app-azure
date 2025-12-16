import { useState } from "react";
import ComponentCard from "../../common/ComponentCard.jsx";
import Label from "../Label.jsx";
import Input from "../input/InputField.jsx";
import Select from "../Select.jsx";

export default function StoryInformation() {

  const options = [
    { value: "[1-3]", label: "[1ans -3ans]" },
    { value: "[4-7]", label: "[4ans-7ans]" },
    { value: "[8-11]", label: "[8ans-11ans]" },
  ];
  const languagesOptions=[
     { value: "en", label: "Anglais" },
    { value: "fr", label: "francais" },
    { value: "Ar", label: "Arabe" },
  ]
  const handleSelectChange = (value) => {
    console.log("Selected value:", value);
  };
  const handleSelectChangeLanguage = (value) => {
    console.log("Selected value:", value);
  };

  return (
    <ComponentCard title="Global Information">
      <div className="space-y-6">
        <div>
          <Label htmlFor="input">Title</Label>
          <Input type="text" id="input" />
        </div>
        <div>
          <Label htmlFor="input">Author</Label>
          <Input type="text" id="input" />
        </div>
        <div>
          <Label>Language</Label>
          <Select
            options={languagesOptions}
            placeholder="Select an option"
            onChange={handleSelectChange}
            className="dark:bg-dark-900"
          />
        </div>
        <div>
          <Label>Recommended age</Label>
          <Select
            options={options}
            placeholder="Select an option"
            onChange={handleSelectChangeLanguage}
            className="dark:bg-dark-900"
          />
        </div>
        
      </div>
    </ComponentCard>
  );
}
