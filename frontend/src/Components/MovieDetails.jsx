/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './MovieDetails.css';
import Reviews from './Reviews';
import StarRating from './StarRating';
import './Notification';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await axios.get(`https://backend-amber-one-24.vercel.app/movie/${id}`);
        setMovie(response.data);
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError('Error fetching movie details');
      }
    };

    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    if (id) {
      fetchMovieDetails();
    }
  }, [id]);

  const handleWriteReview = () => {
    if (isAuthenticated) {
      setIsWritingReview(true);
      setNotificationMessage(''); // Clear previous notification messages
    } else {
      navigate('/signin'); // Redirect to sign-in page if not authenticated
    }
  };

  const submitReview = async () => {
    if (rating === 0 || reviewText.trim() === '') {
      setNotificationMessage('Please provide both a rating and a review.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `https://backend-amber-one-24.vercel.app/reviews/${id}`,
        {
          rating,
          reviewText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Review submitted:', response.data);
      setNotificationMessage('Review posted!');
      setIsWritingReview(false); // Hide the review form after submission
      setRating(0); // Reset rating
      setReviewText(''); // Reset review text

      // Reload the page after review submission
      window.location.reload();
    } catch (error) {
      console.error('Error submitting review:', error);
      setNotificationMessage('Review Posted!!');

      // Reload the page on error
      window.location.reload();
    }
  };

  const cancelReview = () => {
    setIsWritingReview(false); // Hide the review form
    setRating(0); // Reset rating
    setReviewText(''); // Reset review text
    setNotificationMessage(''); // Reset notification message
  };

  const renderContent = () => {
    if (error) {
      return <div>{error}</div>;
    }

    if (!movie) {
      return <div>Loading...</div>;
    }

    return (
      <div className="main-content">
       <a> <Link to="/" className="back-link">
       <FontAwesomeIcon icon={faArrowLeft} />Back to Home
        </Link></a>
        <div className="movie-details-container">
          <img className="poster" src={movie.URL} alt={movie.Name} />
          <div className="movie-details">
            <h1>{movie.Name}</h1>
            <p>Director: {movie.Director}</p>
            <p>{movie.Description}</p>
            <p>Release Date: {movie.ReleaseDate}</p>
            <div className="rating-container">
              <label>Rating: </label>
              <StarRating rating={movie.Ratings} isInteractive={false} />
            </div>
            <p>Cast: {movie.Cast}</p>
            <p>Genre: {movie.Genre}</p>
            <button onClick={handleWriteReview}>Rate this Movie</button>
          </div>
        </div>
        <Reviews movieId={movie._id} />
        {isWritingReview && (
          <div className="review-form active">
            <h2>Enter Review</h2>
            <label>Rating:</label>
            <StarRating rating={rating} setRating={setRating} />
            <label>Review:</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows="4"
              cols="50"
            />
            {notificationMessage && <div className="review-notification">{notificationMessage}</div>}
            <div className="review-form-buttons">
              <button
                onClick={submitReview}
                style={{
                  backgroundColor: 'transparent',
                  border: '2px solid #28a745',  /* Green border */
                  borderRadius: '20px',
                  padding: '10px 20px',
                  color: '#28a745',  /* Green text color */
                  cursor: 'pointer',
                  transition: 'background-color 0.3s, color 0.3s',
                  marginTop: '20px'
                }}
              >
                Submit Review
              </button>
              <button
                onClick={cancelReview}
                className="cancel-button"
                style={{
                  backgroundColor: 'transparent',
                  border: '2px solid #dc3545',  /* Red border */
                  borderRadius: '20px',
                  padding: '10px 20px',
                  color: '#dc3545',  /* Red text color */
                  cursor: 'pointer',
                  transition: 'background-color 0.3s, color 0.3s, border-color 0.3s'  /* Smooth transition for hover effect */
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="movie-details-page">
      {renderContent()}
    </div>
  );
};

export default MovieDetails;
