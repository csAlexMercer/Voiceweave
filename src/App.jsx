import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/common/Navbar';

import AuthComponent from './components/auth/AuthComponent';

import HomeComponent from './components/home/HomeComponent';
import CreateWeaveComponent from './components/weave/CreateWeaveComponent';
import JoinWeaveComponent from './components/weave/JoinWeaveComponent';
import MyWeaves from './components/weave/MyWeaves';
import WeaveDashboard from './components/weave/WeaveDashboard';
import CreatePollComponent from './components/poll/CreatePollComponent';
import PollComponent from './components/poll/PollComponent';
import './App.css';

const Layout = ({ children }) => {
    const { currentUser } = useAuth();
    
    return (
      <>
        {currentUser && <Navbar />}
        {children}
      </>
    );
};

function App() {
    return (
        <AuthProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<AuthComponent />} />
                <Route
                  path="/home"
                  element={
                    <ProtectedRoute>
                      <HomeComponent />
                    </ProtectedRoute>
                  }
                />
              
                <Route
                  path="/my-weaves"
                  element={
                    <ProtectedRoute>
                      <MyWeaves />
                    </ProtectedRoute>
                  }
                />
              
                <Route
                  path="/create-weave"
                  element={
                    <ProtectedRoute>
                      <CreateWeaveComponent />
                    </ProtectedRoute>
                  }
                />
              
                <Route
                  path="/join-weave"
                  element={
                    <ProtectedRoute>
                      <JoinWeaveComponent />
                    </ProtectedRoute>
                  }
                />
              
                <Route
                  path="/join/:code"
                  element={
                    <ProtectedRoute>
                      <JoinWeaveComponent />
                    </ProtectedRoute>
                  }
                />
              
                <Route
                  path="/weave/:weaveId"
                  element={
                    <ProtectedRoute>
                      <WeaveDashboard />
                    </ProtectedRoute>
                  }
                />
              
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>

            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </Router>
        </AuthProvider>
    );
}

export default App;
