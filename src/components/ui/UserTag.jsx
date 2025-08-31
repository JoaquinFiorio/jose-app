// import React from 'react';

// /**
//  * UserTag component for displaying selected users in email forms
//  * @param {Object} props - Component props
//  * @param {Object} props.user - User object with name and email
//  * @param {Function} props.onRemove - Function to call when removing the tag
//  * @returns {JSX.Element} - Rendered component
//  */
// const UserTag = ({ user, onRemove }) => {
//   // Truncate name to 15 characters if longer
//   const displayName = user.name 
//     ? `${user.name.substring(0, 15)}${user.name.length > 15 ? '...' : ''}` 
//     : user.email;

//   return (
//     <div 
//       className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full flex items-center"
//       title={`${user.name} (${user.email})`}
//     >
//       <span>{displayName}</span>
//       <button 
//         type="button"
//         className="ml-1 text-purple-600 hover:text-purple-800"
//         onClick={onRemove}
//       >
//         ×
//       </button>
//     </div>
//   );
// };

// export default UserTag;