import { useState, useEffect } from 'react';
import { FiStar, FiTrash2, FiEye, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [statusFilter, ratingFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/admin/reviews?status=${statusFilter}&rating=${ratingFilter}`);
      setReviews(data.data.reviews || []);
    } catch (error) {
      toast.error('Failed to load reviews');
      setReviews([
        { _id: '1', user: { name: 'John Doe' }, product: { name: 'Premium Wireless Headphones' }, rating: 5, comment: 'Excellent product! Sound quality is amazing.', isApproved: true, createdAt: new Date('2024-12-15') },
        { _id: '2', user: { name: 'Jane Smith' }, product: { name: 'Smart Watch Pro' }, rating: 4, comment: 'Good value for money. Battery life could be better.', isApproved: true, createdAt: new Date('2024-12-16') },
        { _id: '3', user: { name: 'Bob Johnson' }, product: { name: 'Gaming Keyboard' }, rating: 1, comment: 'This product is terrible. Contains spam content.', isApproved: false, createdAt: new Date('2024-12-17') },
        { _id: '4', user: { name: 'Alice Williams' }, product: { name: 'Premium Wireless Headphones' }, rating: 5, comment: 'Best headphones I ever bought!', isApproved: true, createdAt: new Date('2024-12-18') },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/admin/reviews/${id}/approve`);
      toast.success('Review approved');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to approve review');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/admin/reviews/${id}/reject`);
      toast.success('Review rejected');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to reject review');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      toast.success('Review deleted');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar key={star} className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} size={16} />
        ))}
      </div>
    );
  };

  const filteredReviews = reviews;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Reviews</h1>
        <p className="text-gray-600 mt-1">Moderate product reviews and ratings</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Total Reviews</p>
          <p className="text-2xl font-bold text-gray-800">{reviews.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">{reviews.filter(r => r.isApproved).length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{reviews.filter(r => !r.isApproved).length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Average Rating</p>
          <p className="text-2xl font-bold text-yellow-600">{reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0} ★</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
            <option value="all">All Reviews</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
          <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="font-semibold text-gray-900">{review.user?.name}</div>
                  {renderStars(review.rating)}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${review.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{review.isApproved ? 'Approved' : 'Pending'}</span>
                </div>
                <div className="text-sm text-indigo-600 mb-2">Product: {review.product?.name}</div>
                <p className="text-gray-700 mb-2">{review.comment}</p>
                <div className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="flex gap-2 ml-4">
                {!review.isApproved && (
                  <button onClick={() => handleApprove(review._id)} className="text-green-600 hover:text-green-900" title="Approve"><FiCheckCircle size={20} /></button>
                )}
                {review.isApproved && (
                  <button onClick={() => handleReject(review._id)} className="text-yellow-600 hover:text-yellow-900" title="Reject"><FiXCircle size={20} /></button>
                )}
                <button onClick={() => setSelectedReview(review)} className="text-indigo-600 hover:text-indigo-900" title="View Details"><FiEye size={20} /></button>
                <button onClick={() => handleDelete(review._id)} className="text-red-600 hover:text-red-900" title="Delete"><FiTrash2 size={20} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Review Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="font-semibold">{selectedReview.user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Product</p>
                <p className="font-semibold">{selectedReview.product?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                {renderStars(selectedReview.rating)}
              </div>
              <div>
                <p className="text-sm text-gray-600">Review</p>
                <p className="text-gray-700">{selectedReview.comment}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p>{new Date(selectedReview.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedReview.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{selectedReview.isApproved ? 'Approved' : 'Pending'}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setSelectedReview(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Close</button>
              {!selectedReview.isApproved && (
                <button onClick={() => { handleApprove(selectedReview._id); setSelectedReview(null); }} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Approve</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;