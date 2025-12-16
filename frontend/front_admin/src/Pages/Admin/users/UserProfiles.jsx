import PageBreadcrumb from "../../../Ccomponents/common/PageBreadCrumb";
import UserMetaCard from "../../../Ccomponents/UserProfile/UserMetaCard";
import UserInfoCard from "../../../Ccomponents/UserProfile/UserInfoCard";
import UserPaymentCard from "../../../Ccomponents/UserProfile/UserPaymentCard";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function UserProfiles() {
  const {id}=useParams()
  const [user,setUser]=useState({
    _id:id,
    username:"",
    email:"",
    phone:"",
    kidsnumber:0,
    region:"",
    role:"",
    dateInscri:"",
    payment_history:[],
    kids:[],
    password:""

  })
  const [loading,setLoading]=useState(false)
  const fetchUser = async () => {
     const token=localStorage.getItem('token');
      
      setLoading(true);      
      try {
        const response = await fetch(
          `${import.meta.env.VITE_GATEWAY_URL}/user/${id}`,
          { 
            method: "GET",
            headers: { 
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json" 
            }
          }
        );
        const data = await response.json();
        console.log(data);
        if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
        setUser({
          _id: data.user._id,
          username: data.user.user_name,
          phone: data.user.phone,
          region: data.user.region,
          role: data.user.role,
          email:data.user.email,
          dateInscri:data.user.createdAt,
          payment_history:data.user.payment_history,
          kids:data.user.kids,
          password:""
        });
        
      } catch (error) {
        console.error("Error fetching user :", error);
      } finally {
        setLoading(false);
      }
    };
  
    // Load users on component mount and when dependencies change
   useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);
   const updateUser=async (newuser)=>{
         try {
        const payload={
          _id: newuser._id,
          username:newuser.username,
          phone:newuser.phone,
          region: newuser.region,
          role: newuser.role,
          email:newuser.email,
          password:newuser.password
        } 
      console.log(JSON.stringify(payload));
      
      const response = await fetch(
        `${import.meta.env.VITE_GATEWAY_URL}/user/${id}/update`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log("Login response:", data);
      
      if (response.ok) {
        setUser({_id: data.user._id,
          username: data.user.user_name,
          phone: data.user.phone,
          region: data.user.region,
          role: data.user.role,
          email:data.user.email,
          dateInscri:data.user.createdAt,
          payment_history:data.user.payment_history,
          kids:data.user.kids})
      } else {
        //setTextError(res.message || "Login failed");
      }
    } catch (err) {
      console.error("Login failed:", err);
      //setTextError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };
   
  return (
    <>
      
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserInfoCard 
          user={user}
          onUpdateUserInfo={updateUser}/>
          <UserPaymentCard user={user}
          //onUpdatePaymentInfo={updatePaymentInfo} 
          />
        </div>
      </div>
    </>
  );
}
