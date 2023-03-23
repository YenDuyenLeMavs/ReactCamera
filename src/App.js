import './App.scss';
import { useState, useEffect, useRef } from 'react';
import Draggable from "react-draggable";


function SidePanel({setReturnPosition, state, onHand, setSSValue, setFStopValue, setExposure, setCurrentLeft, setCurrentBottom}){ 
  return (
    <div id='side-panel' style={{'visibility': state}}>
      <UndoButton setReturnPosition={setReturnPosition} setSSValue={setSSValue} setFStopValue={setFStopValue} setExposure={setExposure} setCurrentLeft={setCurrentLeft} setCurrentBottom={setCurrentBottom} /> 
      <div onClick={onHand} id='second-button' class='side-button'></div> 
      <div onClick={onHand} class='side-button'></div> 
    </div>
  );
}

function UndoButton({setReturnPosition, setSSValue, setFStopValue, setExposure, setCurrentLeft, setCurrentBottom}){
  function handleClick(){
    setSSValue(400)
    setFStopValue(5.0)
    setExposure("brightness(1)")
    setCurrentLeft(106)
    setCurrentBottom(53)
    setReturnPosition({x: 0, y: 0})
  };
  
  return (
    <div id='undo-button' class='side-button' onClick={handleClick}>
     <img src="/Undo.png" alt="Undo button" />
    </div>
  );
}

function ControlPanel({returnPosition, setReturnPosition, captureURL, setCaptureURL, photoRef, stripRef, state, setState, hand, onCapture, exposure, setExposure, SSValue, FStopValue, setSSValue, setFStopValue, currentLeft, setCurrentLeft, currentBottom, setCurrentBottom, pressed, setPressed, position, setPosition, ref}){
  return (
    <div id='control-panel' className={hand} style={{'visibility': state}}> 
      <ExposurePanel returnPosition={returnPosition} setReturnPosition={setReturnPosition} hand={hand} exposure={exposure} setExposure={setExposure} SSValue={SSValue} FStopValue={FStopValue} setSSValue={setSSValue} setFStopValue={setFStopValue} currentLeft={currentLeft} setCurrentLeft={setCurrentLeft} currentBottom={currentBottom} setCurrentBottom={setCurrentBottom} pressed={pressed} setPressed={setPressed} position={position} setPosition={setPosition} ref={ref} />
      <CaptureButton hand={hand} setCaptureURL={setCaptureURL} photoRef={photoRef} stripRef={stripRef} onCapture={onCapture} />
      <CaptureHistory hand={hand} captureURL={captureURL} exposure={exposure} photoRef={photoRef} stripRef={stripRef} state={state} setState={setState} />
      <DownloadImage hand={hand} captureURL={captureURL} state={state}/>
    </div>
  );
}

function DownloadImage({hand, captureURL, state}) {
  const [visibility, setVisibility] = useState('hidden')
  const [handClass, setHandClass] = useState('download-button-left')

  useEffect(() => {
    if (handClass === 'download-button-right') {
      setHandClass('download-button-left') 
    } else {
      setHandClass('download-button-right')
    }
  }, [hand])

  useEffect(() => {
    if (state === 'hidden') {
      setVisibility('visible')
    } else {
      setVisibility('hidden')
    }
  }, [state]);

  return (
    <a download="CapturedImage.jpg" href={captureURL} title="Captured Image" style={{'visibility': visibility}} >
        <div id="review-button" className={handClass}>
          <img src='../Download.png' alt="Download icon" />
        </div>
    </a> 

  )
}

function CameraViewPort({stripRef, captureURL, state, videoRef, photoRef, hand, exposure}){
  const [reviewDisplay, setReviewDisplay] = useState("none")
  
  useEffect(() => {
    if (state === "hidden") {
      setReviewDisplay("inline")
    } else {
      setReviewDisplay("none")
    }
  }, [state]);

  useEffect(() => {
    getVideo()
  }, [videoRef]);
  
  useEffect(() => {
    let highestID = setInterval(() => {})
    for(let i = 0; i <= highestID; i++) {
      clearInterval(i)
    }
    paintToCanvas()
  }, [exposure]);

  const getVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: '100%' } })
      .then(stream => {
        let video = videoRef.current
        video.srcObject = stream
        video.play()
      })
      .catch(err => {
        console.error("error:", err)
      });
  };

  function paintToCanvas(){
    let video = videoRef.current
    let photo = photoRef.current
    let ctx = photo.getContext('2d')
    const width = 896
    const height = 414
    photo.width = width
    photo.height = height
    setInterval(() => {
      ctx.filter = exposure
      ctx.drawImage(video, 0, 0, width, height)
    }, 200);
  };

 

  return (
    <div id="camera-viewport" >
      <img src={captureURL} alt="Last captured" style={{'display': reviewDisplay}} />
      <video id="camera-feed" className={hand} ref={videoRef} style={{'filter': exposure, 'visibility': state}} onCanPlay={() => paintToCanvas()}/>
    </div>
  );
}

