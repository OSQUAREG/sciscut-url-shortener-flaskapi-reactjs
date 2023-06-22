import React from 'react';

const User = ({ username, email, date_created, date_modified }) => {
    return (
        <div>
            <h2 className="username">{username}</h2>
            <p>{email}</p>
            <small>{date_created}</small>
        </div>
        
    )
};

export default User;