import { createAuthProvider } from 'react-token-auth';
import {baseUrl} from ".";


export const { useAuth, authFetch, login, logout } = createAuthProvider({
    accessTokenKey: 'access_token',
    onUpdateToken: (token) => fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        body: token.refresh_token,
    }).then(response => response.json()),
});


export const logoutUser = () => {
    let token = localStorage.getItem("REACT_TOKEN_AUTH_KEY");

    const headers = new Headers({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${JSON.parse(token)}`
    });

    const requestOptions = {
        method: "POST",
        headers: headers,
    };

    fetch(`${baseUrl}/auth/logout`, requestOptions)
        .then(response => {
            // console.log(response.status)
            if (response.status === 200 || response.status === 401) {
                localStorage.removeItem("REACT_TOKEN_AUTH_KEY");
                logout();
                window.location.href = "/login";
            } else {
                throw new Error("Logout Failed, Please try again.");
            }
        })
        .catch(error => console.log(error));
};