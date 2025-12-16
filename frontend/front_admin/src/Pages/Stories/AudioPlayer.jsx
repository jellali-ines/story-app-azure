import React from 'react'
import WaveSurfer from 'wavesurfer.js'
import { useState,useRef } from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';
import './audio-player.css'
function AudioPlayer({audioUrl}) {
    const [storyTotalLength,setStoryTotalLength]=useState('04:30')
    const [storyurrentTime,setStoryurrentTime]=useState('00:00')
    const [audioProgress,setAudioProgress]=useState(0)
    const [isAudioPlaying,setIsAudioPlaying]=useState(false)
    
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
            }
        else{
            currentAudio.current.pause();
            console.log("paused");
            
            setIsAudioPlaying(false)
        }    
    };
    const handleAudioUpdate=()=>{
        let minutes=Math.floor(currentAudio.current.duration/60);
        let secondes=Math.floor(currentAudio.current.duration %60);
        let storyTotalLength=`${minutes<10?`0${minutes}`:minutes}:${secondes<10?`0${secondes}`:secondes}`
        setStoryTotalLength(storyTotalLength)
        
        
        //input story current time
        let currentmin=Math.floor(currentAudio.current.currentTime/60);
        let currentsec=Math.floor(currentAudio.current.currentTime %60);
        let storycrrentTime=`${currentmin<10?`0${currentmin}`:currentmin}:${currentsec<10?`0${currentsec}`:currentsec}`
        console.log(currentAudio.current.currentTime);
        
        setStoryurrentTime(storycrrentTime)
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
        return (
    <div>
      <audio src={audioUrl} ref={currentAudio} onTimeUpdate={handleAudioUpdate}></audio>
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
    
    )
}

export default AudioPlayer
