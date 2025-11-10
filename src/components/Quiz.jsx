import { useState, useCallback, useMemo } from 'react';
import QUESTIONS from '../questions';
import quizCompleteImg from '../assets/quiz-complete.png';
import QuestionTimer from './QuestionTimer';

export default function Quiz() {
    const [answersState, setAnswersState] = useState('ready');
    const [userAnswers, setUserAnswers] = useState([]);
    const activeQuestionIndex = answersState === 'answered' || answersState === 'correct' || answersState === 'wrong' 
        ? userAnswers.length - 1 
        : userAnswers.length;
    const quizIsComplete = activeQuestionIndex === QUESTIONS.length;

    // Shuffle answers - must be called before any early returns (React hooks rule)
    const shuffledAnswers = useMemo(() => {
        if (!QUESTIONS[activeQuestionIndex]) return [];
        const answers = [...QUESTIONS[activeQuestionIndex].answers];
        answers.sort(() => Math.random() - 0.5);
        return answers;
    }, [activeQuestionIndex]);

    const handleSelectAnswer = useCallback(function handleSelectAnswer(selectedAnswer) {
        setAnswersState('answered');
        setUserAnswers((prevUserAnswers) => {
            const currentQuestionIndex = prevUserAnswers.length;
            
            setTimeout(() => {
                if (selectedAnswer === QUESTIONS[currentQuestionIndex].answers[0]) {
                    setAnswersState('correct');
                } else {
                    setAnswersState('wrong');
                }
                setTimeout(() => {
                    setAnswersState('');
                }, 2000);
            }, 1000);
            
            return [...prevUserAnswers, selectedAnswer];
        });
    }, []);
    
    const handleSkipAnswer = useCallback(() => {
        handleSelectAnswer(null);
    }, [handleSelectAnswer]);

    const handleRestartQuiz = () => {
        setUserAnswers([]);
        setAnswersState('ready');
    };

    if (quizIsComplete) {
        // Calculate results
        let correctAnswers = 0;
        let wrongAnswers = 0;
        let skippedAnswers = 0;

        userAnswers.forEach((answer, index) => {
            if (answer === null) {
                skippedAnswers++;
            } else if (answer === QUESTIONS[index].answers[0]) {
                correctAnswers++;
            } else {
                wrongAnswers++;
            }
        });

        const totalQuestions = QUESTIONS.length;
        const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

        return (
            <div id="summary">
                <img src={quizCompleteImg} alt="Quiz Complete" />
                <h2>Quiz Results</h2>
                <div className="results-container">
                    <div className="score-summary">       
                        <p>{correctAnswers} out of {totalQuestions} questions correct</p>
                    </div>
                    
                    <div className="results-breakdown">
                        <div className="result-item correct">
                            <span className="result-label">✅ Correct:</span>
                            <span className="result-count">{correctAnswers}</span>
                        </div>
                        <div className="result-item wrong">
                            <span className="result-label">❌ Wrong:</span>
                            <span className="result-count">{wrongAnswers}</span>
                        </div>
                        <div className="result-item skipped">
                            <span className="result-label">⏭️ Skipped:</span>
                            <span className="result-count">{skippedAnswers}</span>
                        </div>
                    </div>

                    <div className="performance-message">
                        {scorePercentage >= 80 && <p className="excellent">🎉 Excellent! You're a React expert!</p>}
                        {scorePercentage >= 60 && scorePercentage < 80 && <p className="good">👍 Good job! Keep practicing!</p>}
                        {scorePercentage >= 40 && scorePercentage < 60 && <p className="average">📚 Not bad! Consider reviewing the topics.</p>}
                        {scorePercentage < 40 && <p className="needs-improvement">💪 Keep studying! Practice makes perfect!</p>}
                    </div>

                    <button onClick={handleRestartQuiz} className="restart-btn">
                        🔄 Take Quiz Again
                    </button>
                </div>
            </div>
        );
    }

    // Safety check
    if (!QUESTIONS[activeQuestionIndex] || shuffledAnswers.length === 0) {
        return <div>Loading...</div>;
    }
    

    return (
        <div id="quiz">
            <div id="question">
                <QuestionTimer key={activeQuestionIndex} timeout={10000} onTimeout={handleSkipAnswer} />
                <h2>{QUESTIONS[activeQuestionIndex].text}</h2>
                <ul id="answers">
                    {shuffledAnswers.map((answer) => {
                        const isSelected = userAnswers[userAnswers.length - 1] === answer;
                        let cssClasses = '';
                        if (answersState === 'answered' && isSelected) {
                            cssClasses = 'selected';
                        }
                        if ((answersState === 'correct' || answersState === 'wrong') && isSelected) {
                            cssClasses = answersState;
                        }
                        return (
                            <li key={answer} className='answer'>
                                <button onClick={() => handleSelectAnswer(answer)} className={cssClasses}>{answer}</button>
                            </li>
                        )
                    } 
                        
                    )}
                </ul>
            </div>
        </div>
        
        
    )
}