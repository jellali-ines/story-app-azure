import { useState,useEffect,useRef } from 'react'
import React from 'react'
import AudioPlayer from './AudioPlayer'
import "./lunch-story.css"
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import './audio-player.css'
import Loading from '../../assets/Loading.gif'
function LunchStory() {
        // const {id}=useParams();
        const [transcription,setTranscription]=useState([])
        const [audioUrl,setAudioUrl]=useState(null)
        const [storyTotalLength,setStoryTotalLength]=useState('04:30')
        const [storyurrentTime,setStoryurrentTime]=useState('00:00')
        const [audioProgress,setAudioProgress]=useState(0)
        const [isAudioPlaying,setIsAudioPlaying]=useState(false)
        const [loading, setLoading] = useState(false); 
         const [currentText, setCurrentText] = useState("");
         const intervalRef = useRef(null);
        const handleMusicProgressBar=(e)=>{
            setAudioProgress(e.target.value)
            currentAudio.current.currentTime = e.target.value * currentAudio.current.duration / 100;
        }
        const currentAudio=useRef()
        const handleAudioPlay=()=>{
            if(currentAudio.current.paused){
                 currentAudio.current.play();
                 console.log("plaued");
                 
                 setIsAudioPlaying(true)
                  intervalRef.current = setInterval(() => {
      const currentTime = currentAudio.current.currentTime;
      const currentSegment = transcription.find(
        (seg) => currentTime >= seg.start && currentTime <= seg.end
      );
      setCurrentText(currentSegment ? currentSegment.text : "");
    }, 100);
                }
            else{
                currentAudio.current.pause();
                console.log("paused");
                
                setIsAudioPlaying(false)
                clearInterval(intervalRef.current);
            }    
        };
        const handleAudioUpdate=()=>{
            let minutes=Math.floor(currentAudio.current.duration/60);
            let secondes=Math.floor(currentAudio.current.duration %60);
            let storyTotalLength=`${minutes<10?`0${minutes}`:minutes}:${secondes<10?`0${secondes}`:secondes}`
            setStoryTotalLength(storyTotalLength)
            console.log("handle",storyTotalLength);
            
            
            
            
            //input story current time
            let currentmin=Math.floor(currentAudio.current.currentTime/60);
            let currentsec=Math.floor(currentAudio.current.currentTime %60);
            let storycrrentTime=`${currentmin<10?`0${currentmin}`:currentmin}:${currentsec<10?`0${currentsec}`:currentsec}`
            console.log(currentAudio.current.currentTime);
            
            setStoryurrentTime(storycrrentTime)
            console.log("handle",storycrrentTime);
            const progress=parseInt((currentAudio.current.currentTime / currentAudio.current.duration)*100);
            setAudioProgress(isNaN(progress)?0:progress)
        }
        const plus10sec=()=>{
            let current=currentAudio.current.currentTime+10>=currentAudio.current.duration?currentAudio.current.duration:currentAudio.current.currentTime+10;
            let currentmin=Math.floor(current/60);
            let currentsec=Math.floor(current %60);
            let storycrrentTime=`${currentmin<10?`0${currentmin}`:currentmin}:${currentsec<10?`0${currentsec}`:currentsec}`
            setStoryurrentTime(storycrrentTime)
            
            
            currentAudio.current.currentTime=current
            let progress=(current/currentAudio.current.duration) * 100
            setAudioProgress(progress)
    
            
        }
        const min10sec=()=>{
    
            let current=currentAudio.current.currentTime-10<=0?0:currentAudio.current.currentTime-10;
            
            let currentmin=Math.floor(current/60);
            let currentsec=Math.floor(current %60);
            let storycrrentTime=`${currentmin<10?`0${currentmin}`:currentmin}:${currentsec<10?`0${currentsec}`:currentsec}`
            setStoryurrentTime(storycrrentTime)
            currentAudio.current.currentTime=current
            let progress=(current / currentAudio.current.duration) * 100
            setAudioProgress(progress)
            
        }
    const getTranscription=async ()=>{
             setLoading(true)
             await fetch("/transcribe",
            { method: "POST"},)
            .then((response)=>response.json())
            .then((data)=>{
            setTranscription(data.segments);
            console.log(data.segments);
            
            getAudio();
            
            })
        // .then(setAudioUrl("/audio",{ method: "GET" }))    
        .catch((error)=>console.log("error fetching transcription",error));
        }
    const getAudio=async()=>{
        console.log("getAudio");
        try{
         const response = await fetch("/audio", { method: "GET" });
        const blob = await response.blob();           // ✅ lire une seule fois
        console.log(blob);                            // tu peux loguer ici
        const url = URL.createObjectURL(blob);
        console.log("urlll",url);
        setAudioUrl(url);
        
    } catch (error) {
        console.error("error fetching audio", error);
    }}
    useEffect(()=>{
        //
        setLoading(true); 
        getTranscription();
    },[]);

    useEffect(() => {
        console.log("audio",audioUrl);
        
       // currentAudio.current.load();
        if (audioUrl) {
            console.log("aaaaaaaaaa");
            
            setLoading(false); }
  }, [audioUrl]);
   
    useEffect(() => {
    const audioref = currentAudio.current;
    if (!audioref) return;

    const updateSubtitle = () => {
      const currentTime = audioref.currentTime;
      const currentSegment = transcription.find(
        (seg) => currentTime >= seg.start && currentTime <= seg.end
      );
      if (currentSegment) {
        setCurrentText(currentSegment.text);
      } else {
        setCurrentText(""); // pas de texte en dehors des segments
      }
    };

    audioref.addEventListener("timeupdate", updateSubtitle);

    return () => {
      audioref.removeEventListener("timeupdate", updateSubtitle);
    };
  }, [transcription]);
    return (
//         loading?(
//         <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
//   <img 
//     src={Loading} 
//     alt="spinner" 
//     style={{ height: "100%", width: "100%", objectFit: "cover" }} 
//   />
// </div>)
//         :(
<motion.div
      initial={{ opacity: 0, y: 400 }}   // commence en bas (50px sous sa position finale)
  animate={{ opacity: 1, y: 0 }}    // remonte à sa position normale
  transition={{ duration: 1, ease: "easeOut" }} 
    >
        <div style={{ height: "100vh", overflowY: "auto", padding: "10px" }}>
        <div className='container-img'>
            <img src="https://d23.com/app/uploads/2015/06/snow41160x600.jpg" ></img>
        </div>
            
        
         <h1 style={{textAlign:"center"}}>titre de l'histoire</h1>
          <div style={{padding:"10px"}}>
    
    <div>
      <audio src={audioUrl} ref={currentAudio}  key={audioUrl} onLoadedMetadata={handleAudioUpdate} onTimeUpdate={handleAudioUpdate}></audio>
      <div className={`subtitle ${currentText ? "show" : ""}`}>
        {currentText}
      </div>
      <div className="music-Container">
        <div className="musicTimerDiv">
          <p className='musicCurrentTime'>{storyurrentTime}</p>
          <p className='musicTotalLenght'>{storyTotalLength}</p>
        </div>
        <input type="range" 
        name="musicProgressBar" 
        className='musicProgressBar' 
        value={audioProgress} 
        onChange={handleMusicProgressBar}  
        style={{    background: `linear-gradient(to right, #ff7f00 0%, #ff7f00 ${audioProgress}%, #ddd ${audioProgress}%, #ddd 100%)`}}/>
<div className="musicControlers-wrapper">

  <div className="musicControlers">
    <i className="fa-solid fa-backward musicControler" onClick={min10sec}></i>

    <div className="launch-container">
      <i className={`fa-solid ${isAudioPlaying ? 'fa-pause-circle' : 'fa-circle-play'} playBtn`} onClick={handleAudioPlay}></i>
    </div>
    <i className="fa-solid fa-forward musicControler" onClick={plus10sec}></i>
  </div>

</div>

      </div>
    </div>
          </div>
          <div style={{border:"1px solid #777",borderRadius:"20px",marginTop:"10px"}}>
          
          <p style={{fontSize: "18px", lineHeight: "1.5", color: "#333" ,padding:"10px"}}>
           One hot summer day when there had been no rain for months and all the ponds and rivers had dried up. A thirsty crow was searching for water. At last, he spotted a pitcher of cool water in a garden and flew down to take a drink, but when he put his head into the neck of the picture, it was only half full, and the crow could not reach the water. 
           The poor crow knew that if he did not get a drink, soon, he would die of thirst. He had to find some way of getting to the water in the picture as he looked around, wondering what to do. He saw some pebbles on the path and he had an idea, he picked up a pebble in his beak and dropped it into the pitcher. The water level rose a little. The bird got another pebble and dropped it in the water. A little more. The crow worked very hard, dropping more and more bubbles into the picture until the water was almost at the top, at last, the bird was able to reach the water, and he drank and drank until he could drink no more. His clever idea had saved his life.
          </p>
          </div>
        
        </div>
        </motion.div>)
    //)
}

export default LunchStory
