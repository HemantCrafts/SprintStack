import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ROUTES } from '@constants/routes';
import { LoginResponse, SuccessResponse } from './useLogin';

interface GoogleLoginParams {
    credential: string;
}

const useGoogleLoginMutation = () => {
    const queryClient = useQueryClient();

    return useMutation<SuccessResponse, Error, GoogleLoginParams>(
        async ({ credential }) => {
            const response = await fetch('/api/user/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ credential }),
            });

            const data = await response.json() as LoginResponse;
            if (!data.success) {
                throw new Error(data.message);
            } else {
                return data;
            }
        },
        {
            onSuccess: (user) => {
                if (!user.user.preferences.mfa) {
                    queryClient.setQueryData(['user'], user.user);
                }
            }
        }
    );
};

export default useGoogleLoginMutation;
