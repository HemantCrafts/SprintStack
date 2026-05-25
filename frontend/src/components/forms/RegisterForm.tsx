import React, {useRef, useState} from "react"

import { cn } from "@/lib/utils"

import {LuLoader2} from 'react-icons/lu';

// import { Icons } from "@/components/icons"
import { Button } from "@components/ui/button"
import { Label } from "@components/ui/label"
import { Input } from "@components/ui/input"
import useRegister from "@hooks/user/useRegister";
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import useGoogleLoginMutation from '@hooks/user/useGoogleLoginMutation';

interface RegisterFormProps extends React.HTMLAttributes<HTMLDivElement> { 
    setRegistered: React.Dispatch<React.SetStateAction<boolean>>;
}

export function RegisterForm({ className, setRegistered, ...props }: RegisterFormProps) {

    const registerQuery = useRegister();
    const [formError, setFormError] = useState<string | null>(null);

    const usernameRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const emailRef = useRef<HTMLInputElement | null>(null);

    const googleLoginQuery = useGoogleLoginMutation();

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) return;
        try {
            const response = await googleLoginQuery.mutateAsync({ credential: credentialResponse.credential });
            if (response.success) {
                // Google accounts are pre-verified, so we can just redirect them to dashboard.
                window.location.href = '/dash';
            }
        }catch (error) {
            if (error instanceof Error) {
                setFormError(error.message);
            } else {
                setFormError("Google signup failed.");
            }
        }
    };

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setFormError(null)

        const username = usernameRef.current?.value.trim();
        const password = passwordRef.current?.value.trim();
        const email = emailRef.current?.value.trim();

        if (!username || !email || !password) {
            setFormError("Please fill all fields before continuing.");
            return;
        }

        try {
            const response = await registerQuery.mutateAsync({ username, email, password });
            if (response.success) {
                setRegistered(true);
            }
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Something went wrong.";

            setFormError(message);
            console.error(error);
        }
    }

    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <form onSubmit={onSubmit}>
                <div className="grid gap-2">
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="username">
                            Username
                        </Label>
                        <Input
                            id="username"
                            placeholder="username"
                            type="text"
                            autoCapitalize="none"
                            autoComplete="username"
                            autoCorrect="off"
                            disabled={registerQuery.isLoading}
                            ref={usernameRef}
                        />
                        <Label className="sr-only" htmlFor="email">
                            Email
                        </Label>
                        <Input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={registerQuery.isLoading}
                            className="mt-1"
                            ref={emailRef}
                        />
                        <Label className="sr-only" htmlFor="password">
                            Password
                        </Label>
                        <Input
                            id="password"
                            placeholder="password"
                            type="password"
                            autoCapitalize="none"
                            autoCorrect="off"
                            disabled={registerQuery.isLoading}
                            className="mt-1"
                            ref={passwordRef}
                        />
                    </div>
                    <Button disabled={registerQuery.isLoading}>
                        {registerQuery.isLoading && (
                            <LuLoader2 className="animate-spin mr-2 h-4 w-4" />
                        )}
                        Create account
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
                    onError={() => setFormError("Google Signup Failed")}
                />
            </div>
            {formError && <p className="text-red-500 text-center">{formError}</p>}
            {registerQuery.isError && <p className="text-red-500 text-center">{registerQuery.error?.message}</p>}
        </div>
    )
}