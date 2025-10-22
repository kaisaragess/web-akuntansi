import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-white text-center py-4">
      <p>© {new Date().getFullYear()} Kasku. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
