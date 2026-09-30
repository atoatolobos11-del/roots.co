import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { infoTopics } from '../data/info.js'

const InfoContext = createContext(null)

/**
 * The help / about dialog.
 *
 * Footer links, promo CTAs and the support widget all point at a topic here
 * rather than at hash anchors that do not exist. Opening an unknown topic falls
 * back to the contact details rather than rendering nothing.
 */
export function InfoProvider({ children }) {
  const [topicId, setTopicId] = useState(null)

  const openInfo = useCallback((id) => setTopicId(id in infoTopics ? id : 'contact'), [])
  const closeInfo = useCallback(() => setTopicId(null), [])

  const value = useMemo(
    () => ({ topicId, topic: topicId ? infoTopics[topicId] : null, isOpen: Boolean(topicId), openInfo, closeInfo }),
    [topicId, openInfo, closeInfo],
  )

  return <InfoContext.Provider value={value}>{children}</InfoContext.Provider>
}

export function useInfo() {
  const context = useContext(InfoContext)
  if (!context) throw new Error('useInfo must be used inside <InfoProvider>')
  return context
}
