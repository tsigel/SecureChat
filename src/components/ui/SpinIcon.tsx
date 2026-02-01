import React from 'react';

export const SpinIcon = (props: React.SVGProps<SVGSVGElement>) => {
    return (
        <>
            <style>{`
        
        @keyframes spin-latch {
          0% { transform: rotate(0deg); }
          2% { transform: rotate(360deg); }
          100% { transform: rotate(360deg); }
        }
        .animated-latch {
          animation: spin-latch 20s ease-out infinite;
          transform-origin: 16px 16px;
        }
      `}</style>
            <svg
                width="38"
                height="32"
                viewBox="0 0 38 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                {...props}
            >
                {/* Корпус */}
                <path
                    d="M22 0C27.5228 0 32 4.47715 32 10V20C32 21.6689 34.6252 25.7932 36.6602 28.7402C37.5982 30.0987 36.6362 31.9999 34.9854 32H10C4.47715 32 0 27.5228 0 22V10C0 4.47715 4.47715 2.06162e-06 10 0H22ZM12 4C7.58172 4 4 7.58172 4 12V20C4 24.4183 7.58172 28 12 28H20C24.4183 28 28 24.4183 28 20V12C28 7.58173 24.4183 4.00001 20 4H12Z"
                    fill="#00BC7D"
                />
                {/* Вращающаяся защелка */}
                <path
                    d="M16 11C17.6566 11 18.9999 12.3779 19 14.0771C18.9998 15.2151 18.3955 16.2061 17.5 16.7383V19.4619C17.4998 20.3114 16.8282 21 16 21C15.1718 21 14.5002 20.3114 14.5 19.4619V16.7383C13.6046 16.2061 13.0002 15.2151 13 14.0771C13.0001 12.378 14.3435 11.0001 16 11Z"
                    fill="#00BC7D"
                    className="animated-latch"
                />
            </svg>
        </>
    );
};
