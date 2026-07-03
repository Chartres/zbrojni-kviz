import { describe, it, expect } from 'vitest'
import { TOPICS, topicFromPath } from './topics'

describe('topicFromPath', () => {
  it('resolves an okruh slug to its category', () => {
    expect(topicFromPath('/okruh/zakon-o-zbranich')?.category).toBe('Zákon o zbraních')
    expect(topicFromPath('/okruh/zakon-o-zbranich/')?.category).toBe('Zákon o zbraních')
  })

  it('returns undefined for non-topic paths', () => {
    expect(topicFromPath('/')).toBeUndefined()
    expect(topicFromPath('/okruh/')).toBeUndefined()
    expect(topicFromPath('/okruh/neexistuje')).toBeUndefined()
    expect(topicFromPath('/okruh/zakon-o-zbranich/extra')).toBeUndefined()
  })

  it('every topic category is a real dataset category', () => {
    const names: string[] = [
      'Zákon o zbraních',
      'Prováděcí předpisy',
      'Jiné předpisy',
      'Nauka o zbraních',
      'Zdravotnické minimum',
    ]
    for (const t of TOPICS) expect(names).toContain(t.category)
  })
})
