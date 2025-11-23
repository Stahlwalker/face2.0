import React from 'react';
import './FaceRecognition.css';

const FaceRecognition = ({ imageUrl, box }) => {
    return (
        <div className='center ma'>
            <div className='absolute mt2'>
                <img id='inputimage' alt='' src={imageUrl} width='500px' height='auto'/>
                {box && box.leftCol && (
                    <div className="bounding-box" style={{
                        top: box.topRow + 'px',
                        right: box.rightCol + 'px',
                        bottom: box.bottomRow + 'px',
                        left: box.leftCol + 'px'
                    }}></div>
                )}
            </div>
        </div>
    );
}

export default FaceRecognition;
