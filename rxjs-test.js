import {
  pipe,
  of,
  lastValueFrom,
  map,
  concatMap,
  tap,
} from 'rxjs';

const input = () => pipe(
  map(x => x),
)

const retriver = () => pipe(
  concatMap(async input => {
    return {
      input,
      docs: [
        { content: 'abc' },
        { content: 'def' },
        { content: 'ghi' },
      ],
    }
  }),
)

const prompt = () => pipe(
  map(({ input, docs }) => {
    return docs.map(d => d.content).concat(input).join('\n')
  }),
)

const llm = () => pipe(
  concatMap(async x => {
    if (/search/.test(x)) {
      return { type: 'function', value: 'call a function' }
    }
    return { type: 'text', value: '你好啊，我是人工智能，你可以问我问题' }
  }),
)

const agent = (tools) => pipe(
  concatMap(x => of(x).pipe(
    llm(),
    concatMap(x => x.type === 'function' ? of(x.value).pipe(agent(tools)) : of(x) )
  ))
)


const output = () => pipe(
  map(v => v.value),
)

const ai = async (data) => {
  const source$ = of(data)
  .pipe(
    input(),
    retriver(),
    prompt(),
    agent(),
    // llm(),
    output(),
  )

  const result = await lastValueFrom(source$)
  return result
}

ai('search')
.then(console.log)
.catch(console.log)
