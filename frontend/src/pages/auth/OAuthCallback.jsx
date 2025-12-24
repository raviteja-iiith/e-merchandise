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

    // ❌ OAuth failed
    if (error) {
      navigate('/login?error=OAuth authentication failed');
      return;
    }

    // ❌ Missing tokens
    if (!token || !refresh) {
      navigate('/login');
      return;
    }

    // ✅ Store tokens immediately
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refresh);

    // ✅ Fetch user using explicit Authorization header (NO race condition)
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { success, data } = response.data;

        if (!success) {
          navigate('/login?error=Failed to fetch user data');
          return;
        }

        // ✅ Save user + tokens to Redux
        dispatch(
          setCredentials({
            user: data,
            accessToken: token,
            refreshToken: refresh,
          })
        );

        // ✅ Load notifications after login
        dispatch(getNotifications());

        // ✅ Role-based redirect
        if (data.role === 'vendor') {
          navigate('/vendor');
        } else if (data.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } catch (err) {
        navigate('/login?error=Failed to fetch user data');
      }
    };

    fetchUser();
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
