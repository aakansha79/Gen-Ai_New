import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import "../style/interview.scss"
import { useInterview } from "../hooks/useInterview.js"

/**
 * UI LAYER - Interview Report Page
 * Pure presentational component displaying interview plan with sidebar navigation
 * Receives data from hook/props
 */
const Interview = () => {
    const { interviewId } = useParams()
    const { report, loading, getReportById } = useInterview()
    const [activeTab, setActiveTab] = useState('technical')
    const [currentPage, setCurrentPage] = useState(1)

    // Fetch report when component mounts or interviewId changes
    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        }
    }, [interviewId, getReportById])

    // Use real data from report, fallback to mock data if not available
    const interviewData = report || {
        resume: "Rahul Sharma\nDelhi, India\nrahul.sharma@email.com\n+91 9123456789\nCareer Objective:\nEnthusiastic Computer Science graduate seeking a software development role.\nSkills:\nJavaScript, React, Node.js, MongoDB\nProjects:\n- E-commerce Website\n- Weather App\nEducation:\nB.Sc Computer Science (2021–2024)",
        skillGaps: ['redis', 'Message queue', 'Event loop'],
        readinessPercentage: 65, // Interview readiness score
        skillsCovered: 12, // Skills covered
        skillsNeeded: 18, // Total skills needed
        technicalQuestions: [
            { id: 1, question: 'Explain the Event Loop in JavaScript', category: 'technical' },
            { id: 2, question: 'What is Redis and when would you use it?', category: 'technical' },
            { id: 3, question: 'How does the React virtual DOM work?', category: 'technical' }
        ],
        behavioralQuestions: [
            { id: 4, question: 'Tell me about a time you faced a technical challenge', category: 'behavioral' },
            { id: 5, question: 'How do you handle working in a team?', category: 'behavioral' },
            { id: 6, question: 'Describe your approach to learning new technologies', category: 'behavioral' }
        ],
        roadmap: [
            { id: 1, phase: 'Phase 1: Core Fundamentals', items: ['JavaScript Basics', 'React Fundamentals', 'DOM Manipulation'] },
            { id: 2, phase: 'Phase 2: Advanced Topics', items: ['Event Loop', 'Async/Await', 'State Management'] },
            { id: 3, phase: 'Phase 3: System Design', items: ['Microservices', 'Caching', 'Message Queues'] }
        ]
    }

    const getActiveContent = () => {
        switch (activeTab) {
            case 'technical':
                return interviewData.technicalQuestions
            case 'behavioral':
                return interviewData.behavioralQuestions
            case 'roadmap':
                return interviewData.roadmap
            default:
                return []
        }
    }

    const getTabTitle = () => {
        const titles = {
            technical: 'Technical Questions',
            behavioral: 'Behavioral Questions',
            roadmap: 'Road Map'
        }
        return titles[activeTab] || ''
    }

    const activeContent = getActiveContent()

    return (
        <div className="interview-container">
            {loading ? (
                <div className="interview-loading">
                    <div className="loading-spinner">
                        <p>Loading your interview report...</p>
                    </div>
                </div>
            ) : (
                <>
                {/* LEFT SIDEBAR - Navigation */}
                <aside className="sidebar left-sidebar">
                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${activeTab === 'technical' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('technical')
                            setCurrentPage(1)
                        }}
                    >
                        <span className="icon">❓</span>
                        <span>Technical questions</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'behavioral' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('behavioral')
                            setCurrentPage(1)
                        }}
                    >
                        <span className="icon">💬</span>
                        <span>Behavioral questions</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'roadmap' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('roadmap')
                            setCurrentPage(1)
                        }}
                    >
                        <span className="icon">🗺️</span>
                        <span>Road Map</span>
                    </button>
                </nav>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="main-content">
                <div className="content-header">
                    <h2>{getTabTitle()}</h2>
                    <div className="content-info">
                        Page {currentPage} of {Math.ceil(activeContent.length / 5) || 1}
                    </div>
                </div>

                <div className="content-body">
                    {activeTab === 'roadmap' ? (
                        // Roadmap View
                        <div className="roadmap-view">
                            {activeContent.map((phase, index) => (
                                <div key={phase.id} className="phase-item">
                                    <div className="phase-header">
                                        <span className="phase-number">Phase {index + 1}</span>
                                        <h3>{phase.phase}</h3>
                                    </div>
                                    <ul className="phase-items">
                                        {phase.items.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Questions View
                        <div className="questions-view">
                            {activeContent.length > 0 ? (
                                activeContent.map((item, index) => (
                                    <div key={item.id} className="question-card">
                                        <div className="question-number">{index + 1}</div>
                                        <div className="question-content">
                                            <p className="question-text">{item.question}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <p>No questions available</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="pagination">
                    <button
                        className="page-btn"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                    >
                        ← Previous
                    </button>
                    <span className="page-info">Page {currentPage} of {Math.ceil(activeContent.length / 5) || 1}</span>
                    <button
                        className="page-btn"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage >= Math.ceil(activeContent.length / 5)}
                    >
                        Next →
                    </button>
                </div>
            </main>

            {/* RIGHT SIDEBAR - Skills & Summary */}
            <aside className="sidebar right-sidebar">
                {/* Readiness Section */}
                <div className="sidebar-section readiness-section">
                    <h3 className="section-title">Interview Readiness</h3>
                    <div className="readiness-score">
                        <div className="percentage-display">
                            <div className="percentage-circle">
                                <svg viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" className="circle-background"/>
                                    <circle 
                                        cx="50" 
                                        cy="50" 
                                        r="45" 
                                        className="circle-progress"
                                        style={{
                                            strokeDasharray: `${2 * Math.PI * 45}`,
                                            strokeDashoffset: `${2 * Math.PI * 45 * (1 - interviewData.readinessPercentage / 100)}`
                                        }}
                                    />
                                </svg>
                                <span className="percentage-text">{interviewData.readinessPercentage}%</span>
                            </div>
                        </div>
                        <div className="skill-stats">
                            <div className="stat">
                                <span className="stat-label">Skills Covered</span>
                                <span className="stat-value">{interviewData.skillsCovered}/{interviewData.skillsNeeded}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="sidebar-section">
                    <h3 className="section-title">Skill Gaps</h3>
                    <div className="skill-tags">
                        {interviewData.skillGaps.map((skill, index) => (
                            <span key={index} className="skill-tag">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="sidebar-section resume-section">
                    <h3 className="section-title">Resume Preview</h3>
                    <div className="resume-preview">
                        {interviewData.resume}
                    </div>
                </div>
            </aside>

            {/* FOOTER - Action Bar */}
            <footer className="interview-footer">
                <button className="action-btn generate-btn">
                    ⭐ Generate Interview Questions
                </button>
                <button className="action-btn download-btn">
                    📥 Download Plan
                </button>
            </footer>
                </>
            )}
        </div>
    )
}

export default Interview
