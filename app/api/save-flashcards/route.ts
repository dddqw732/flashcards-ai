import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { title, description, flashcards, userId } = await request.json()
    
    console.log('Save request received:', { title, flashcardsCount: flashcards?.length, userId })
    
    if (!title || !flashcards || !userId) {
      console.log('Missing required fields:', { title: !!title, flashcards: !!flashcards, userId: !!userId })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create Supabase client with server-side auth
    const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey)
    
    // For now, skip auth verification since we have the userId
    // In production, you should verify the auth token
    console.log('Attempting to save flashcard set for user:', userId)

    // Insert flashcard set
    const { data: flashcardSet, error: setError } = await supabase
      .from('flashcard_sets')
      .insert({
        user_id: userId,
        title,
        description,
      })
      .select()
      .single()

    if (setError) {
      console.error('Error creating flashcard set:', setError)
      console.error('Set error details:', JSON.stringify(setError, null, 2))
      return NextResponse.json(
        { error: 'Failed to create flashcard set: ' + setError.message },
        { status: 500 }
      )
    }

    console.log('Flashcard set created successfully:', flashcardSet)

    // Insert individual flashcards
    const flashcardData = flashcards.map((card: any) => ({
      set_id: flashcardSet.id,
      question: card.question,
      answer: card.answer,
    }))

    const { error: cardsError } = await supabase
      .from('flashcards')
      .insert(flashcardData)

    if (cardsError) {
      console.error('Error creating flashcards:', cardsError)
      console.error('Cards error details:', JSON.stringify(cardsError, null, 2))
      // If flashcards fail to insert, clean up the set
      await supabase.from('flashcard_sets').delete().eq('id', flashcardSet.id)
      
      return NextResponse.json(
        { error: 'Failed to create flashcards: ' + cardsError.message },
        { status: 500 }
      )
    }

    console.log('Flashcards saved successfully, count:', flashcardData.length)

    return NextResponse.json({
      success: true,
      setId: flashcardSet.id,
      message: 'Flashcard set saved successfully'
    })

  } catch (error) {
    console.error('Error in save-flashcards API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 