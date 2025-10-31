import Link from 'next/link';
import { ViralBoostLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
            <path d="M10 2c1 .5 2 2 2 5" />
        </svg>
    )
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10Z" />
            <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
            <path d="M12 2v1.4a6.6 6.6 0 0 1 0 17.2V22" />
            <path d="M22 12h-1.4a6.6 6.6-0 0 1-17.2 0H2" />
        </svg>

    )
}

export default function LoginPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md mx-auto">
                <CardHeader className="text-center space-y-4">
                    <div className="inline-flex justify-center items-center gap-2">
                        <ViralBoostLogo className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-headline font-bold text-foreground">ViralBoost AI</h1>
                    </div>
                    <CardTitle className="text-2xl font-headline">Welcome Back, Creator!</CardTitle>
                    <CardDescription>Sign in to transform your content strategy.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline">
                            <GoogleIcon className="mr-2 h-4 w-4" />
                            Google
                        </Button>
                        <Button variant="outline">
                            <AppleIcon className="mr-2 h-4 w-4" />
                            Apple
                        </Button>
                    </div>
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="creator@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                                <Link href="#" className="ml-auto inline-block text-sm underline" prefetch={false}>
                                    Forgot your password?
                                </Link>
                            </div>
                            <Input id="password" type="password" required />
                        </div>
                        <Link href="/dashboard" className="w-full">
                            <Button className="w-full font-bold">Sign In</Button>
                        </Link>
                    </div>
                    <div className="mt-6 text-center text-sm">
                        Don&apos;t have an account?{' '}
                        <Link href="#" className="underline" prefetch={false}>
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
