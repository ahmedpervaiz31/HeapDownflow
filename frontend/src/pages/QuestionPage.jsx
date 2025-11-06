import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchQuestionById, postAnswer, voteOnQuestion } from '../services/api';
import AuthContext from '../context/AuthContext';

function QuestionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [answerBody, setAnswerBody] = useState('');

  const loadQuestion = async () => {
    try {
      setLoading(true);
      const response = await fetchQuestionById(id);
      setQuestion(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestion();
  }, [id]); // Re-fetch if the ID in the URL changes

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!answerBody.trim()) {
      alert('Answer cannot be empty.');
      return;
    }

    if (!user) {
      alert('You must be logged in to post an answer.');
      navigate('/login');
      return;
    }

    try {
      await postAnswer(id, answerBody);
      setAnswerBody(''); // Clear the textarea
      await loadQuestion(); // Refresh the question to show the new answer
    } catch (err) {
      console.error('Failed to post answer:', err);
      alert('An error occurred while posting your answer.');
    }
  };

  const handleVote = async (voteType) => {
    if (!user) {
      alert('You must be logged in to vote.');
      navigate('/login');
      return;
    }

    try {
      await voteOnQuestion(id, voteType);
      
      // Re-fetch to get the new score
      await loadQuestion();
      
    } catch (err) {
      console.error('Failed to vote:', err);
      alert('An error occurred while voting.');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!question) return <div>Question not found.</div>;

  return (
    <div className="question-detail-page">
      <div className="question-card">
        <div className="vote-controls">
          <button onClick={() => handleVote(1)} className="vote-btn" title="Upvote">▲</button>
          <span className="vote-score">{question.vote_score || 0}</span>
          <button onClick={() => handleVote(-1)} className="vote-btn" title="Downvote">▼</button>
        </div>
        
        <div className="question-content">
          <h2>{question.title}</h2>
          <p className="question-author">
            Asked by {question.author.username} on {new Date(question.created_at).toLocaleString()}
          </p>
          <div className="question-body">
            <p>{question.body}</p>
          </div>
          <div className="tags">
            {question.tags && question.tags.map(tag => (
              <span key={tag.id} className="tag">{tag.name}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="answers-section">
        <h3>{question.answers ? question.answers.length : 0} Answer{question.answers && question.answers.length !== 1 ? 's' : ''}</h3>
        {question.answers && question.answers.length > 0 ? (
          question.answers.map(answer => (
            <div key={answer.id} className="answer-card">
              <p className="answer-author">
                Answered by {answer.author.username} on {new Date(answer.created_at).toLocaleString()}
              </p>
              <div className="answer-body">
                <p>{answer.body}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No answers yet. Be the first to answer!</p>
        )}
      </div>

      <form className="add-answer-form card" onSubmit={handleAnswerSubmit}>
        <h3>Your Answer</h3>
        <textarea
          placeholder="Write your answer here..."
          value={answerBody}
          onChange={(e) => setAnswerBody(e.target.value)}
          required
        ></textarea>
        <button type="submit" className="btn btn-primary">Post Your Answer</button>
      </form>
    </div>
  );
}

export default QuestionPage;
