import Interview from '../models/Interview.model.js';
import { askGemini } from './gemini.service.js';
import { generateAudio } from './murf.service.js';
import { parseGeminiJSON } from '../utils/geminiParser.utils.js';
import {
  GENERATE_QUESTIONS_PROMPT,
  INTERVIEW_GREETING_PROMPT,
  FOLLOW_UP_PROMPT,
  FEEDBACK_PROMPT,
  formatQuestionsForFeedback,
  buildConversationHistory,
} from '../constants/prompts.js';

export const startInterview = async (userId, role, resumeText, candidateName, totalQuestions = 5) => {
  const questionsPrompt = GENERATE_QUESTIONS_PROMPT(role, resumeText, totalQuestions);
  const questionsResponse = await askGemini(questionsPrompt);
  const aiQuestions = await parseGeminiJSON(questionsResponse);

  const introQuestion = {
    text: 'Tell me about yourself — your background, what you\'re currently working on, and what excites you about this role.',
    type: 'behavioral'
  };
  
  const questions = [introQuestion, ...aiQuestions];

  const interview = await Interview.create({
    userId,
    role,
    resumeText,
    totalQuestions: questions.length,
    currentQuestion: 1,
    questions,
    status: 'in_progress',
  });

  const greetingPrompt = INTERVIEW_GREETING_PROMPT(role, candidateName);
  const greeting = await askGemini(greetingPrompt);

  interview.messages.push({
    role: 'interviewer',
    content: greeting,
    timestamp: new Date(),
  });

  let audioBase64 = null;
  try {
    audioBase64 = await generateAudio(greeting);
  } catch (audioError) {
    console.error('Audio generation failed, continuing without audio:', audioError.message);
  }

  interview.lastAudio = audioBase64 || '';
  await interview.save();

  return {
    interviewId: interview._id,
    greeting: greeting,
    currentQuestion: 1,
    totalQuestions: questions.length,
    question: introQuestion,
    audio: audioBase64,
  };
};

export const submitAnswer = async (interviewId, userId, answerText) => {
  const interview = await Interview.findOne({ _id: interviewId, userId });
  if (!interview) throw new Error('Interview not found');
  if (interview.status === 'completed') throw new Error('Interview already completed');

  interview.messages.push({
    role: 'candidate',
    content: answerText,
    timestamp: new Date(),
  });

  const nextQuestionIndex = interview.currentQuestion;
  if (nextQuestionIndex >= interview.questions.length) {
    interview.status = 'completed';
    await interview.save();

    const farewellText = 'Thank you for completing the interview! I really enjoyed our conversation. Let me prepare your detailed feedback report.';
    let farewellAudio = null;
    try {
      farewellAudio = await generateAudio(farewellText);
    } catch (audioError) {
      console.error('Farewell audio failed:', audioError.message);
    }

    return { isComplete: true, message: farewellText, audio: farewellAudio };
  }

  const conversationHistory = buildConversationHistory(interview.messages);
  const nextQuestion = interview.questions[nextQuestionIndex];

  const followUpPrompt = FOLLOW_UP_PROMPT(interview.role, conversationHistory, nextQuestion.text);
  const followUpResponse = await askGemini(followUpPrompt);

  interview.messages.push({
    role: 'interviewer',
    content: followUpResponse,
    timestamp: new Date(),
  });

  interview.currentQuestion += 1;
  await interview.save();

  const spokenText = `${followUpResponse} ... ${nextQuestion.text}`;
  let audioBase64 = null;
  try {
    audioBase64 = await generateAudio(spokenText);
  } catch (audioError) {
    console.error('Audio generation failed, continuing without audio:', audioError.message);
  }

  interview.lastAudio = audioBase64 || '';
  await interview.save();

  return {
    isComplete: false,
    response: followUpResponse,
    currentQuestion: interview.currentQuestion,
    totalQuestions: interview.totalQuestions,
    question: nextQuestion,
    audio: audioBase64,
  };
};

export const endInterview = async (interviewId, userId) => {
  const interview = await Interview.findOne({ _id: interviewId, userId });
  if (!interview) {
    const error = new Error('Interview not found');
    error.statusCode = 404;
    throw error;
  }

  if (interview.status === 'completed' && interview.feedback) {
    return {
      interviewId: interview._id,
      feedback: interview.feedback,
      overallScore: interview.overallScore,
    };
  }

  const conversationHistory = buildConversationHistory(interview.messages);
  const questionsOutline = formatQuestionsForFeedback(interview.questions);
  const resumeSnippet =
    (interview.resumeText || '').slice(0, 2000).trim() ||
    '(No resume text stored.)';

  const feedbackPrompt = FEEDBACK_PROMPT(
    interview.role,
    conversationHistory,
    questionsOutline,
    resumeSnippet
  );
  const feedbackResponse = await askGemini(feedbackPrompt);
  const feedback = await parseGeminiJSON(feedbackResponse);

  interview.feedback = feedback;
  interview.overallScore = feedback.overallScore || 0;
  interview.status = 'completed';
  await interview.save();

  return {
    interviewId: interview._id,
    feedback,
    overallScore: feedback.overallScore,
  };
};

export const getInterviewById = async (interviewId, userId) => {
  const interview = await Interview.findOne({ _id: interviewId, userId }).select('-__v');
  if (!interview) {
    const error = new Error('Interview not found');
    error.statusCode = 404;
    throw error;
  }
  return interview;
};