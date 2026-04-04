import React, { useRef, useEffect } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview'
import { useNavigate } from 'react-router-dom'
import LoadingScreen from '../../../components/LoadingScreen'

/**
 * UI LAYER - Home Page (Interview Plan Generator)
 * Pure presentational component that receives all data and handlers from the hook.
 * Responsible ONLY for rendering the UI - no business logic.
 */
const Home = () => {
    const navigate = useNavigate()
    const { 
        loading, 
        formData, 
        error, 
        charCount,
        selfDescriptionCharCount,
        handleInputChange, 
        handleFileUpload, 
        handleGenerateReport, 
        dragActive, 
        handleDrag, 
        handleDrop,
        reports,
        getReports
    } = useInterview()
    const resumeInputRef = useRef()

    // Fetch recent interview plans on component mount
    useEffect(() => {
        getReports()
    }, [getReports])

    const handleGenerateClick = async () => {
        const response = await handleGenerateReport()
        const interviewId =
            response?.interviewReport?._id ||
            response?._id ||
            response?.id

        if (interviewId) {
            navigate(`/interview/${interviewId}`)
        }
    }

    return (
        <main className='home'>
            {loading && <LoadingScreen />}
            {/* HEADER SECTION */}
            <div className="header-section">
                <h1>
                    Create Your Custom <span className="highlight-text">Interview Plan</span>
                </h1>
                <p className="subtitle">
                    Let our AI analyze the job requirements and your unique profile to build a winning strategy.
                </p>
            </div>

            {/* MAIN CONTENT */}
            <div className="interview-input-group">
                {/* LEFT SECTION - Job Description */}
                <div className="left">
                    <div className="section-header">
                        <span className="icon">📋</span>
                        <h2>Target Job Description</h2>
                        <span className="badge">REQUIRED</span>
                    </div>
                    <textarea
                        id="jobDescription"
                        name="jobDescription"
                        placeholder="Paste the full job description here...
e.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'"
                        value={formData.jobDescription}
                        onChange={(e) => handleInputChange(e)}
                        disabled={loading}
                        maxLength={5000}
                    />
                    <div className="char-count">{charCount} / 5000 chars</div>
                </div>

                {/* RIGHT SECTION - Profile Inputs */}
                <div className="right">
                    <div className="section-header">
                        <span className="icon">👤</span>
                        <h2>Your Profile</h2>
                    </div>

                    {/* Resume Upload Section */}
                    <div className="upload-section">
                        <div className="upload-header">
                            <p>Upload Resume</p>
                            <span className="badge best-results">BEST RESULTS</span>
                        </div>
                        <label
                            htmlFor="resume"
                            className={`file-upload-area ${dragActive ? 'drag-active' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {formData.resumeFile ? (
                                <div className="file-selected">
                                    <span className="file-icon">📄</span>
                                    <p className="file-name">{formData.resumeFile.name}</p>
                                    <small>Click to change</small>
                                </div>
                            ) : (
                                <div className="file-placeholder">
                                    <span className="upload-icon">☁️</span>
                                    <p>Click to upload or drag & drop</p>
                                    <small>PDF only (Max 5MB)</small>
                                </div>
                            )}
                        </label>
                        <input
                        ref={resumeInputRef}
                            hidden
                            type="file"
                            id="resume"
                            name="resume"
                            accept=".pdf"
                            onChange={(e) => handleFileUpload(e.target.files[0])}
                            disabled={loading}
                        />
                    </div>

                    {/* OR Separator */}
                    <div className="or-separator">
                        <span>OR</span>
                    </div>

                    {/* Self Description Section */}
                    <div className="description-section">
                        <div className="section-header">
                            <span className="icon">🧑‍💼</span>
                            <h3>Quick Self-Description</h3>
                        </div>
                        <textarea
                            onChange={(e) => handleInputChange(e)}
                            id="selfDescription"
                            name="selfDescription"
                            placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                            value={formData.selfDescription}
                            disabled={loading}
                            maxLength={3000}
                        />
                        <div className="char-count">{selfDescriptionCharCount} / 3000 chars</div>
                    </div>

                    {/* Info Box */}
                    <div className="info-box">
                        <span className="info-icon">ℹ️</span>
                        <p>
                            Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && <div className="error-message">{error}</div>}
                </div>
            </div>

            {/* FOOTER SECTION */}
            <div className="footer-section">
                <div className="generate-info">
                    <p>⚡ AI-Powered Strategy Generation • Approx 30s</p>
                </div>
                <button
                    className='button primary-button'
                    onClick={handleGenerateClick}
                    disabled={loading}
                >
                    <span className="star">⭐</span>
                    {loading ? 'Generating Your Strategy...' : 'Generate My Interview Strategy'}
                </button>
                <div className="bottom-links">
                    <a href="#privacy">Privacy Policy</a>
                    <span>•</span>
                    <a href="#terms">Terms of Service</a>
                    <span>•</span>
                    <a href="#help">Help Center</a>
                </div>
            </div>

            {/* RECENT INTERVIEW PLANS SECTION */}
            {reports && reports.length > 0 && (
                <div className="recent-plans-container">
                    <h2 className="recent-plans-title">My Recent Interview Plans</h2>
                    <div className="recent-plans-grid">
                        {reports.map((plan, index) => (
                            <div 
                                key={plan._id || index} 
                                className="interview-card"
                                onClick={() => navigate(`/interview/${plan._id || index}`)}
                            >
                                <div className="card-header">
                                    <h3 className="job-title">{plan.title || plan.jobTitle || 'Interview Plan'}</h3>
                                </div>
                                <div className="card-body">
                                    <div className="plan-info">
                                        <span className="info-label">Generated on</span>
                                        <span className="info-value">{new Date(plan.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {plan.matchScore && (
                                        <div className="match-score">
                                            <span className="score-label">Match Score</span>
                                            <span className="score-value">{plan.matchScore}%</span>
                                        </div>
                                    )}
                                </div>
                                <div className="card-footer">
                                    <button className="view-btn">View Plan →</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </main>
    )
}

export default Home
