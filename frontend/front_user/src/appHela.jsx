// import { Parallax, ParallaxLayer } from "@react-spring/parallax";
import {Route,Routes,BrowserRouter} from "react-router-dom"

import Home from "./Pages/Home";
import Contact1 from "./Pages/Contact";
import Stories from "./Pages/Stories";
import ChildProfilesPage from "./Pages/ProfilesPage";
import StoryDetails from "./Components/story/StoryDetails";
import ReadTheStory from "./Components/story/StoryReader";
import CreateAccountForm from "./Components/auth/SingUp";
import LunchStory from "./Components/story/StoryLunch";
import PreferencesPage from "./Pages/Preferences";
//import Test from "./Pages/test";
export default function App() {
 return(
   <BrowserRouter>
      <Routes>
        <Route path="/stories" element={<Stories />} />
        <Route path="story/:id" element={<StoryDetails />} />
        <Route path="story/read/:id" element={<ReadTheStory />} />
        <Route path="/profiles" element={<ChildProfilesPage />} />
        <Route path="/preferences" element={<PreferencesPage />} />
        <Route path="/" element={<Home />} />
        <Route path="/story/lunch" element={<LunchStory/>} />
        {/* <Route path="/test" element={<Test/>} /> */}
        <Route path="*" element={<h1 className="text-center mt-20 text-3xl font-bold">404 - Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>

  );
}

{/* 
              
              <Route 
                path="story/read/:id" 
                element={<ReadTheStory />} 
              />
              
              <Route 
                path="/preferences" 
                element={<PreferencesPage />} 
              />
              
              <Route 
                path="/story/lunch" 
                element={<LunchStory/>} 
              /> */}