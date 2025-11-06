import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postQuestion } from '../services/api';

function AskQuestionPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  // const [tags, setTags] = useState(''); // Future feature
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Call the API service to post the question
      await postQuestion({ title, body });
      
      // On success, redirect to the homepage
      navigate('/');
    } catch (error) {
      console.error('Failed to post question:', error);
      // Check for auth error
      if (error.response && error.response.status === 401) {
        alert('You must be logged in to ask a question.');
        navigate('/login');
      } else {
        alert('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="form-page">
      <div className="card">
        <h2>Ask a Public Question</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Title</label>
            <input
              type="text"
              placeholder="e.g. Is there a faster way to do X in Django?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Body</label>
            <textarea
              placeholder="Include all the information someone would need to answer your question"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            ></textarea>
          </div>
          <div>
            <label>Tags</label>
            <input
              type="text"
              placeholder="e.g. (python django react) - feature coming soon"
              disabled={true}
            />
          </div>
          <button type="submit" className="btn btn-primary">Post Your Question</button>
        </form>
      </div>
    </div>
  );
}

export default AskQuestionPage;

