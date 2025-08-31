type AuthAction =
	| {
		type: 'signIn',
		payload: {
			token: string
			user: any
		}
	}
	| {
		type: 'updateUser',
		payload: {
			user: any
		}
	}
	| { type: 'notAuthenticated' }
	| { type: 'logout' }

export const authReducer = (state: any, action: AuthAction): any => {

	switch (action.type) {
		case 'signIn':
			return {
				...state,
				status: 'authenticated',
				token: action.payload.token,
				user: action.payload.user,
			}

		case 'updateUser':
			return {
				...state,
				user: action.payload.user,
			}

		case 'logout':
		case 'notAuthenticated':
			return {
				...state,
				status: 'not-authenticated',
				token: null,
				user: null,
				rol: '',
				investmentsProgress: null
			}

		default:
			return state;
	}
}; 