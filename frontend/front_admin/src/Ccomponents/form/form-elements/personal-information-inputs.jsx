import { useState } from "react";
import ComponentCard from "../../common/ComponentCard.jsx";
import Label from "../Label.jsx";
import Input from "../input/InputField.jsx";
import Select from "../Select.jsx";
import { EnvelopeIcon } from "../../../icons";
import PhoneInput from "../group-input/PhoneInput";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../../icons";

export default function PersonalInformationInputs({ value, onChange }) {
  const options = [
    { value: "Sfax", label: "Sfax" },
    { value: "Gabes", label: "Gabes" },
     { value: "Tunis", label: "Tunis" },
    { value: "Benzart", label: "Benzart" },
     { value: "Souuse", label: "Sousse" },
    { value: "Monastir", label: "Monastir" },
     { value: "Matmata", label: "Matmata" },
    { value: "Tabarka", label: "Tabarka" },
  ];
   const Roles = [
    { value: "admin", label: "Admin" },
    { value: "parent", label: "Parent" },
    
  ];

   const countries = [
    { code: "US", label: "+1" },
    { code: "GB", label: "+44" },
    { code: "CA", label: "+1" },
    { code: "AU", label: "+61" },
  ];
  
  const [showPassword, setShowPassword] = useState(false);

  return (
    <ComponentCard title="Personal information">
      <div className="space-y-6">
        <div>
          <Label htmlFor="input">username</Label>
          <Input 
          type="text" id="input" 
           value={value.username || ""}
           onChange={(e) => 
          onChange({ ...value, username: e.target.value })
        }/>
        </div>
        <div>
          <Label>Email</Label>
          <div className="relative">
            <Input
              placeholder="info@gmail.com"
              type="text"
              className="pl-[62px]"
               value={value.email || ""}
              onChange={(e) => 
                onChange({ ...value, email: e.target.value })
              }
            />
            <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <EnvelopeIcon className="size-6" />
            </span>
          </div>
        </div>
         <div>
          <Label>Phone</Label>
          <PhoneInput
            selectPosition="start"
            countries={countries}
            placeholder="+1 (555) 000-0000"
             value={value.phone || ""}
              onChange={(phoneValue) => {
      onChange({ ...value, phone: parseInt(phoneValue) });
    }}
          />
        </div>{" "}
         <div>
          <Label>Region</Label>
          <Select
            options={options}
            placeholder="Select Option"
            onChange={(selectedValue) => 
                onChange({ ...value, region: selectedValue })
              }
            className="dark:bg-dark-900"
          />
        </div>
        <div>
          <Label>Role</Label>
          <Select
            options={Roles}
            placeholder="Select Option"
            onChange={(selectedValue) => 
    onChange({ ...value, role: selectedValue })
  }
            className="dark:bg-dark-900"
          />
        </div>
        <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={value.password || ""}
                        onChange={(e) => onChange({ ...value, password: e.target.value })}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
        
      </div>
    </ComponentCard>
  );
}
