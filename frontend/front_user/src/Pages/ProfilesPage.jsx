import React, { useState, useEffect } from "react";
import ChildCard from "../Components/child/ChildCard";
import AddChildCard from "../Components/child/AddChildCard";
import KidProfileSetup from "../Components/child/KidProfileSetup";
import Layout from "../layout/layout";

const ChildProfilesPage = () => {
  const [children, setChildren] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchKids = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}/kids`, {
          method: "GET",
          credentials: "include"
        });

        const data = await response.json();

        if (response.ok) {
          setChildren(data.kids || []);
        } else {
          console.error("Error loading kids:", data.message);
        }
      } catch (error) {
        console.error("Failed fetching kids:", error);
      }
    };

    fetchKids();
  }, []);

  const handleAddChild = (newChild) => {
    setChildren((prev) => [...prev, newChild]);
    setShowForm(false);
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center p-8">
        
        <h1 className="text-4xl font-bold text-[#26024D] mb-2">
          Who is reading today?
        </h1>
        <p className="text-gray-600 mb-10">
          Choose a child or create a new profile.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {children.map((kid) => (
            <ChildCard key={kid._id} kid={kid} />
          ))}

          <AddChildCard onClick={() => setShowForm(true)} />
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
            <KidProfileSetup
              onCancel={() => setShowForm(false)}
              onSubmit={handleAddChild}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ChildProfilesPage;
