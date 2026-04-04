import React from 'react'
import './LoadingScreen.scss'

const LoadingScreen = () => {
    return (
        <div className="loading-screen-overlay">
            <div className="loading-screen-container">
                <div className="spinner">
                    <div className="spinner-circle"></div>
                    <div className="spinner-circle"></div>
                    <div className="spinner-circle"></div>
                </div>
                <h2>Generating Your Interview Strategy</h2>
                <p>Our AI is analyzing your profile and the job requirements...</p>
                <div className="progress-bar">
                    <div className="progress-fill"></div>
                </div>
                <p className="progress-text">This may take up to 30 seconds</p>
            </div>
        </div>
    )
}

export default LoadingScreen
