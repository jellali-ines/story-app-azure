import PageBreadcrumb from "../../Ccomponents/common/PageBreadCrumb";
import ComponentCard from "../../Ccomponents/common/ComponentCard";
import BasicTableOne from "../../Ccomponents/tables/BasicTables/BasicTableOne";

export default function BasicTables() {
  return (
    <>
      <PageBreadcrumb pageTitle="Basic Tables" />
      <div className="space-y-6">
        <ComponentCard title="Basic Table 1">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </>
  );
}
