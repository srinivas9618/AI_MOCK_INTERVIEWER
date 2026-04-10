import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  getInterview,
  startInterview,
  submitTextAnswer,
  transcribeAudio,
  endInterview,
} from '../../services/interviewService.js';
import VoiceRecorder from '../../components/VoiceRecorder';
import AudioPlayer from '../../components/AudioPlayer';
import { FaUserTie } from 'react-icons/fa';
import {
  BsRecordCircleFill,
  BsKeyboardFill,
  BsCheck,
  BsCheckCircleFill,
  BsXCircleFill,
} from 'react-icons/bs';
import toast from 'react-hot-toast';
import './index.css';

const STATE_SPEAKING = 'speaking';
const STATE_THINKING = 'thinking';
const STATE_LISTENING = 'listening';
const STATE_FAREWELL = 'farewell';

function InterviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ending, setEnding] = useState(false);

  const [interviewerState, setInterviewerState] = useState(STATE_SPEAKING);

  const [showTextFallback, setShowTextFallback] = useState(false);
  const [textAnswer, setTextAnswer] = useState('');


  const [currentAudio, setCurrentAudio] = useState(null);
  const [audioKey, setAudioKey] = useState(0);

  const [currentQuestionNum, setCurrentQuestionNum] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [interviewerText, setInterviewerText] = useState('');
  const [farewellMessage, setFarewellMessage] = useState('');

  /** Only true after interviewer audio (or "read delay") finishes — blocks recording during TTS. */
  const [allowAnswer, setAllowAnswer] = useState(false);
  const isFarewellPhaseRef = useRef(false);

  // TODO: Add useEffect to load interview data using getInterview(id)

  // TODO: Implement handleAudioEnded - transition to listening state after audio finishes

  // TODO: Implement resetAnswerFields - clear text, code, evaluation, and fallback state

  // TODO: Implement processAnswerResult - handle interview flow transitions (complete vs next question)

  // TODO: Implement submitAndProcess - submit text answer and process the result

  // TODO: Implement handleRecordingComplete - transcribe audio blob then submit as text answer

  // TODO: Implement handleSubmitText - validate and submit typed answer

  // TODO: Implement handleSubmitCode - evaluate code submission and process result

  // TODO: Implement handleEndInterview - end interview and navigate to feedback page

  useEffect(() => {
  const loadInterview = async () => {
    try {
      let interviewId = id;
      let initialAudio = location.state?.audio || null;

      // If user just clicked "Start Interview", we land on /interview with state
      // and must create the interview session first.
      if (!interviewId) {
        const role = location.state?.role;
        const resumeText = location.state?.resumeText;
        const totalQuestions = location.state?.totalQuestions;

        if (!role || !resumeText) {
          toast.error('Missing interview setup details. Please start again.');
          navigate('/');
          return;
        }

        const created = await startInterview(role, resumeText, totalQuestions);
        interviewId = created.interviewId;
        initialAudio = created.audio || null;

        // Replace URL with the real interview id.
        navigate(`/interview/${interviewId}`, {
          replace: true,
          state: { audio: initialAudio },
        });
      }

      const data = await getInterview(interviewId);
      setCurrentQuestionNum(data.currentQuestion);
      setTotalQuestions(data.totalQuestions);

      if (data.questions && data.questions.length > 0) {
        const qIndex = data.currentQuestion - 1;
        setCurrentQuestion(data.questions[qIndex] || data.questions[0]);
      }

      const interviewerMsgs = data.messages.filter(
        (m) => m.role === 'interviewer'
      );
      if (data.currentQuestion === 1 && interviewerMsgs.length >= 1) {
        setInterviewerText(interviewerMsgs[0].content);
      } else if (interviewerMsgs.length > 0) {
        setInterviewerText(interviewerMsgs[interviewerMsgs.length - 1].content);
      }

      isFarewellPhaseRef.current = false;

      if (data.currentQuestion === 1) {
        const audio = initialAudio || data.lastAudio;
        if (audio) {
          setCurrentAudio(audio);
          setInterviewerState(STATE_SPEAKING);
          setAllowAnswer(false);
        } else {
          setInterviewerState(STATE_SPEAKING);
          setAllowAnswer(false);
          setTimeout(() => {
            setInterviewerState(STATE_LISTENING);
            setAllowAnswer(true);
          }, 3000);
        }
      } else {
        setInterviewerState(STATE_LISTENING);
        setAllowAnswer(true);
      }
    } catch (error) {
      toast.error('Failed to load interview');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };
  loadInterview();
}, [id, navigate, location.state]);

const handleAudioEnded = () => {
  if (isFarewellPhaseRef.current) return;
  setTimeout(() => {
    setInterviewerState(STATE_LISTENING);
    setAllowAnswer(true);
  }, 3000);
};

const resetAnswerFields = () => {
  setTextAnswer('');
  setShowTextFallback(false);
};

const processAnswerResult = (result) => {
  if (result.isComplete) {
    const farewellText =
      'Thank you for completing the interview! I really enjoyed our conversation. Let me prepare your detailed feedback report...';
    setFarewellMessage(farewellText);
    isFarewellPhaseRef.current = true;
    setInterviewerState(STATE_FAREWELL);
    setAllowAnswer(false);

    if (result.audio) {
      setTimeout(() => {
        setCurrentAudio(result.audio);
        setAudioKey((prev) => prev + 1);
      }, 100);
      setTimeout(() => handleEndInterview(), 10000);
    } else {
      setTimeout(() => handleEndInterview(), 4000);
    }
    return;
  }

  setInterviewerText(result.response);
  setCurrentQuestionNum(result.currentQuestion);
  setCurrentQuestion(result.question);
  setCurrentAudio(result.audio);
  setAudioKey((prev) => prev + 1);
  resetAnswerFields();

  setAllowAnswer(false);
  setInterviewerState(STATE_SPEAKING);
  if (!result.audio) {
    setTimeout(() => {
      setInterviewerState(STATE_LISTENING);
      setAllowAnswer(true);
    }, 3000);
  }
};

const submitAndProcess = async (answerText) => {
  setSubmitting(true);
  setInterviewerState(STATE_THINKING);
  try {
    const result = await submitTextAnswer(id, answerText);
    processAnswerResult(result);
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to submit answer');
    setInterviewerState(STATE_LISTENING);
    setAllowAnswer(true);
  } finally {
    setSubmitting(false);
  }
};

const handleRecordingComplete = async (audioBlob) => {
  setSubmitting(true);
  setInterviewerState(STATE_THINKING);
  try {
    const data = await transcribeAudio(audioBlob);
    const transcript = (data?.text || '').trim();
    const isNoSpeech =
      !transcript ||
      transcript.startsWith('[') ||
      transcript.toLowerCase() === 'silence' ||
      transcript.length < 3;

    if (isNoSpeech) {
      toast.error(
        "I couldn't detect any speech in that recording. Please re-record, or use the text input."
      );
      setInterviewerState(STATE_LISTENING);
      setAllowAnswer(true);
      return;
    }

    const result = await submitTextAnswer(id, transcript);
    processAnswerResult(result);
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to submit answer');
    setInterviewerState(STATE_LISTENING);
    setAllowAnswer(true);
  } finally {
    setSubmitting(false);
  }
};

const handleSubmitText = () => {
  if (!textAnswer.trim()) return toast.error('Please type your answer.');
  submitAndProcess(textAnswer);
};


const handleEndInterview = async () => {
  setEnding(true);
  try {
    await endInterview(id);
    navigate(`/feedback/${id}`);
  } catch (error) {
    toast.error('Failed to generate feedback');
  } finally {
    setEnding(false);
  }
};

  if (loading) {
    return (
      <div className="interview-loading-state">
        <div className="spinner-border interview-loading-spinner" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h2 className="interview-loading-heading">Preparing your interview</h2>
        <p className="interview-loading-text">
          Loading your session and questions…
        </p>
        <div className="interview-loading-steps">
          <div className="interview-loading-step">
            <BsCheckCircleFill className="interview-loading-step-icon-active" />
            <span className="interview-loading-step-label">Connecting</span>
          </div>
          <div className="interview-loading-step">
            <BsCheckCircleFill className="interview-loading-step-icon-active" />
            <span className="interview-loading-step-label">Loading conversation</span>
          </div>
          <div className="interview-loading-step">
            <BsCheckCircleFill className="interview-loading-step-icon-pending" />
            <span className="interview-loading-step-label">Ready to begin</span>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = (currentQuestionNum / totalQuestions) * 100;
  const isSpeaking = interviewerState === STATE_SPEAKING;
  const isThinking = interviewerState === STATE_THINKING;
  const isListening = interviewerState === STATE_LISTENING;
  const isFarewell = interviewerState === STATE_FAREWELL;
  const canAnswer = isListening && allowAnswer;

  return (
    <div className="interview-layout">
      <header className="interview-topbar">
        <div className="topbar-left">
          <span className="topbar-question-label">
            Question {currentQuestionNum} of {totalQuestions}
          </span>
          <div className="topbar-progress-track">
            <div
              className="topbar-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div className="topbar-right">
          {!isFarewell && !isThinking && (
            <button
              className={`topbar-end-btn ${ending || submitting ? 'topbar-end-btn-disabled' : ''}`}
              onClick={handleEndInterview}
              disabled={ending || submitting}
            >
              {ending ? 'Generating Feedback...' : 'End Interview'}
            </button>
          )}
        </div>
      </header>

      <div className="interview-main">
      <section className="interviewer-panel" aria-label="Interviewer">
        <div className="interviewer-avatar-block">
          <div className="interviewer-avatar-circle">
            <FaUserTie className="interviewer-avatar-icon" />
          </div>
          <div className="interviewer-avatar-info">
            <span className="interviewer-avatar-name">Natalie</span>
            <span className="interviewer-avatar-role">AI Interviewer</span>
          </div>
        </div>

        <div className="interviewer-status-block">
          {isSpeaking && (
            <span className="status-text status-speaking">Speaking...</span>
          )}
          {isThinking && (
            <div className="status-thinking-row">
              <div className="spinner-border spinner-border-sm" role="status" />
              <span className="status-text status-thinking">Thinking...</span>
            </div>
          )}
          {isListening && (
            <div className="status-listening-row">
              <BsRecordCircleFill className="status-listening-icon" />
              <span className="status-text status-listening">
                Your turn to answer
              </span>
            </div>
          )}
          {isFarewell && (
            <div className="status-farewell-row">
              <div className="spinner-border spinner-border-sm" role="status" />
              <span className="status-text status-farewell">
                Wrapping up...
              </span>
            </div>
          )}
        </div>

        {currentAudio && (
          <AudioPlayer
            key={audioKey}
            audioBase64={currentAudio}
            autoPlay={true}
            onEnded={handleAudioEnded}
          />
        )}

        {isFarewell && (
          <div className="interviewer-farewell-block">
            <p className="interviewer-farewell-text">{farewellMessage}</p>
            <div className="spinner-border spinner-border-sm" role="status" />
          </div>
        )}

        {!isFarewell && !isThinking && interviewerText && (
          <div className="interviewer-message-block">
            <p className="interviewer-message-text">{interviewerText}</p>
            {canAnswer && currentAudio && (
              <button
                className="interviewer-hear-again-link"
                onClick={() => {
                  setAllowAnswer(false);
                  setAudioKey((prev) => prev + 1);
                  setInterviewerState(STATE_SPEAKING);
                }}
              >
                Hear Again
              </button>
            )}
          </div>
        )}

        {!isFarewell && currentQuestion && !isThinking && (
          <div className="interviewer-question-callout">
            <div className="question-callout-header">
              <span className="question-num-badge">Q{currentQuestionNum}</span>
              <span className="question-type-badge">{currentQuestion.type}</span>
            </div>
            <p className="question-callout-text">{currentQuestion.text}</p>
          </div>
        )}
      </section>

      <section className="answer-panel" aria-label="Your answer">
        {canAnswer && (
          <>
                <div className="voice-answer-block">
                  <div className="voice-block-header">
                    <div>
                      <h3 className="voice-block-title">Record Your Answer</h3>
                      <p className="voice-block-desc">
                        Click record, speak your answer (max 5 min), then submit
                      </p>
                    </div>
                  </div>
                  <div className="voice-block-area">
                    {!submitting && (
                      <VoiceRecorder
                        onRecordingComplete={handleRecordingComplete}
                        disabled={submitting}
                      />
                    )}
                    {submitting && (
                      <div className="processing-indicator">
                        <div
                          className="spinner-border spinner-border-sm"
                          role="status"
                        />
                        <p className="processing-text">
                          Processing your answer...
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-fallback-block">
                  <button
                    className="text-fallback-toggle-btn"
                    onClick={() => setShowTextFallback(!showTextFallback)}
                  >
                    <span className="text-fallback-toggle-label">
                      <BsKeyboardFill className="text-fallback-icon" />
                      {showTextFallback
                        ? 'Hide text input'
                        : 'Prefer typing instead?'}
                    </span>
                    <span
                      className={
                        showTextFallback
                          ? 'toggle-arrow-open'
                          : 'toggle-arrow-closed'
                      }
                    >
                      &#9660;
                    </span>
                  </button>
                  {showTextFallback && (
                    <div className="text-answer-block">
                      <textarea
                        className={`text-answer-textarea ${submitting ? 'text-answer-textarea-disabled' : ''}`}
                        placeholder="Type your answer here..."
                        value={textAnswer}
                        onChange={(e) => setTextAnswer(e.target.value)}
                        rows={4}
                        disabled={submitting}
                      />
                      <button
                        className={`submit-text-btn ${submitting || !textAnswer.trim() ? 'submit-text-btn-disabled' : ''}`}
                        onClick={handleSubmitText}
                        disabled={submitting || !textAnswer.trim()}
                      >
                        {submitting ? 'Submitting...' : 'Submit Text Answer'}
                      </button>
                    </div>
                  )}
                </div>
          </>
        )}

        {isSpeaking && (
          <div className="answer-panel-status">
            <p className="answer-panel-status-text">
              Natalie is speaking... please listen carefully
            </p>
          </div>
        )}
        {isThinking && (
          <div className="answer-panel-status">
            <div className="spinner-border spinner-border-sm" role="status" />
            <p className="answer-panel-status-text">
              Natalie is preparing the next question...
            </p>
          </div>
        )}
        {isFarewell && (
          <div className="answer-panel-status">
            <div className="spinner-border spinner-border-sm" role="status" />
            <p className="answer-panel-status-text">
              Generating your feedback report...
            </p>
          </div>
        )}
      </section>
      </div>

      <footer className="interview-timeline">
        <div className="timeline-dots-row">
          {Array.from({ length: totalQuestions }, (_, i) => {
            const qNum = i + 1;
            const isAnswered = qNum < currentQuestionNum;
            const isCurrent = qNum === currentQuestionNum;
            let dotClass = 'timeline-dot-circle';
            if (isAnswered) dotClass += ' timeline-dot-answered';
            if (isCurrent) dotClass += ' timeline-dot-current';
            return (
              <div key={i} className={dotClass}>
                {isAnswered ? (
                  <BsCheck className="timeline-check-icon" />
                ) : (
                  qNum
                )}
              </div>
            );
          })}
        </div>
      </footer>
    </div>
  );
}

export default InterviewPage;
