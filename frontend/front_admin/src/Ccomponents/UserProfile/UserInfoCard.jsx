import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select.jsx";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function UserInfoCard({user,onUpdateUserInfo}) {
  const [newuser,setNewUser]=useState(user)
   const [saving, setSaving] = useState(false);
  console.log("useeeeeeeeeeeeeeeeeeeeeer",newuser);
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
  const { isOpen, openModal, closeModal } = useModal();
  const handleSave = async () => {
    try {
      setSaving(true);
      
      console.log("Saving changes...", newuser);
      
      // Appeler la fonction de mise à jour du parent
      if (onUpdateUserInfo) {
        await onUpdateUserInfo(newuser);
        
        // Toast de succès
        toast.success('User updated successfully!', {
          duration: 4000,
          position: 'top-right',
          icon: '✅',
          style: {
            background: '#10B981',
            color: '#fff',
          },
        });
        
        // Fermer le modal après un court délai
        setTimeout(() => {
          closeModal();
        }, 1000);
      }
      
    } catch (error) {
      console.error("Error saving user:", error);
      
      // Toast d'erreur
      toast.error(error.response?.data?.message || 'Failed to update user', {
        duration: 5000,
        position: 'top-right',
        icon: '❌',
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
      
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSave();
  };
   useEffect(() => {
    if (user) {
      setNewUser(user);
    }
  }, [user]);
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                username
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.username}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                phone number 
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                +216 {user.phone}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                number of kids 
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
               {user?.kids?.length || 0} kids
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Date of subscribtion
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.dateInscri}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.email}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                region
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.region}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                role
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.role}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Edit
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>username</Label>
                    <Input type="text" value={newuser.username}
                    onChange={(e)=>setNewUser({...newuser,username:e.target.value})} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>phone number</Label>
                    <Input type="text" value={newuser.phone}
                    onChange={(e)=>setNewUser({...newuser,phone:e.target.value})} 
                     />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email Address</Label>
                    <Input type="text" value={newuser.email} 
                    onChange={(e)=>setNewUser({...newuser,email:e.target.value})} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                   <Label>Région</Label>
                  <Select
                    options={options}
                    defaultValue={newuser.region}
                    placeholder="Select Option"

                    onChange={(selectedValue) => 
                      setNewUser({ ...newuser, region: selectedValue })
                      }
                    className="dark:bg-dark-900"
                  />
                  </div>

                  <div className="col-span-2">
                  <div>
                  <Label>Role</Label>
                  <Select
                    options={Roles}
                    defaultValue={newuser.role}
                    placeholder="Select Option"
                    onChange={(selectedValue) => 
                        setNewUser({ ...newuser, role: selectedValue })
                      }
                    className="dark:bg-dark-900"
                  />
                </div>
                <div className="col-span-2 lg:col-span-1">
                    <Label>password</Label>
                    <Input type="text" value={newuser.password}
                    onChange={(e)=>setNewUser({...newuser,password:e.target.value})} />
                  </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
