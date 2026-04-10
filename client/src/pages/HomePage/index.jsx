import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import {
  uploadResume,
  getResume,
} from '../../services/interviewService.js';
import INTERVIEW_ROLES from '../../constants/roles.js';
import DIFFICULTY_LEVELS from '../../constants/difficulty.js';
import {
  BsDisplay,
  BsServer,
  BsLightningFill,
  BsGraphUp,
  BsCloudFill,
  BsStarFill,
  BsStar,
  BsFileEarmarkArrowUp,
} from 'react-icons/bs';
import { FaPython, FaReact, FaJava } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './index.css';

const ROLE_ICONS = {
  'frontend-developer': BsDisplay,
  'backend-developer': BsServer,
  'full-stack-developer': BsLightningFill,
  'data-analyst': BsGraphUp,
  'devops-engineer': BsCloudFill,
  'python-developer': FaPython,
  'react-developer': FaReact,
  'java-developer': FaJava,
};

const DIFFICULTY_ICONS = {
  easy: (
    <span className="home-difficulty-stars">
      <BsStarFill className="home-star-filled" />
      <BsStar className="home-star-empty" />
      <BsStar className="home-star-empty" />
    </span>
  ),
  medium: (
    <span className="home-difficulty-stars">
      <BsStarFill className="home-star-filled" />
      <BsStarFill className="home-star-filled" />
      <BsStar className="home-star-empty" />
    </span>
  ),
  hard: (
    <span className="home-difficulty-stars">
      <BsStarFill className="home-star-filled" />
      <BsStarFill className="home-star-filled" />
      <BsStarFill className="home-star-filled" />
    </span>
  ),
};

function HomePage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [resumeText, setResumeText] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [startingInterview, setStartingInterview] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    const loadResume = async () => {
      try {
        const data = await getResume();
        if (data) {
          setResumeText(data.text);
          setResumeFileName(data.fileName);
        }
      } catch (error) {
        // No saved resume is okay.
      }
    };

    loadResume();
  }, []);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file.');
      return;
    }

    setUploadingResume(true);
    try {
      const data = await uploadResume(file);
      setResumeText(data.text);
      setResumeFileName(data.fileName);
      toast.success('Resume uploaded successfully!');
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to upload resume';
      toast.error(message);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleStartInterview = async () => {
    if (!selectedRole) {
      toast.error('Please select a role.');
      return;
    }

    if (!resumeText) {
      toast.error('Please upload your resume.');
      return;
    }

    const difficultyConfig = DIFFICULTY_LEVELS.find(
      (item) => item.id === selectedDifficulty
    );
    const totalQuestions = difficultyConfig ? difficultyConfig.questions : 5;

    setStartingInterview(true);
    navigate('/interview', {
      state: {
        role: selectedRole,
        resumeText,
        totalQuestions,
      },
    });
  };

  return (
    <div className="home-page">
      <div className="home-header">
        <h1 className="home-title">Start Interview</h1>
        <p className="home-subtitle">
          Welcome {user?.name?.split(' ')[0]}. Complete these 3 steps to begin
          your mock interview.
        </p>
      </div>

      <div className="home-step-section">
        <h2 className="home-step-heading">1. Select Interview Role</h2>
        <div className="home-roles-grid">
          {INTERVIEW_ROLES.map((role) => {
            const RoleIcon = ROLE_ICONS[role.id];
            return (
              <button
                key={role.id}
                className={`home-role-card ${selectedRole === role.title ? 'home-role-selected' : ''}`}
                onClick={() => setSelectedRole(role.title)}
              >
                {RoleIcon && <RoleIcon className="home-role-icon" />}
                <h3 className="home-role-title">{role.title}</h3>
                <p className="home-role-desc">{role.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="home-step-section">
        <h2 className="home-step-heading">2. Choose Difficulty</h2>
        <div className="home-difficulty-row">
          {DIFFICULTY_LEVELS.map((level) => (
            <button
              key={level.id}
              className={`home-difficulty-card ${selectedDifficulty === level.id ? 'home-difficulty-selected' : ''}`}
              onClick={() => setSelectedDifficulty(level.id)}
            >
              {DIFFICULTY_ICONS[level.id]}
              <h3 className="home-difficulty-label">{level.label}</h3>
              <p className="home-difficulty-desc">{level.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="home-step-section">
        <h2 className="home-step-heading">3. Upload Your Resume</h2>
        <div className="home-resume-area">
          {resumeText ? (
            <div className="home-resume-uploaded">
              <div className="home-resume-info">
                <BsFileEarmarkArrowUp className="home-resume-file-icon" />
                <p className="home-resume-name">{resumeFileName}</p>
              </div>
              <label className="home-change-resume-btn">
                Change
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  hidden
                />
              </label>
            </div>
          ) : (
            <label className="home-upload-zone">
              <BsFileEarmarkArrowUp className="home-upload-icon" />
              <p className="home-upload-text">
                {uploadingResume ? 'Uploading...' : 'Click to upload PDF resume'}
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeUpload}
                disabled={uploadingResume}
                hidden
              />
            </label>
          )}
        </div>
      </div>

      <button
        className={`home-start-btn ${!selectedRole || !resumeText || startingInterview ? 'home-start-btn-disabled' : ''}`}
        onClick={handleStartInterview}
        disabled={!selectedRole || !resumeText || startingInterview}
      >
        {startingInterview ? 'Starting…' : 'Start Interview'}
      </button>
    </div>
  );
}

export default HomePage;
