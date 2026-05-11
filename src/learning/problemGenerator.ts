import type { SkillId } from './skills';

export interface MathProblem {
  id: string;
  skillId: SkillId;
  prompt: string;
  answer: number | string;
  choices: Array<number | string>;
  hint: string;
}

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function uniqueChoices(answer: number, candidates: number[], count = 3): number[] {
  const values = [answer];
  for (const c of candidates) {
    if (values.length >= count) break;
    if (c >= 0 && c !== answer && !values.includes(c)) values.push(c);
  }
  while (values.length < count) {
    const next = answer + Math.floor(Math.random() * 7) - 3;
    if (next >= 0 && !values.includes(next)) values.push(next);
  }
  return shuffle(values);
}

export function makeProblem(skillId: SkillId = 'add-within-20'): MathProblem {
  switch (skillId) {
    case 'subtract-within-20': {
      const a = 8 + Math.floor(Math.random() * 12);
      const b = 1 + Math.floor(Math.random() * Math.min(9, a));
      const answer = a - b;
      return {
        id: crypto.randomUUID(),
        skillId,
        prompt: `${a} − ${b} = ?`,
        answer,
        choices: uniqueChoices(answer, [answer - 2, answer + 1, answer + 3, b]),
        hint: `Start at ${a} and count back ${b}.`
      };
    }
    case 'missing-addend-10': {
      const a = 1 + Math.floor(Math.random() * 9);
      const answer = 10 - a;
      return {
        id: crypto.randomUUID(),
        skillId,
        prompt: `${a} + __ = 10`,
        answer,
        choices: uniqueChoices(answer, [answer - 1, answer + 1, a]),
        hint: `Think: what does ${a} need to make 10?`
      };
    }
    case 'coins-exact-amount': {
      const amounts = [6, 11, 16, 21, 26, 31, 37, 42, 56, 66, 87];
      const answer = amounts[Math.floor(Math.random() * amounts.length)];
      return {
        id: crypto.randomUUID(),
        skillId,
        prompt: `Collect exactly ${answer}¢`,
        answer,
        choices: [1, 5, 10, 25, 50],
        hint: `Use the biggest useful coins first, then make the leftover amount.`
      };
    }
    case 'tell-time-half-hour': {
      const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const hour = hours[Math.floor(Math.random() * hours.length)];
      const minute = Math.random() < 0.5 ? '00' : '30';
      const answer = `${hour}:${minute}`;
      return {
        id: crypto.randomUUID(),
        skillId,
        prompt: `Set the clock to ${answer}`,
        answer,
        choices: [`${hour}:00`, `${hour}:30`, `${(hour % 12) + 1}:00`],
        hint: `The short hand shows the hour. The long hand shows the minutes.`
      };
    }
    case 'add-within-20':
    default: {
      const a = 2 + Math.floor(Math.random() * 9);
      const b = 2 + Math.floor(Math.random() * 9);
      const answer = a + b;
      return {
        id: crypto.randomUUID(),
        skillId: 'add-within-20',
        prompt: `${a} + ${b} = ?`,
        answer,
        choices: uniqueChoices(answer, [answer - 2, answer + 1, answer + 3, Math.abs(a - b)]),
        hint: answer > 10 ? `Try making 10 first, then add the rest.` : `Count on from ${Math.max(a, b)}.`
      };
    }
  }
}
