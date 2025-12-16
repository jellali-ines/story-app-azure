import { Parallax, ParallaxLayer } from "@react-spring/parallax";
import {Route,Routes,BrowserRouter} from "react-router-dom"
import LunchStory from "../src/Pages/Stories/lunch-story";
import FormElements from "./Pages/Admin/Forms/FormElements.Jsx";
import AdminLayout from "./Pages/Admin/Layout/admin-layout";
import AddUserForm from "./Pages/Admin/users/addUser";
import AddStoryForm from "./Pages/Admin/Stories/addStory";
import DetailStory from "./Pages/Stories/detail-story";
import SignIn from "./Pages/AuthPages/SignIn";
import StoriesList from "./Pages/Admin/Stories/getAllStories";
import UsersList from "./Pages/Admin/users/usersList";
import UserProfiles from "./Pages/Admin/users/UserProfiles";
import { Toaster } from 'react-hot-toast';

export default function App() {
 return(
  <>
   <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
   <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="addStory" element={
              <AddStoryForm />
            } />
          <Route path="viewAllStories" element={
              <StoriesList />
            } />
          <Route path="addUser" element={
               <AddUserForm />
           
            } />
          <Route path="users" element={<UsersList />} />
          <Route path="user/:id" element={<UserProfiles/>}/>
          <Route path="addGenre" element={<FormElements />} />
          <Route path="viewAllGenre" element={<FormElements />} />

        </Route>
          <Route path="storyDetail" element={<DetailStory />} />
          <Route path="lunchStory" element={<LunchStory />} />
          <Route path="/signin" element={<SignIn />} />
      </Routes>
    </BrowserRouter>
</>
  );
}
