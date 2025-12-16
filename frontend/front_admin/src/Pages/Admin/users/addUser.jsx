import PageBreadcrumb from "../../../Ccomponents/common/PageBreadCrumb";
import PersonalInformationInputs from "../../../Ccomponents/form/form-elements/personal-information-inputs";
import PaiementInformation from "../../../Ccomponents/form/form-elements/PaiementInformation";
import DropzoneComponent from "../../../Ccomponents/form/form-elements/DropZone";
import { useState } from "react";

export default function AddUserForm() {
  const [personalInfo, setPersonalInfo] = useState({});
  const [paymentInfo, setPaymentInfo] = useState({
    file: null,
    amount: "",
    dateOfPayment: "",
    payment_type: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Fonction pour récupérer les infos du DropzoneComponent
  const handlePaymentChange = (data) => {
    setPaymentInfo(data);
    console.log("Données Payment reçues :", data);
  };

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    const tok=localStorage.getItem('token')
    console.log(tok);
    console.log(personalInfo);
    console.log(paymentInfo);
     e.preventDefault();
    
    // Validation des données
    if (!personalInfo.username || !personalInfo.email || !personalInfo.password || !personalInfo.phone || !personalInfo.region || !personalInfo.role) {
      setMessage({ type: "error", text: "Veuillez remplir les informations personnelles" });
      return;
    }

    if (!paymentInfo.amount || !paymentInfo.dateOfPayment || !paymentInfo.image || !paymentInfo.payment_type) {
      setMessage({ type: "error", text: "Veuillez fournir les informations de paiement" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

  //   // Préparer les données à envoyer
    const formData = new FormData();
    
  //   // Ajouter les informations personnelles
    Object.keys(personalInfo).forEach(key => {
      formData.append(key, personalInfo[key]);
    });
    Object.keys(paymentInfo).forEach(key => {
      formData.append(key, paymentInfo[key]);
    });
    const token=localStorage.getItem('token')
    console.log(token);
    
    try {
      // Exemple d'envoi à une API
      const response = await fetch(`${import.meta.env.VITE_GATEWAY_URL}/user/add`, {
        method: "POST",
        body: formData,
        // Si vous utilisez des tokens d'authentification
        headers: {
          "Authorization":`Bearer ${tok} `
        }
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({ 
          type: "success", 
          text: "Utilisateur ajouté avec succès!" 
        });
        
  //       // Réinitialiser le formulaire
        setPersonalInfo({});
        setPaymentInfo({
          file: null,
          amount: "",
          dateOfPayment: "",
          payment_type: "",
        });
        
        console.log("Succès:", result);
      } else {
        throw new Error("Erreur lors de l'ajout");
      }
    } catch (error) {
      console.error("Erreur:", error);
      setMessage({ 
        type: "error", 
        text: "Erreur lors de l'ajout de l'utilisateur" 
      });
    } finally {
      setLoading(false);
    }
   };

  return (
    <div>
      <PageBreadcrumb pageTitle="Add new user" />
      
      {/* Message de feedback */}
      {message.text && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="space-y-6">
            <PersonalInformationInputs
              value={personalInfo}
              onChange={setPersonalInfo}
            />
          </div>
          <div className="space-y-6">
            <DropzoneComponent
              onChange={handlePaymentChange}
              value={paymentInfo}
            />
            
            {/* Affichage des informations extraites */}
            {(paymentInfo.amount || paymentInfo.date) && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="mb-2 font-semibold">Informations extraites :</h3>
                {paymentInfo.amount && (
                  <p className="mb-1">Montant: {paymentInfo.amount}</p>
                )}
                {paymentInfo.date && (
                  <p className="mb-1">Date: {paymentInfo.date}</p>
                )}
                {paymentInfo.type && (
                  <p>Type: {paymentInfo.type}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center p-3 font-medium text-white rounded-lg bg-brand-500 text-theme-sm hover:bg-brand-600 mt-4 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Traitement...
                </>
              ) : (
                "Save User"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}