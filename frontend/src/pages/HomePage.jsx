import React, { useState, useEffect } from 'react';
import { fetchQuestions } from '../services/api';
import { Link } from 'react-router-dom';

function HomePage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const response = await fetchQuestions();
        // Handle both paginated and non-paginated responses
        setQuestions(response.data.results || response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="home-page">
      <div className="page-header">
        <h1>Top Questions</h1>
        <Link to="/ask" className="btn btn-primary">
          Ask Question
        </Link>
      </div>
      <div className="question-list">
        {questions.length === 0 ? (
          <div className="card">No questions posted yet.</div>
        ) : (
          questions.map(q => (
            <div key={q.id} className="question-summary">
              <div className="question-stats">
                <div className="stat-item">
                  <span>{q.vote_score || 0}</span>
                  <div>votes</div>
                </div>
                <div className="stat-item">
                  <span>{q.answers ? q.answers.length : 0}</span>
                  <div>answers</div>
                </div>
              </div>
              <div className="question-main">
                <h3>
                  <Link to={`/questions/${q.id}`}>{q.title}</Link>
                </h3>
                <div className="question-author">
                  Asked by {q.author.username} on {new Date(q.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default HomePage;

