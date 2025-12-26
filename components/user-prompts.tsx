import { supabase } from "@/lib/supabase/authclient"
import { useEffect, useState } from "react"
import { useAuth } from "./authprovider"

type MemberPrompt = {
  id: number
  prompt_text: string
  created_at: string
}

export default function UserPrompts() {
  const [prompts, setPrompts] = useState<MemberPrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [textAreaData, setTextAreaData] = useState("")

  const { user } = useAuth()

  useEffect(() => {
    let cancelled = false

    async function loadPrompts(userId: string) {
      setLoading(true)

      try {
        const { data, error } = await supabase
          .from("memberprompts")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })

        if (!cancelled && !error) {
          setPrompts(data ?? [])
        }
      } catch (err) {
        console.error("Prompt load error:", err)
        if (!cancelled) setPrompts([])
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    if (!user) {
      // IMPORTANT: reset state when auth disappears
      setPrompts([])
      setLoading(false)
      return
    }

    loadPrompts(user.id)

    return () => {
      cancelled = true
    }
  }, [user?.id])


  if (loading) return <div>Loading prompts...</div>

  async function insertPrompt() {
    if (!user) return
    if (!textAreaData.trim()) return

    const { data, error } = await supabase.from("memberprompts").insert({
      user_id: user.id,
      prompt_text: textAreaData.trim(),
    })
      .select()
      .single()

    if (!error && data) {
      setPrompts((prev) => [data, ...prev])
      setTextAreaData("") // clear textarea
    }
  }
  return (
    <div style={{ marginTop: 20 }}>
      {prompts.length > 0 && (
        <>
          <label>Existing Prompts</label>
          <br />
          <div className="flex flex-col gap-3">
            {prompts.map((prompt) => (
              <div
                key={prompt.id}
                className="p-3 border rounded"
              >
                {prompt.prompt_text}
              </div>
            ))}
          </div>
        </>
      )}
      <br />
      <label>User Prompt</label>
      <br />
      <textarea
        placeholder="Please enter your prompt"
        rows={10}
        onChange={(e) => setTextAreaData(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          border: "1px solid #727272",
          borderRadius: 5,
          resize: "none",
        }}
      />
      <button onClick={insertPrompt}>Save Prompt</button>
    </div>
  )
}