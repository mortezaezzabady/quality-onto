const indexesOf = (substr: string) => ({
  in: (str: string) =>
    str
      .split(substr)
      .slice(0, -1)
      .map((x) => x.length)
      .map((_, i, lengths) => lengths.slice(0, i + 1).reduce((a, b) => a + b, i * substr.length))
})

export default indexesOf
