import PageBreadcrumb from "../../../Ccomponents/common/PageBreadCrumb";
import DefaultInputs from "../../../Ccomponents/form/form-elements/DefaultInputs";
import InputGroup from "../../../Ccomponents/form/form-elements/InputGroup";
import DropzoneComponent from "../../../Ccomponents/form/form-elements/DropZone";
import CheckboxComponents from "../../../Ccomponents/form/form-elements/CheckboxComponents";
import RadioButtons from "../../../Ccomponents/form/form-elements/RadioButtons";
import ToggleSwitch from "../../../Ccomponents/form/form-elements/ToggleSwitch";
import FileInputExample from "../../../Ccomponents/form/form-elements/FileInputExample";
import SelectInputs from "../../../Ccomponents/form/form-elements/SelectInputs";
import TextAreaInput from "../../../Ccomponents/form/form-elements/TextAreaInput";
import InputStates from "../../../Ccomponents/form/form-elements/InputStates";
import StoryInformation from "../../../Ccomponents/form/form-elements/StoryInformation";
import TextInformation from "../../../Ccomponents/form/form-elements/TextInformation";

export default function AddStoryForm() {
  return (
    <div>
      
      <PageBreadcrumb pageTitle="Form Elements" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <StoryInformation />
          <DropzoneComponent />

        </div>
        <div className="space-y-6">
          <TextInformation />
          <FileInputExample />
        </div>
      </div>
    </div>
  );
}
