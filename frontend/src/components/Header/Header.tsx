import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../Auth/AuthModal';
import ChatHistoryModal from '../Chat/ChatHistoryModal';
import authService from '../../services/auth.service';
import userService from '../../services/user.service';
import { User } from '../../types/auth.types';

const Header: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isWritingDropdownOpen, setIsWritingDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [availableCredits, setAvailableCredits] = useState<number | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const writingDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchUserDetails = async () => {
    setIsLoadingUser(true);
    setAvailableCredits(null);
    const userFromStorage = authService.getCurrentUser();
    if (userFromStorage?.id) {
      try {
        const detailedInfo = await userService.getUserDetails(userFromStorage.id);
        const updatedUser: User = { ...detailedInfo.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        setAvailableCredits(detailedInfo.credits?.available_credits ?? 0);
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      }
    } else {
      setCurrentUser(null);
      setAvailableCredits(null);
    }
    setIsLoadingUser(false);
  };

  useEffect(() => {
    fetchUserDetails();
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (writingDropdownRef.current && !writingDropdownRef.current.contains(event.target as Node)) {
        setIsWritingDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setAvailableCredits(null);
    setIsDropdownOpen(false);
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsDropdownOpen(false);
  };

  const handleAdminPanelClick = () => {
    navigate('/admin');
    setIsDropdownOpen(false);
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    fetchUserDetails();
  };

  if (isLoadingUser) {
    return (
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600 cursor-pointer" onClick={() => navigate('/')}>
                BandBoost <span className="text-yellow-400">✨</span>
              </span>
            </div>
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-bold text-blue-600 cursor-pointer" onClick={() => navigate('/')}>
              BandBoost <span className="text-yellow-400">✨</span>
            </span>
          </div>

          {currentUser && (
            <div className="hidden md:flex items-center justify-center flex-grow space-x-6 lg:space-x-8">
              <a
                href="#"
                className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors duration-200"
              >
                <span className="mr-1.5 text-lg">💎</span>
                Grammar Checker
              </a>
              <div className="relative" ref={writingDropdownRef}>
                <button
                  onClick={() => setIsWritingDropdownOpen(!isWritingDropdownOpen)}
                  className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                >
                  <span className="mr-1.5 text-lg">✍️</span>
                  Writing
                  <svg
                    className={`ml-1.5 w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      isWritingDropdownOpen ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isWritingDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <button
                      onClick={() => {
                        navigate('/writing');
                        setIsWritingDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      New Writing Task
                    </button>
                    <button
                      onClick={() => {
                        navigate('/writing/scores');
                        setIsWritingDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Writing Scores
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => navigate('/plans')}
                className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors duration-200"
              >
                <svg className="mr-1.5 h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Plans
                {currentUser?.subscription?.plan && (
                  <span className="ml-1.5 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                    {currentUser.subscription.plan}
                  </span>
                )}
              </button>
              {availableCredits !== null && (
                <div className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 bg-yellow-50 border border-yellow-200">
                  <span className="mr-1.5 text-lg">💰</span>
                  Credits: 
                  <span className="ml-1 font-semibold text-yellow-800">
                    {availableCredits > 99999 ? '∞' : availableCredits} 
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center">
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-700 font-medium">
                      {currentUser.full_name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:inline font-medium">{currentUser.full_name || 'User'}</span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      isDropdownOpen ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </button>
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={handleAdminPanelClick}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Admin Panel
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsChatHistoryOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      Chat History
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      <svg className="mr-3 h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign In / Sign Up
              </button>
            )}
          </div>
        </div>
      </div>

      {!currentUser && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={handleAuthSuccess}
        />
      )}

      {currentUser && (
        <ChatHistoryModal
          isOpen={isChatHistoryOpen}
          onClose={() => setIsChatHistoryOpen(false)}
          userId={currentUser.id}
        />
      )}
    </header>
  );
};

export default Header;