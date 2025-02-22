'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { AuthError } from '@supabase/supabase-js'

export default function SignInPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (identifier.trim() === '') {
      newErrors.identifier = "Email or ID is required"
    }

    if (password.trim() === '') {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      setIsLoading(true)
      try {
        let user = null
        let role = ''

        // Check if the identifier is a 9-digit number (potential super admin)
        if (/^\d{9}$/.test(identifier)) {
          // Attempt super admin login
          try {
            const response = await fetch('/api/auth/super_admin/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ adminId: identifier, password }),
            })

            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.error || 'Failed to login as super admin')
            }

            const data = await response.json()
            user = data.user
            role = 'super_admin'
            router.push('/super_admin')
            toast({
              title: "Signed in successfully",
              description: "Welcome back, Super Admin!",
            })
            return
          } catch (error) {
            console.error('Super admin login error:', error)
            // If super admin login fails, continue to regular auth flow
          }
        }

        // Regular authentication flow
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: identifier,
          password: password,
        })

        if (authError) {
          if (authError instanceof AuthError && authError.message === 'Invalid login credentials') {
            throw new Error('Invalid email/ID or password. Please try again.')
          }
          throw authError
        }

        if (!authData.user) {
          throw new Error('Authentication failed. Please try again.')
        }

        // Check user role by querying each table
        const tables = ['admins', 'sub_admins', 'students']
        for (const table of tables) {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .eq('email', authData.user.email)
            .single()

          if (error) {
            console.error(`Error checking ${table}:`, error)
          } else if (data) {
            user = data
            role = table === 'students' ? 'student' : table === 'sub_admins' ? 'sub_admin' : 'admin'
            break
          }
        }

        if (!user || !role) {
          throw new Error('User not found in any role. Please contact support.')
        }

        let redirectPath
        switch (role) {
          case 'admin':
            redirectPath = '/admin/dashboard'
            break
          case 'sub_admin':
            redirectPath = '/sub-admin/dashboard'
            break
          case 'student':
            redirectPath = '/member/dashboard'
            break
          default:
            throw new Error('Invalid user role')
        }

        toast({
          title: "Signed in successfully",
          description: `Welcome back, ${user.name || user.full_name}!`,
        })

        router.push(redirectPath)
      } catch (error) {
        console.error('Login failed:', error)
        toast({
          title: "Sign in failed",
          description: error instanceof Error ? error.message : "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In to ClubConnect</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier">Email or ID</Label>
            <Input
              id="identifier"
              placeholder="Enter your email or ID"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            {errors.identifier && <p className="text-sm text-red-500">{errors.identifier}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          <Link href="/forgot-password" className="text-blue-600 hover:underline">
            Forgot Password?
          </Link>
        </div>
        <div className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}