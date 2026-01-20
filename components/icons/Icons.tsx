
import React from 'react';

type IconProps = React.ComponentProps<'svg'>;

export const DXMetaDataLogoIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className || "w-8 h-8 text-indigo-500"}
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M2.25 6a3 3 0 013-3h13.5a3 3 0 013 3v12a3 3 0 01-3 3H5.25a3 3 0 01-3-3V6zm3.97.97a.75.75 0 011.06 0l2.25 2.25a.75.75 0 010 1.06l-2.25 2.25a.75.75 0 01-1.06-1.06l1.72-1.72-1.72-1.72a.75.75 0 010-1.06zm4.28 4.28a.75.75 0 000 1.06l2.25 2.25a.75.75 0 001.06-1.06l-1.72-1.72 1.72-1.72a.75.75 0 00-1.06-1.06l-2.25 2.25z"
      clipRule="evenodd"
    />
  </svg>
);

export const UploadIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className || "w-10 h-10 mb-4 text-gray-500"}
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
    />
  </svg>
);

export const LoadingSpinner: React.FC<IconProps> = ({ className, ...props }) => (
  <svg
    className={className || "animate-spin h-5 w-5 text-white"}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

export const FileIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className || "w-12 h-12"}
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
    />
  </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={className || "w-4 h-4"} {...props}>
        <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.71l.5 5a.75.75 0 0 1-1.474.14l-.5-5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .71.787l-.5 5a.75.75 0 1 1-1.474-.14l.5-5a.75.75 0 0 1 .764-.647Z" clipRule="evenodd" />
    </svg>
);

export const CopyIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={className || "w-4 h-4"} {...props}>
        <path d="M5.75 2a.75.75 0 0 0-.75.75v.5h-1.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h6.5a.75.75 0 0 0 .75-.75v-8.5a.75.75 0 0 0-.75-.75h-1.5v-.5A.75.75 0 0 0 8.25 2h-2.5ZM6.5 3.25V4h3V3.25a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0-.75.75ZM4.5 5.5A.75.75 0 0 0 3.75 6v7.25c0 .414.336.75.75.75h7.5a.75.75 0 0 0 .75-.75V6a.75.75 0 0 0-.75-.75h-7.5Z" />
    </svg>
);

export const RegenerateIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={className || "w-4 h-4"} {...props}>
        <path fillRule="evenodd" d="M10.75 2a.75.75 0 0 0-1.5 0v1.512a4.5 4.5 0 0 0-7.386 2.375.75.75 0 0 0 1.458.388A3 3 0 0 1 8.5 4.502V6A.75.75 0 0 0 10 6V4.5h.75a.75.75 0 0 0 0-1.5H10V2ZM3.291 8.342A.75.75 0 0 0 2.25 9.5v2.25a.75.75 0 0 0 1.5 0v-1.512a4.5 4.5 0 0 0 7.386-2.375.75.75 0 0 0-1.458-.388A3 3 0 0 1 7.5 11.498V10a.75.75 0 0 0-1.5 0v1.5H5.25a.75.75 0 0 0 0 1.5H6v.75a.75.75 0 0 0 1.5 0V14a4.5 4.5 0 0 0 4.5-4.5.75.75 0 0 0-1.5 0A3 3 0 0 1 7.5 12.5a3 3 0 0 1-3-3 .75.75 0 0 0-1.209-.858Z" clipRule="evenodd" />
    </svg>
);

export const TitleIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={className || "w-4 h-4"} {...props}>
        <path d="M4 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H4ZM3 3a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3Z" />
        <path d="M8 5.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V6.25A.75.75 0 0 1 8 5.5ZM5.25 4.5a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5h-5.5Z" />
    </svg>
);

export const TagsIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={className || "w-4 h-4"} {...props}>
        <path d="M2 3.25A1.25 1.25 0 0 1 3.25 2h9.5A1.25 1.25 0 0 1 14 3.25v9.5A1.25 1.25 0 0 1 12.75 14h-9.5A1.25 1.25 0 0 1 2 12.75v-9.5ZM3.25 3a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25h-9.5Z" />
        <path d="M5 5.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Zm0 3a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5 8.25Zm.75 2.25a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5Z" />
    </svg>
);

export const ClearIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={className || "w-4 h-4"} {...props}>
        <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.71l.5 5a.75.75 0 0 1-1.474.14l-.5-5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .71.787l-.5 5a.75.75 0 1 1-1.474-.14l.5-5a.75.75 0 0 1 .764-.647Z" clipRule="evenodd" />
    </svg>
);

export const ExportIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={className || "w-4 h-4"} {...props}>
        <path d="M2 6.75A.75.75 0 0 1 2.75 6h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 6.75Z" />
        <path d="M2 10.75A.75.75 0 0 1 2.75 10h10.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" />
        <path d="M5.47 2.47a.75.75 0 0 1 1.06 0l2.5 2.5a.75.75 0 0 1-1.06 1.06L7 4.811V13.5a.75.75 0 0 1-1.5 0V4.811L4.47 6.03a.75.75 0 0 1-1.06-1.06l2.06-2.06Z" />
    </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-5 h-5 text-gray-300"} {...props}>
        <path fillRule="evenodd" d="M11.078 2.25c-.217 0-.424.034-.622.093l-1.42.475a3.75 3.75 0 0 0-2.093 2.093l-.475 1.42a4.64 4.64 0 0 1-.093.622 3.75 3.75 0 0 0 0 5.482 4.64 4.64 0 0 1 .093.622l.475 1.42a3.75 3.75 0 0 0 2.093 2.093l1.42.475c.198.059.405.093.622.093a3.75 3.75 0 0 0 5.482 0 4.64 4.64 0 0 1 .622-.093l1.42-.475a3.75 3.75 0 0 0 2.093-2.093l.475-1.42a4.64 4.64 0 0 1 .093-.622 3.75 3.75 0 0 0 0-5.482 4.64 4.64 0 0 1-.093-.622l-.475-1.42a3.75 3.75 0 0 0-2.093-2.093l-1.42-.475a4.64 4.64 0 0 1-.622-.093 3.75 3.75 0 0 0-5.482 0ZM10 7.25a2.75 2.75 0 1 0 0 5.5 2.75 2.75 0 0 0 0-5.5Z" clipRule="evenodd" />
        <path d="M12.25 10a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
);
