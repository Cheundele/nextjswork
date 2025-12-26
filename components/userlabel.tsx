type UserLabelProps = {
  username: string
}

export default function UserLabel({username} : UserLabelProps) {
    return (
        <>
            <div className="flex">
                <span className="ml-auto">{username}</span>
            </div>
        </>
    )
}