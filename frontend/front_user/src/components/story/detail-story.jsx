import React, { useRef,useState,useEffect } from "react";
import { Parallax, ParallaxLayer } from "@react-spring/parallax";
import "./details-story.css"
import { useParams,Link } from "react-router-dom";
export default function DetailStory() {
//   const {storyId}=useParams();
  const parallax = useRef(null);
  const [liked, setLiked] = useState(false);
  const [factor, setFactor] = useState(0.3); 
  useEffect(()=>{
    const handleResize = () => {
      const height = window.innerHeight;
      if (height > 900) setFactor(0.5);  // écran grand
      else if (height > 600) setFactor(0.4); // écran moyen
      else setFactor(0.3);
      console.log(factor);
       // petit écran
    };
       handleResize(); // initial
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  })
  
  
  return (
    <div style={{ width: "100%", height: "100vh" }}> {/* attention au vh */}
      <Parallax ref={parallax} pages={2}>

        {/* Section 1 : image de fond */}
        <ParallaxLayer
          offset={0}
          speed={0}
          factor={factor} // occupe 1 page entière
        >
       <div className="container-img" style={{
        width: "90%",
        height: "100%",
        borderRadius: "30px",
        overflow: "hidden",
        backgroundImage: "url(https://d23.com/app/uploads/2015/06/snow41160x600.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        margin: "5%  auto", // centre horizontalement
      }}/>
        </ParallaxLayer>
         
        {/* Section 2 : texte flottant */}
        <ParallaxLayer
          offset={factor} // commence à la page 2
          speed={0.4} // effet flottant
          factor={0.7} // occupe 1 page
          style={{
            justifyContent: "right",
            alignItems: "flex-start",
            padding: "5%", // léger fond pour lisibilité
          }}
        >
          <h1>Snow white and the 7 kids</h1>  
          <div className="container-min-like">
            <div className="container-min">3min</div>
            <div> <svg
      onClick={() => setLiked(!liked)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="40"
      height="40"
      style={{
        cursor: "pointer",
        transition: "transform 0.2s",
        transform: liked ? "scale(1.2)" : "scale(1)",
      }}
    >
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
           2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09 
           C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5
           c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={liked ? "red" : "none"}  // rouge si cliqué, sinon vide
        stroke="red"                  // contour rouge
        strokeWidth="2"
      />
    </svg>
    </div>
    
          </div>
        
  <Link to={`/lunchStory`}>
   <button className="btn">
  <span role="img" aria-label="microphone" style={{ marginRight: "8px" }}>
    🎤
  </span>
  Listen
  </button>
  </Link>

         <h2>Summary</h2>
         <div style={{border:"1px solid #777",borderRadius:"20px",marginTop:"10px"}}>
          
          <p style={{fontSize: "18px", lineHeight: "1.5", color: "#333" ,padding:"10px"}}>
           One hot summer day when there had been no rain for months and all the ponds and rivers had dried up. A thirsty crow was searching for water. At last, he spotted a pitcher of cool water in a garden and flew down to take a drink,...</p>
          </div>
        </ParallaxLayer>

      </Parallax>
    </div>
  );
}
