import { createAuthProvider } from 'react-token-auth';
import {baseUrl} from ".";


export const { useAuth, authFetch, login, logout } = createAuthProvider({
    accessTokenKey: 'access_token',
    onUpdateToken: (token) => fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        body: token.refresh_token,
    }).then(response => response.json()),
});
