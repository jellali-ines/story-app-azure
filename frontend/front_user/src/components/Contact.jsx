import React from "react";

const Contact = () => {
  return (
    <section className="w-full flex justify-center px-6 md:px-16 py-20 bg-white">
      <div className="w-full max-w-3xl">
        
        {/* HEADER */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-4">
          Contact sales
        </h1>
        <p className="text-gray-600 text-center mb-10 max-w-xl mx-auto">
            Have questions, suggestions, or need help? We'd love to hear from you!
        </p>

        {/* FORM */}
        <form className="flex flex-col gap-5">
          
          {/* FIRST + LAST NAME */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">First name</label>
              <input
                type="text"
                className="mt-1 w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="First name"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Last name</label>
              <input
                type="text"
                className="mt-1 w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Last name"
              />
            </div>
          </div>


          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="mt-1 w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Email"
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="text-sm font-medium text-gray-700">Phone number</label>
            <div className="flex gap-3 mt-1">
            

              <input
                type="tel"
                placeholder="+216 ** *** ***"
                className="px-4 py-3 border rounded-lg flex-1 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* MESSAGE */}
          <div>
            <label className="text-sm font-medium text-gray-700">Message</label>
            <textarea
              rows="4"
              className="mt-1 w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Write your message..."
            ></textarea>
          </div>

          {/* Submit */} 
          <button className="bg-orange-500 hover:bg-orange-600 transition-all px-6 py-3 mt-2 rounded-lg font-semibold text-white w-full"> 
            Send Message 
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
