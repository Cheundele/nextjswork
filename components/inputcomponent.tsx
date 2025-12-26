type LoginFormProps = {
  username: string
  password: string
  message: string
  onUsernameChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: () => void
}

export default function InputFormComponent({
  username,
  password,
  message,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
} : LoginFormProps) {
    return (
        <>
            <input value={username} onChange={(e) => onUsernameChange(e.target.value)} />
            <input type="password" value={password} onChange={(e) => onPasswordChange(e.target.value)} />
            <button onClick={onSubmit}>Log In</button>
            <div className="flex justify-center">{message}</div>
        </>
    )
}