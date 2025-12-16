import PageBreadcrumb from "../../../Ccomponents/common/PageBreadCrumb";
import ComponentCard from "../../../Ccomponents/common/ComponentCard";
import BasicTableOne from "../../../Ccomponents/tables/BasicTables/BasicTableOne";

export default function UsersList() {
  return (
    <>
      
      <PageBreadcrumb pageTitle="List of users" />
      <div className="space-y-6">
        <ComponentCard title="List of users">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </>
  );
}
