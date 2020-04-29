function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined
}

class WordFrequencyCounter {
  constructor(private sitemapUrl: string) {}

  public async start() {
    const outputElement = document.getElementById("output")
    if (outputElement === null) {
      return
    }

    outputElement.innerHTML = "Fetching..."

    const response = await fetch(this.sitemapUrl)
    const sitemapString = await response.text()
    const parser = new DOMParser()
    const sitemap = parser.parseFromString(sitemapString, "application/xml")
    const pageUrls = Array.from(sitemap.querySelectorAll("loc"))
      .map((loc) => loc.textContent)
      .filter(notEmpty)

    outputElement.innerHTML = pageUrls.join("\n")

    const fetchWordsTasks = pageUrls.map((pageUrl) => this.fetchWords(pageUrl))
    const minimumWordLength = 5
    const words = (await Promise.all(fetchWordsTasks))
      .flat()
      .filter((word) => word.length >= minimumWordLength)

    const occurrencesObject = words.reduce<{
      [index: string]: { word: string; count: number }
    }>(
      (accumulator, word) => (
        (accumulator[word.toLowerCase()] = {
          word: word,
          count: (accumulator[word.toLowerCase()]?.count || 0) + 1,
        }),
        accumulator
      ),
      {}
    )

    const occurrencesArray: Array<{ word: string; count: number }> = []
    for (var prop in occurrencesObject) {
      if (occurrencesObject.hasOwnProperty(prop)) {
        occurrencesArray.push(occurrencesObject[prop])
      }
    }

    const sorted = occurrencesArray.sort(
      (wordCountA, wordCountB) => wordCountB.count - wordCountA.count
    )

    outputElement.innerHTML += "\n"

    sorted
      .slice(0, 50)
      .forEach(
        (wordCount) =>
          (outputElement.innerHTML += `\n${wordCount.word}: ${wordCount.count}`)
      )
  }

  private async fetchWords(pageUrl: string): Promise<Array<string>> {
    const response = await fetch(pageUrl)
    const html = await response.text()
    const parser = new DOMParser()
    const document = parser.parseFromString(html, "text/html")
    // TODO: Filter out scripts and CSS. Try with a positive list including only look at h* and p elements?
    // TODO: Also look at the title and the meta description.
    // TODO: Weight title, description and headers higher.
    const content = document.querySelector("body")?.innerText
    if (content === undefined) {
      return []
    }

    const words = content
      .replace(/[^a-zA-ZæøåÆØÅ0-9]/g, " ")
      .split(" ")
      .map((word) => word.trim())
      .filter((word) => word !== "")
    return words
  }
}

function start(sitemapUrl: string) {
  event?.preventDefault()
  const counter = new WordFrequencyCounter(sitemapUrl)
  counter.start()
}
