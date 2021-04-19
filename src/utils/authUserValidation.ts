//Validate Username function
export const validateUsername = (username: string) => {
 const fmtUsername = username.trim().toLocaleLowerCase()

 return fmtUsername.length >= 3 && fmtUsername.length <= 60
}

//Validate email function
export const validateEmail = (email: string) => {
    const fmtEmail = email.trim().toLocaleLowerCase()
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

    return emailRegex.test(fmtEmail)
}

//Validate Password function
export const validatePassword = (password: string) => password.length >= 6 && password.length <= 75