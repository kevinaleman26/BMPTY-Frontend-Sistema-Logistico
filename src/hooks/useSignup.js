import { signUpCliente } from '@/services/authService'
import { useMutation } from '@tanstack/react-query'

export function useSignup() {
    return useMutation({
        mutationFn: signUpCliente
    })
}
