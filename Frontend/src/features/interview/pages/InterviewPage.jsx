import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'

const fallbackInterviewData = {
    resume: 'Resume preview is not available yet.',
    skillGaps: ['Communication', 'System design'],
    readinessPercentage: 65,
    skillsCovered: 2,
    skillsNeeded: 4,
    technicalQuestions: [
        {
            id: 1,
            question: 'Explain the event loop in JavaScript.',
            intention: 'To evaluate your core JavaScript understanding.',
            answer: 'Explain the call stack, callback queue, and how async tasks are processed.'
        }
    ],
    behavioralQuestions: [
        {
            id: 1,
            question: 'Tell me about a time you solved a difficult problem.',
            intention: 'To understand your problem-solving approach.',
            answer: 'Use the STAR method and focus on your impact.'
        }
    ],
    roadmap: [
        {
            id: 1,
            phase: 'Day 1: Resume and interview basics',
            items: ['Review your strongest skills', 'Practice concise project explanations']
        }
    ]
}

const InterviewPage = () => {
    const { interviewId } = useParams()
    const { report, loading, error, downloadingPdf, getReportById, downloadResume } = useInterview()
    const [activeTab, setActiveTab] = useState('technical')
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        }
    }, [interviewId, getReportById])

    const interviewData = report ? {
        resume: report.resume || report.selfDescription || 'Resume preview is not available.',
        skillGaps: Array.isArray(report.skillGaps) ? report.skillGaps.map((gap) => gap.skill || 'Skill gap') : [],
        readinessPercentage: report.matchScore || 0,
        skillsCovered: Array.isArray(report.technicalQuestion) ? report.technicalQuestion.length : 0,
        skillsNeeded:
            (Array.isArray(report.technicalQuestion) ? report.technicalQuestion.length : 0) +
            (Array.isArray(report.skillGaps) ? report.skillGaps.length : 0),
        technicalQuestions: Array.isArray(report.technicalQuestion)
            ? report.technicalQuestion.map((item, index) => ({
                id: index + 1,
                question: item.question,
                intention: item.intention,
                answer: item.answer
            }))
            : [],
        behavioralQuestions: Array.isArray(report.behaviouralQuestion)
            ? report.behaviouralQuestion.map((item, index) => ({
                id: index + 1,
                question: item.question,
                intention: item.intention,
                answer: item.answer
            }))
            : [],
        roadmap: Array.isArray(report.preparationPlan)
            ? report.preparationPlan.map((item) => ({
                id: item.day,
                phase: `Day ${item.day}: ${item.focus}`,
                items: item.tasks || []
            }))
            : []
    } : fallbackInterviewData

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
            roadmap: 'Preparation Roadmap'
        }
        return titles[activeTab] || 'Interview Plan'
    }

    const activeContent = getActiveContent()
    const totalPages = Math.max(1, Math.ceil(activeContent.length / 5))
    const paginatedContent = activeContent.slice((currentPage - 1) * 5, currentPage * 5)

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
                    <aside className="sidebar left-sidebar">
                        <nav className="sidebar-nav">
                            <button
                                className={`nav-item ${activeTab === 'technical' ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveTab('technical')
                                    setCurrentPage(1)
                                }}
                            >
                                <span className="icon">Q</span>
                                <span>Technical Questions</span>
                            </button>
                            <button
                                className={`nav-item ${activeTab === 'behavioral' ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveTab('behavioral')
                                    setCurrentPage(1)
                                }}
                            >
                                <span className="icon">B</span>
                                <span>Behavioral Questions</span>
                            </button>
                            <button
                                className={`nav-item ${activeTab === 'roadmap' ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveTab('roadmap')
                                    setCurrentPage(1)
                                }}
                            >
                                <span className="icon">R</span>
                                <span>Roadmap</span>
                            </button>
                        </nav>
                    </aside>

                    <main className="main-content">
                        <div className="content-header">
                            <h2>{getTabTitle()}</h2>
                            <div className="content-info">Page {currentPage} of {totalPages}</div>
                        </div>

                        <div className="content-body">
                            {error && (
                                <div className="empty-state">
                                    <p>{error}</p>
                                </div>
                            )}

                            {activeTab === 'roadmap' ? (
                                <div className="roadmap-view">
                                    {paginatedContent.map((phase, index) => (
                                        <div key={phase.id} className="phase-item">
                                            <div className="phase-header">
                                                <span className="phase-number">Step {(currentPage - 1) * 5 + index + 1}</span>
                                                <h3>{phase.phase}</h3>
                                            </div>
                                            <ul className="phase-items">
                                                {phase.items.map((item, itemIndex) => (
                                                    <li key={itemIndex}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="questions-view">
                                    {paginatedContent.length > 0 ? (
                                        paginatedContent.map((item, index) => (
                                            <div key={item.id} className="question-card">
                                                <div className="question-number">{(currentPage - 1) * 5 + index + 1}</div>
                                                <div className="question-content">
                                                    <div>
                                                        <p className="question-text">{item.question}</p>
                                                        {item.intention && <p className="question-meta"><strong>Why asked:</strong> {item.intention}</p>}
                                                        {item.answer && <p className="question-meta"><strong>How to answer:</strong> {item.answer}</p>}
                                                    </div>
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

                        <div className="pagination">
                            <button
                                className="page-btn"
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <span className="page-info">Page {currentPage} of {totalPages}</span>
                            <button
                                className="page-btn"
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage >= totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </main>

                    <aside className="sidebar right-sidebar">
                        <div className="sidebar-section readiness-section">
                            <h3 className="section-title">Interview Readiness</h3>
                            <div className="readiness-score">
                                <div className="percentage-display">
                                    <div className="percentage-circle">
                                        <svg viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="45" className="circle-background" />
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
                                        <span className="stat-value">{interviewData.skillsCovered}/{Math.max(interviewData.skillsNeeded, 1)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sidebar-section">
                            <h3 className="section-title">Skill Gaps</h3>
                            <div className="skill-tags">
                                {interviewData.skillGaps.length > 0 ? interviewData.skillGaps.map((skill, index) => (
                                    <span key={index} className="skill-tag">
                                        {skill}
                                    </span>
                                )) : (
                                    <span className="skill-tag">No major gaps detected</span>
                                )}
                            </div>
                        </div>

                        <div className="sidebar-section resume-section">
                            <h3 className="section-title">Resume Preview</h3>
                            <div className="resume-preview">{interviewData.resume}</div>
                        </div>
                    </aside>

                    <footer className="interview-footer">
                        <button
                            className="action-btn generate-btn"
                            onClick={() => getReportById(interviewId)}
                            disabled={!interviewId}
                        >
                            Refresh Report
                        </button>
                        <button
                            className="action-btn download-btn"
                            onClick={() => downloadResume(interviewId)}
                            disabled={downloadingPdf || !interviewId}
                        >
                            {downloadingPdf ? 'Generating Resume PDF...' : 'Download Tailored Resume PDF'}
                        </button>
                    </footer>
                </>
            )}
        </div>
    )
}

export default InterviewPage
