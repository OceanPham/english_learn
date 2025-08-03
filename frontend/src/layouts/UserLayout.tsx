import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import ChatWidget from '../components/ChatWidget/ChatWidget';

const UserLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main > {/* Padding top to account for fixed header */}
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default UserLayout;
