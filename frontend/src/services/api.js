import axios from 'axios';

// Get tokens from localStorage
const getAuthTokens = () => {
  const tokens = localStorage.getItem('authTokens');
  return tokens ? JSON.parse(tokens) : null;
};

// Create the axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  timeout: 5000,
});

// Add an interceptor to inject the token into every request
apiClient.interceptors.request.use(
  (config) => {
    const tokens = getAuthTokens();
    if (tokens) {
      config.headers['Authorization'] = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const fetchQuestions = () => {
  return apiClient.get('/questions/');
};

export const fetchQuestionById = (id) => {
  return apiClient.get(`/questions/${id}/`);
};

export const postQuestion = (questionData) => {
  // Now this will automatically send the auth header
  return apiClient.post('/questions/', questionData);
};

export const postAnswer = (questionId, body) => {
  return apiClient.post('/answers/', {
    question: questionId,
    body: body,
  });
};

export const voteOnQuestion = (questionId, voteType) => {
  // voteType should be 1 for upvote, -1 for downvote
  return apiClient.post(`/questions/${questionId}/vote/`, {
    vote_type: voteType,
  });
};

