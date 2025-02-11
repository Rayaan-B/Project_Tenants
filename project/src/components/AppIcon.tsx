import { forwardRef } from 'react';

const AppIcon = forwardRef<SVGSVGElement>((_, ref) => {
  return (
    <svg
      ref={ref}
      width="512"
      height="512"
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect width="512" height="512" rx="128" fill="#8B5CF6" />
      
      {/* Building Icon */}
      <path
        d="M156 156H356C367.046 156 376 164.954 376 176V376C376 387.046 367.046 396 356 396H156C144.954 396 136 387.046 136 376V176C136 164.954 144.954 156 156 156Z"
        fill="white"
        fillOpacity="0.9"
      />
      
      {/* Windows */}
      <rect x="176" y="196" width="60" height="60" rx="8" fill="#8B5CF6" />
      <rect x="276" y="196" width="60" height="60" rx="8" fill="#8B5CF6" />
      <rect x="176" y="296" width="60" height="60" rx="8" fill="#8B5CF6" />
      <rect x="276" y="296" width="60" height="60" rx="8" fill="#8B5CF6" />
    </svg>
  );
});

export default AppIcon;
