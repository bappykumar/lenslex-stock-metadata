
import React, { useEffect, useState } from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-8">
        <div className="p-8 text-center text-sm text-gray-500">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="font-bold text-slate-400">LENSLEX</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-500 italic">Visual Intelligence & Metadata</span>
            </div>
            &copy; {new Date().getFullYear()} LensLex AI. All rights reserved.
        </div>
    </footer>
  );
}

export default Footer;
