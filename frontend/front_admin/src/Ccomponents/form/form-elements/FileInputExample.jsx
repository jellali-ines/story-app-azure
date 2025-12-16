import ComponentCard from "../../common/ComponentCard";
import FileInput from "../input/FileInput";
import Label from "../Label";

export default function WavGeneration() {
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Selected file:", file.name);
    }
  };

  return (
    <ComponentCard title="Generate audio">
      <div>
        <Label>generate audio and subtitles</Label>
        <FileInput onChange={handleFileChange} className="custom-class" />
      </div>
    </ComponentCard>
  );
}
