import { createContext, useReducer, useEffect, useState } from 'react';
import { authReducer } from './AuthReducer';
import { getUserLogged, loginApi } from '../api/Api';
import { useNavigate } from 'react-router';

interface AuthContextProps {
	status: 'checking' | 'authenticated' | 'not-authenticated'
	token: string | null
	user: any | null
	rol: string
	investmentsProgress: any | null
	loadingSignIn: boolean
	loadUser: () => void
	signIn: (loginData: any) => void
	logOut: () => void
}

const authInitialState: any = {
	status: 'checking',
	token: null,
	user: null,
	rol: '',
	investmentsProgress: null
}

export const AuthContext = createContext({} as AuthContextProps);

export const AuthProvider = ({ children }: any) => {

	const navigate = useNavigate();
	const [state, dispatch] = useReducer(authReducer, authInitialState);
	const [loadingSignIn, setLoadingSignIn] = useState(false);

	useEffect(() => {
		loadUser();
	}, []);

	const loadUser = async () => {
		const token = localStorage.getItem('token');
		if (!token) return dispatch({ type: 'notAuthenticated' });

		try {
			const user_info_response: any = await getUserLogged();

			dispatch({
				type: 'signIn',
				payload: {
					token,
					user: user_info_response,
				}
			});

		} catch (e: any) {
			await localStorage.removeItem('token');
			dispatch({ type: 'notAuthenticated' });
		}
	};

	const signIn = async (data: any) => {
		const { email, password } = data;

		setLoadingSignIn(true);

		try {
			const login_response: any = await loginApi(email, password);

			const { message, token } = login_response;
			await localStorage.setItem('token', token);

			const user_info_response: any = await getUserLogged();

			dispatch({
				type: 'signIn',
				payload: {
					token,
					user: user_info_response.data,
				}
			});

			setLoadingSignIn(false);

			return { message };

		} catch (e: any) {
			setLoadingSignIn(false);
		}
	};

	const logOut = () => {
		localStorage.clear();
		dispatch({ type: 'logout' });
		navigate('/login')
	};

	return (
		<AuthContext.Provider value={{
			...state,
			loadingSignIn,
			loadUser,
			signIn,
			logOut
		}}>
			{children}
		</AuthContext.Provider>
	)
}