function ExposureRegion({hand, focus, onFocus}){
  const [left, setLeft] = useState(0)
  const [top, setTop] = useState(0)
  
  function handleClick(e){
    if (hand === "right") {
      setLeft(e.clientX-49-53)
      setTop(e.clientY-53)
    } else {
      setLeft(e.clientX-231-100)
      setTop(e.clientY-53)
    }
  };

  return (
    <div id="exposure-region" onClick={(e) => {handleClick(e); onFocus();}} className={hand} >
      <div id="top-bottom" style={{'left': left+10, 'top': top, 'visibility': focus}}></div>
      <div id="left-right" style={{'left': left, 'top': top+10, 'visibility': focus}}></div>
    </div>
  );
}

function ExposurePanel({returnPosition, setReturnPosition, visibility, hand, exposure, setExposure, FStopValue, SSValue, setSSValue, setFStopValue, currentLeft, setCurrentLeft, currentBottom, setCurrentBottom, pressed, setPressed, position, setPosition, ref}){
  return (
    <div id='exposure-panel'style={{'visibility': visibility}} >
      <ExposureSpace returnPosition={returnPosition} setReturnPosition={setReturnPosition} hand={hand} exposure={exposure} setExposure={setExposure} FStopValue={FStopValue} setFStopValue={setFStopValue} SSValue={SSValue} setSSValue={setSSValue} currentLeft={currentLeft} setCurrentLeft={setCurrentLeft} currentBottom={currentBottom} setCurrentBottom={setCurrentBottom} pressed={pressed} setPressed={setPressed} position={position} setPosition={setPosition} ref={ref}/>
      <ExposureLabels FStopValue={FStopValue} SSValue={SSValue}/>
    </div>
  );
}

function ExposureSpace({returnPosition, setReturnPosition, hand, setExposure, setFStopValue, setSSValue, currentLeft, setCurrentLeft, currentBottom, setCurrentBottom}){
  const [mousePos, setMousePos] = useState({});
  const [isDrag, setIsDrag] = useState(false)
  const [isInside, setIsInside] = useState(false)
  const defaultLeft = 110
  const defaultBottom = 115

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePos({ x: event.clientX, y: event.clientY });
    };

    const handleMouseUp = (event) => {
      setIsDrag(false)
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener(
        'mousemove',
        handleMouseMove
      );
    };
  }, []);

  useEffect(() => {
    if (isDrag && isInside) {
      setFStopValue((0.035115*mousePos.x - 23.23).toFixed(1))
      setSSValue((5.585*mousePos.y - 163.55).toFixed(0))
      let newExposure = (0.006355932203389831*mousePos.x-4.141949152542373)*0.5+(-0.00625*mousePos.y+1.61875)*0.5
      setExposure("brightness("+newExposure.toString()+")")
    }
  }, [mousePos])


  function handleDrag(e){
    setReturnPosition(null)
    setIsDrag(true)
  }
  function handleMouseEnter(){
    setIsInside(true)
  }
  function handleMouseLeave(){
    setIsInside(false)
  }

  return (
    <div id='exposure-space' >
      <img id='aperture-icon' src="/Aperture.png" alt="Aperture Icon" />
      <img id='FStop-icon' src="/FStop.png" alt="F-Stop Icon" />
      <div id='exposure-grid' onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <div id='vertical-line'></div>
        <div id='horizontal-line'></div>
        <Draggable bounds="parent" onDrag={handleDrag} position={returnPosition} >
          <div id='current-pointer' style={{'left': currentLeft, 'top': currentBottom}} ></div>
        </Draggable>
        <img id='default-pointer' src='StarIcon.png' alt='Default Pointer' style={{'left': defaultLeft, 'bottom': defaultBottom}} />
      </div>
    </div>
  );
}

function ExposureLabels({FStopValue, SSValue}){
  return (  
    <div id='exposure-labels'>
      <link href='https://fonts.googleapis.com/css?family=Genos' rel='stylesheet'></link>
      <div id='FStop-label' class='label-icon'>
        <img src="/FStop.png" alt="F-Stop Icon" />
        <p class='exposure-value' id='FStop-value'>{FStopValue}</p>
      </div>
      <div id='aperture-label' class='label-icon'>
        <img src="/Aperture.png" alt="Aperture Icon" />
        <p class='exposure-value' id='aperture-value'>&nbsp;1/{SSValue}</p>
      </div>
    </div>
  );
}

function CaptureButton({hand, setCaptureURL, photoRef, stripRef, onCapture}){
  const takePhoto = () => {
    let photo = photoRef.current;
    const data = photo.toDataURL('image/jpeg');
    setCaptureURL(data);
  };

  return (
    <div onClick={() => {onCapture(); takePhoto();}} id='capture-ring' className={hand}>
      <button id='capture-button'></button>
    </div>
  );
}

