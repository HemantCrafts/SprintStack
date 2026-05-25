import React, {useRef, useState} from "react"

import { cn } from "@/lib/utils"

import {LuLoader2} from 'react-icons/lu';
import {BiLogoGoogle} from 'react-icons/bi';

import { Button } from "@components/ui/button"
import { Label } from "@components/ui/label"
import { Input } from "@components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import useLogin from "@hooks/user/useLogin";
import { GoogleLogin } from '@react-oauth/google';
import useGoogleLoginMutation from '@hooks/user/useGoogleLoginMutation';

import { UserCredentials } from "@pages/user/UserLoginPage";

//  Redirect to the dashboard on successful login
//  navigate('/dash', { replace: true });

interface LoginFormProps extends React.HTMLAttributes<HTMLDivElement> { 
    setCredentials: React.Dispatch<React.SetStateAction<UserCredentials>>;
    setMFA: React.Dispatch<React.SetStateAction<boolean>>;
    setOk: React.Dispatch<React.SetStateAction<boolean>>;
}

export function LoginForm({ className, setCredentials, setMFA, setOk, ...props }: LoginFormProps) {
    const loginQuery = useLogin();
    const { toast } = useToast();
    const [formError, setFormError] = useState<string | null>(null);
    
    const usernameRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);

    const googleLoginQuery = useGoogleLoginMutation();

    const handleGoogleSuccess = async (credentialResponse: any) => {
        if (!credentialResponse.credential) return;
        try {
            const response = await googleLoginQuery.mutateAsync({ credential: credentialResponse.credential });
            if (response.success) {
                if (response.user.preferences?.mfa) {
                    setCredentials({username: response.user.username, password: ''});
                    setMFA(response.user.preferences.mfa);
                } else {
                    setOk(true);
                }
            }
        } catch (error: any) {
            setFormError(error?.message || "Google login failed.");
        }
    };

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setFormError(null)

        const username = usernameRef.current?.value.trim();
        const password = passwordRef.current?.value.trim();

        if (!username || !password) {
            setFormError("Please enter your username or email and password.");
            return;
        }

        try {
            const response = await loginQuery.mutateAsync({ username, password });
            if (response.success) {
                if (response.user.preferences.mfa) {
                    setCredentials({username, password});
                    setMFA(response.user.preferences.mfa);
                } else {
                    setOk(true);
                }
            }
        } catch (error: any) {
            const message = error?.message || "Something went wrong.";
            setFormError(message);
            console.error(error);
        }
    }

    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <form onSubmit={onSubmit}>
                <div className="grid gap-2">
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="email">
                            Email or username
                        </Label>
                        <Input
                            id="email"
                            placeholder="Email or username"
                            type="text"
                            autoCapitalize="none"
                            autoComplete="username"
                            autoCorrect="off"
                            disabled={loginQuery.isLoading}
                            ref={usernameRef}
                        />
                        <Input
                            id="password"
                            placeholder="password"
                            type="password"
                            autoCapitalize="none"
                            autoCorrect="off"
                            disabled={loginQuery.isLoading}
                            className="mt-1"
                            ref={passwordRef}
                        />
                    </div>
                    <Button disabled={loginQuery.isLoading}>
                        {loginQuery.isLoading && (
                            <LuLoader2 className="animate-spin mr-2 h-4 w-4" />
                        )}
                        Log In
                    </Button>
                </div>
            </form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>
            </div>
            <div className="flex justify-center w-full">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setFormError("Google Login Failed")}
                />
            </div>
            {formError && <p className="text-red-500 text-center">{formError}</p>}
            {loginQuery.isError && <p className="text-red-500 text-center">{loginQuery.error?.message}</p>}
        </div>
    )
}