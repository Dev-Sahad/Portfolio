import { supabase } from '@/lib/supabase'

export const fetchCommentsService = async () => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const likeCommentService = async (
  id: number,
  currentLikes: number
) => {
  const newLikes = (currentLikes || 0) + 1
  const { error } = await supabase
    .from('comments')
    .update({ likes: newLikes })
    .eq('id', id)
  if (error) throw error
  return newLikes
}

export const uploadCommentImageService = async (image: File) => {
  const fileName = `${Date.now()}-${image.name}`
  const { error } = await supabase.storage
    .from('comments')
    .upload(fileName, image)
  if (error) throw error
  const { data } = supabase.storage.from('comments').getPublicUrl(fileName)
  return data.publicUrl
}

export const createCommentService = async ({
  name,
  comment,
  imageUrl,
}: {
  name: string
  comment: string
  imageUrl: string | null
}) => {
  // 1. Save to Supabase
  const { data, error } = await supabase
    .from('comments')
    .insert([{
      name,
      comment,
      image_url: imageUrl,
      likes: 0,
      replies: [],
      is_pinned: false,
    }])
    .select()
    .single()

  if (error) throw error

  // 2. Send notification email + Discord — fire and forget, never blocks the UI
  fetch('/api/notify-comment', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ name, comment, imageUrl }),
  }).catch(() => null)

  return data
}