function CaptureHistory({hand, captureURL, photoRef, state, setState}){
  const [displayThumbnail, setDisplayThumbnail] = useState('none')
  const [thumbnailURL, setThumbnailURL] = useState(captureURL)
  const [handClass, setHandClass] = useState('capture-preview-left')

  useEffect(() => {
    if (handClass === 'capture-preview-right') {
      setHandClass('capture-preview-left') 
    } else {
      setHandClass('capture-preview-right')
    }
  }, [hand])

  useEffect(() => {
    if (captureURL !== "") {
      setDisplayThumbnail('inline');
      setThumbnailURL(captureURL);
    } 
  }, [captureURL]);

  function handleClick(){
    if (captureURL !== "") {
      if (state === "visible") {
        setState("hidden");
        setThumbnailURL('../Camera.png');
      } else {
        setState("visible");
        setThumbnailURL(captureURL);
      }
    }
  };

  return (
    <div id='capture-history'>
      <div id='review-button' className={handClass} onClick={handleClick}>
        <img id='capture-thumbnail' src={thumbnailURL} alt='Thumbnail of last captured' style={{'display': displayThumbnail}}></img>
      </div>
      <canvas ref={photoRef} className='photo' />
    </div> 
  );
}

function UI({flash, captureURL, setCaptureURL, state, setState, videoRef, photoRef, stripRef, hand, setHand, onCapture, exposure, setExposure, SSValue, FStopValue, setSSValue, setFStopValue}){
  const [focus, setFocus] = useState("hidden")
  const [currentLeft, setCurrentLeft] = useState(106) 
  const [currentBottom, setCurrentBottom] = useState(53) 
  const [pressed, setPressed] = useState(false)
  const [returnPosition, setReturnPosition] = useState(null)
  const [position, setPosition] = useState(0)
  const ref = useRef()
  
  function toggle(){
    if (hand === "right") {
      setHand("left")
    } else {
      setHand("right")
    }
  };
  function toggleFocus(){
    if (focus === "hidden") {
      setFocus("visible")
    } 
  };
  function toggleOff(){
    if (focus === "visible") {
      setFocus("hidden")
    } 
  };
  function resetToggle(){
    setSSValue(375);
    setFStopValue(4.4);
  };

  return (
    <div id="ui" style={{'background-color': flash}}>
      <ControlPanel returnPosition={returnPosition} setReturnPosition={setReturnPosition} captureURL={captureURL} setCaptureURL={setCaptureURL} videoRef={videoRef} photoRef={photoRef} stripRef={stripRef} state={state} setState={setState} hand={hand} onCapture={() => {onCapture(); toggleOff();}} exposure={exposure} setExposure={setExposure} SSValue={SSValue} FStopValue={FStopValue} setSSValue={setSSValue} setFStopValue={setFStopValue} currentLeft={currentLeft} setCurrentLeft={setCurrentLeft} currentBottom={currentBottom} setCurrentBottom={setCurrentBottom} pressed={pressed} setPressed={setPressed} position={position} setPosition={setPosition} ref={ref} />
      <SidePanel setReturnPosition={setReturnPosition} state={state} onHand={toggle} reset={resetToggle} setSSValue={setSSValue} setFStopValue={setFStopValue} setExposure={setExposure} setCurrentLeft={setCurrentLeft} setCurrentBottom={setCurrentBottom} />
      <ExposureRegion state={state} hand={hand} focus={focus} onFocus={toggleFocus} />
    </div>
  );
}

function App() {
  const [exposure, setExposure] = useState("brightness(1)")
  const [hand, setHand] = useState("right")
  const [state, setState] = useState("visible")
  const [captureURL, setCaptureURL] = useState("")
  const [SSValue, setSSValue] = useState(400)
  const [FStopValue, setFStopValue] = useState('5.0')
  const [flash, setFlash] = useState('transparent')
  const videoRef = useRef(null)
  const photoRef = useRef(null)
  const stripRef = useRef(null)
  
  useEffect(() => {
    setTimeout(() => {
      if (flash === '#000000') {
        setFlash('transparent')
      }
    }, 100);
  });
  
  function toggle(){
    if (flash === 'transparent') {
      setFlash('#000000')
    }
  };

  
  return (
    <div className="App">
      <CameraViewPort captureURL={captureURL} state={state} videoRef={videoRef} photoRef={photoRef} stripRef={stripRef} hand={hand} setHand={setHand}  exposure={exposure} setExposure={setExposure}/>
      <UI flash={flash} captureURL={captureURL} setCaptureURL={setCaptureURL} state={state} setState={setState} videoRef={videoRef} photoRef={photoRef} stripRef={stripRef} hand={hand} setHand={setHand} onCapture={toggle} exposure={exposure} setExposure={setExposure} SSValue={SSValue} FStopValue={FStopValue} setSSValue={setSSValue} setFStopValue={setFStopValue}/>
    </div>
  );
}

export default App;