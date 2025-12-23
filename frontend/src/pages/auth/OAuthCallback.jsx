import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import { getNotifications } from '../../store/slices/notificationSlice';
import api from '../../utils/api';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const refresh = searchParams.get('refresh');
    const error = searchParams.get('error');

    if (error) {
      // Redirect to login with error
      navigate('/login?error=OAuth authentication failed');
      return;
    }

    if (token && refresh) {
      // Store tokens in localStorage
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refresh);

      // Fetch user data using the api instance
      api.get('/auth/me')
        .then(response => {
          const data = response.data;
          if (data.success) {
            dispatch(setCredentials({
              user: data.data,
              accessToken: token,
              refreshToken: refresh
            }));

            // Fetch notifications immediately after OAuth login
            dispatch(getNotifications());

            // Redirect based on user role
            const userRole = data.data.role;
            if (userRole === 'vendor') {
              navigate('/vendor');
            } else if (userRole === 'admin') {
              navigate('/admin');
            } else {
              navigate('/');
            }
          } else {
            navigate('/login?error=Failed to fetch user data');
          }
        })
        .catch(() => {
          navigate('/login?error=Failed to fetch user data');
        });
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
